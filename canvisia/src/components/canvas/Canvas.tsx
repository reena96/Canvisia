import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Stage, Layer, Circle } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useCanvasStore } from '@/stores/canvasStore'
import { CANVAS_CONFIG } from '@/config/canvas.config'
import { calculateZoom, screenToCanvas } from '@/utils/canvasUtils'
import { CursorOverlay } from './CursorOverlay'
import { useCursors } from '@/hooks/useCursors'
import { usePresence } from '@/hooks/usePresence'
import { useAuth } from '@/components/auth/AuthProvider'
import { Toolbar, type Tool } from './Toolbar'
import { ShapeRenderer } from './ShapeRenderer'
import {
  createDefaultRectangle,
  createDefaultCircle,
  createDefaultLine,
  createDefaultText,
  createDefaultTriangle,
  createDefaultPentagon,
  createDefaultHexagon,
  createDefaultStar,
  createDefaultArrow,
  createDefaultBidirectionalArrow,
  createDefaultBentConnector,
} from '@/utils/shapeDefaults'
import { useFirestore } from '@/hooks/useFirestore'
import { getUserColor } from '@/config/userColors'
import { throttle } from '@/utils/throttle'
import type { Shape } from '@/types/shapes'
import { getShapeName } from '@/utils/shapeNames'

interface CanvasProps {
  onPresenceChange?: (activeUsers: import('@/types/user').Presence[]) => void
}

export function Canvas({ onPresenceChange }: CanvasProps = {}) {
  const stageRef = useRef<any>(null)
  const viewport = useCanvasStore((state) => state.viewport)
  const updateViewport = useCanvasStore((state) => state.updateViewport)
  const { user } = useAuth()

  // Local state for tools and selection
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  // Pan state (for spacebar + drag)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)

  // Optimistic updates: store local shape updates that haven't synced to Firestore yet
  const [localShapeUpdates, setLocalShapeUpdates] = useState<Record<string, Partial<Shape>>>({})

  // Error handling state
  const [error, setError] = useState<string | null>(null)

  // Setup canvas and user tracking
  const canvasId = 'default-canvas' // TODO: Get from canvas context/router
  const userId = user?.uid || ''
  const userName = user?.displayName || 'Anonymous'
  const userColor = getUserColor(userName)

  // Setup cursor tracking
  const { cursors, updateCursor } = useCursors(canvasId, userId, userName, userColor)

  // Setup presence tracking
  const { activeUsers } = usePresence(canvasId, userId, userName, userColor)

  // Notify parent of presence changes
  useEffect(() => {
    if (onPresenceChange) {
      onPresenceChange(activeUsers)
    }
  }, [activeUsers, onPresenceChange])

  // Setup Firestore sync for shapes
  const { shapes: firestoreShapes, loading, createShape, updateShape, deleteShape } = useFirestore(canvasId)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Delete key - remove selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeId) {
          e.preventDefault()
          try {
            await deleteShape(selectedShapeId)
            setSelectedShapeId(null)
          } catch (err) {
            console.error('Failed to delete shape:', err)
            setError('Failed to delete shape. Please try again.')
          }
        }
      }

      // Escape key - deselect shape
      if (e.key === 'Escape') {
        if (selectedShapeId) {
          e.preventDefault()
          setSelectedShapeId(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShapeId, deleteShape])

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Merge Firestore shapes with local optimistic updates
  const shapes = useMemo(() => {
    return firestoreShapes.map((shape) => ({
      ...shape,
      ...(localShapeUpdates[shape.id] || {}),
    })) as Shape[]
  }, [firestoreShapes, localShapeUpdates])

  // Throttled Firestore update function (10-20 updates per second)
  // Using 50ms = 20 updates/sec, 100ms = 10 updates/sec
  const updateShapeThrottled = useMemo(
    () =>
      throttle((shapeId: string, updates: Partial<Shape>) => {
        updateShape(shapeId, updates).catch((error) => {
          console.error('Throttled shape update failed:', error)
        })
      }, 50), // 20 updates per second
    [updateShape]
  )

  // Optimistic local update (immediate UI feedback)
  const updateShapeLocal = useCallback((shapeId: string, updates: Partial<Shape>) => {
    setLocalShapeUpdates((prev) => ({
      ...prev,
      [shapeId]: { ...(prev[shapeId] || {}), ...updates },
    }))
  }, [])

  // Clear local updates when Firestore syncs back
  useMemo(() => {
    // When firestoreShapes change, clear local updates for those shapes
    setLocalShapeUpdates((prev) => {
      const updated = { ...prev }
      firestoreShapes.forEach((shape) => {
        if (updated[shape.id]) {
          delete updated[shape.id]
        }
      })
      return updated
    })
  }, [firestoreShapes])

  // Handle scroll - pan or zoom based on modifier keys (Figma-style)
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    // Cmd/Ctrl + scroll = zoom (like Figma)
    if (e.evt.metaKey || e.evt.ctrlKey) {
      // Get pointer position
      const pointerPosition = stage.getPointerPosition()
      if (!pointerPosition) return

      // Calculate zoom delta (negative for zoom in, positive for zoom out)
      // Increased sensitivity (0.005) for Figma-like touchpad zoom
      const zoomDelta = -e.evt.deltaY * 0.005

      // Calculate new viewport centered on pointer
      const newViewport = calculateZoom(
        viewport.zoom,
        zoomDelta,
        pointerPosition.x,
        pointerPosition.y,
        viewport
      )

      updateViewport(newViewport)
    } else {
      // Regular scroll = pan up/down (like Figma)
      // deltaY: positive = scroll down, negative = scroll up
      // We want: scroll down = move viewport down (canvas moves up)
      updateViewport({
        x: viewport.x - e.evt.deltaX,
        y: viewport.y - e.evt.deltaY,
      })
    }
  }

  // Handle spacebar for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        e.preventDefault()
        setIsPanning(true)
        document.body.style.cursor = 'grab'
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanning(false)
        setPanStart(null)
        document.body.style.cursor = 'default'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPanning])

  // Handle mouse move to broadcast cursor position and pan
  const handleMouseMove = (_e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Always track mouse position for tooltips
    setMousePosition(pointerPosition)

    // Handle panning with spacebar + drag
    if (isPanning) {
      if (panStart) {
        const dx = pointerPosition.x - panStart.x
        const dy = pointerPosition.y - panStart.y
        updateViewport({
          x: viewport.x + dx,
          y: viewport.y + dy,
        })
        setPanStart(pointerPosition)
        document.body.style.cursor = 'grabbing'
      }
      return
    }

    // Only track cursor if user is authenticated
    if (!user) return

    // Convert screen coordinates to canvas coordinates
    const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
    updateCursor(canvasPos.x, canvasPos.y)
  }

  // Handle mouse down for panning
  const handleMouseDown = (_e: KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      const stage = stageRef.current
      if (!stage) return
      const pointerPosition = stage.getPointerPosition()
      if (pointerPosition) {
        setPanStart(pointerPosition)
      }
    }
  }

  // Handle mouse up for panning
  const handleMouseUp = () => {
    if (isPanning) {
      setPanStart(null)
      document.body.style.cursor = 'grab'
    }
  }

  // Handle stage click for creating shapes
  const handleStageClick = async (e: KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()

    if (clickedOnEmpty) {
      // Deselect shape
      setSelectedShapeId(null)

      // Create new shape if tool is selected
      if (selectedTool !== 'select') {
        const stage = stageRef.current
        if (!stage) return

        const pointerPosition = stage.getPointerPosition()
        if (!pointerPosition) return

        // Convert screen coordinates to canvas coordinates
        const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)

        // Create shape based on selected tool
        let newShape: Shape | null = null

        switch (selectedTool) {
          case 'rectangle':
            newShape = createDefaultRectangle(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'circle':
            newShape = createDefaultCircle(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'line':
            newShape = createDefaultLine(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'text':
            newShape = createDefaultText(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'triangle':
            newShape = createDefaultTriangle(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'pentagon':
            newShape = createDefaultPentagon(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'hexagon':
            newShape = createDefaultHexagon(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'star':
            newShape = createDefaultStar(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'arrow':
            newShape = createDefaultArrow(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'bidirectionalArrow':
            newShape = createDefaultBidirectionalArrow(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'bentConnector':
            newShape = createDefaultBentConnector(canvasPos.x, canvasPos.y, userId, userColor)
            break
        }

        // Write to Firestore (will automatically sync back via subscription)
        if (newShape) {
          try {
            await createShape(newShape)
          } catch (err) {
            console.error('Failed to create shape:', err)
            setError('Failed to create shape. Please try again.')
          }
        }
      }
    }
  }

  // Handle shape selection
  const handleShapeSelect = (shapeId: string) => {
    setSelectedShapeId(shapeId)
    setSelectedTool('select')
  }

  // Handle shape drag move (optimistic + throttled)
  const handleShapeDragMove = useCallback(
    (shapeId: string, x: number, y: number) => {
      // Find the shape to check its type
      const shape = shapes.find((s) => s.id === shapeId)
      if (!shape) return

      // For lines and connectors, we need to update both endpoints to preserve length and angle
      let updates: Partial<Shape>
      if (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'bidirectionalArrow') {
        // Calculate offset from old position
        const dx = x - shape.x
        const dy = y - shape.y
        // Update both start and end points
        updates = {
          x,
          y,
          x2: shape.x2 + dx,
          y2: shape.y2 + dy,
        }
      } else if (shape.type === 'bentConnector') {
        // For bent connectors, also update the bend point
        const dx = x - shape.x
        const dy = y - shape.y
        updates = {
          x,
          y,
          x2: shape.x2 + dx,
          y2: shape.y2 + dy,
          bendX: shape.bendX + dx,
          bendY: shape.bendY + dy,
        }
      } else {
        // For other shapes, just update x and y
        updates = { x, y }
      }

      // Optimistic: update local state immediately for instant feedback
      updateShapeLocal(shapeId, updates)

      // Throttled: sync to Firestore (max 20 updates/sec)
      updateShapeThrottled(shapeId, updates)

      // Update cursor position during drag (since event bubbling is prevented)
      const stage = stageRef.current
      if (stage && user) {
        const pointerPosition = stage.getPointerPosition()
        if (pointerPosition) {
          const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
          updateCursor(canvasPos.x, canvasPos.y)
        }
      }
    },
    [shapes, updateShapeLocal, updateShapeThrottled, user, viewport, updateCursor]
  )

  // Handle shape drag end (ensure final position is persisted)
  const handleShapeDragEnd = useCallback(
    async (shapeId: string, x: number, y: number) => {
      // Find the shape to check its type
      const shape = shapes.find((s) => s.id === shapeId)
      if (!shape) return

      // For lines and connectors, we need to update both endpoints to preserve length and angle
      let updates: Partial<Shape>
      if (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'bidirectionalArrow') {
        // Calculate offset from old position
        const dx = x - shape.x
        const dy = y - shape.y
        // Update both start and end points
        updates = {
          x,
          y,
          x2: shape.x2 + dx,
          y2: shape.y2 + dy,
        }
      } else if (shape.type === 'bentConnector') {
        // For bent connectors, also update the bend point
        const dx = x - shape.x
        const dy = y - shape.y
        updates = {
          x,
          y,
          x2: shape.x2 + dx,
          y2: shape.y2 + dy,
          bendX: shape.bendX + dx,
          bendY: shape.bendY + dy,
        }
      } else {
        // For other shapes, just update x and y
        updates = { x, y }
      }

      // Update local state
      updateShapeLocal(shapeId, updates)

      // Send final position to Firestore (not throttled)
      try {
        await updateShape(shapeId, updates)
      } catch (err) {
        console.error('Failed to update shape position:', err)
        setError('Failed to save shape position. Please try again.')
      }
    },
    [shapes, updateShape, updateShapeLocal]
  )

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(viewport.zoom + CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MAX_ZOOM)
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const newViewport = calculateZoom(
      viewport.zoom,
      newZoom - viewport.zoom,
      centerX,
      centerY,
      viewport
    )
    updateViewport(newViewport)
  }, [viewport, updateViewport])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(viewport.zoom - CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MIN_ZOOM)
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const newViewport = calculateZoom(
      viewport.zoom,
      newZoom - viewport.zoom,
      centerX,
      centerY,
      viewport
    )
    updateViewport(newViewport)
  }, [viewport, updateViewport])

  const handleResetZoom = useCallback(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const newViewport = calculateZoom(
      viewport.zoom,
      CANVAS_CONFIG.DEFAULT_ZOOM - viewport.zoom,
      centerX,
      centerY,
      viewport
    )
    updateViewport(newViewport)
  }, [viewport, updateViewport])

  // Generate infinite grid dots based on viewport (Figma-style)
  const renderGrid = () => {
    const gridSize = 50
    const dots: React.ReactElement[] = []

    // Calculate visible canvas area in canvas coordinates
    const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize
    const endX = Math.ceil((window.innerWidth - viewport.x) / viewport.zoom / gridSize) * gridSize
    const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize
    const endY = Math.ceil((window.innerHeight - viewport.y) / viewport.zoom / gridSize) * gridSize

    // Render dots at grid intersections
    for (let x = startX; x <= endX; x += gridSize) {
      for (let y = startY; y <= endY; y += gridSize) {
        dots.push(
          <Circle
            key={`dot-${x}-${y}`}
            x={x}
            y={y}
            radius={1.5 / viewport.zoom}
            fill="#d1d5db"
            listening={false}
          />
        )
      }
    }

    return dots
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      {/* Toolbar */}
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        zoom={viewport.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        selectedShapeColor={selectedShapeId ? (() => {
          const selectedShape = shapes.find(s => s.id === selectedShapeId)
          if (!selectedShape) return undefined
          return 'fill' in selectedShape ? selectedShape.fill :
                 'stroke' in selectedShape ? selectedShape.stroke : undefined
        })() : undefined}
        onColorChange={selectedShapeId ? (color) => {
          const selectedShape = shapes.find(s => s.id === selectedShapeId)
          if (!selectedShape) return

          const updates: Partial<Shape> = {}
          if ('fill' in selectedShape) {
            updates.fill = color
          }
          if ('stroke' in selectedShape) {
            updates.stroke = color
          }
          if (Object.keys(updates).length > 0) {
            updateShapeLocal(selectedShapeId, updates)
            updateShape(selectedShapeId, updates).catch(err => {
              console.error('Failed to update shape color:', err)
            })
          }
        } : undefined}
      />

      {/* Loading indicator */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #3B82F6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '14px', color: '#1F2937' }}>Loading shapes...</span>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        draggable={false}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Grid lines */}
          {renderGrid()}

          {/* Render shapes */}
          {shapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isSelected={shape.id === selectedShapeId}
              onSelect={() => handleShapeSelect(shape.id)}
              onDragMove={(x, y) => handleShapeDragMove(shape.id, x, y)}
              onDragEnd={(x, y) => handleShapeDragEnd(shape.id, x, y)}
              onMouseEnter={() => {
                console.log('Mouse entered shape:', shape.type, shape.id)
                setHoveredShapeId(shape.id)
              }}
              onMouseLeave={() => {
                console.log('Mouse left shape')
                setHoveredShapeId(null)
              }}
            />
          ))}
        </Layer>
      </Stage>

      {/* Multiplayer cursors overlay */}
      <CursorOverlay cursors={cursors} viewport={viewport} />

      {/* Shape hover tooltip */}
      {hoveredShapeId && mousePosition && (() => {
        const hoveredShape = shapes.find(s => s.id === hoveredShapeId)
        if (!hoveredShape) {
          console.log('Hovered shape not found:', hoveredShapeId)
          return null
        }

        const shapeName = getShapeName(hoveredShape)
        console.log('Rendering tooltip:', shapeName, 'at', mousePosition)

        return (
          <div
            style={{
              position: 'absolute',
              left: `${mousePosition.x + 10}px`,
              top: `${mousePosition.y - 30}px`,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              pointerEvents: 'none',
              zIndex: 10000,
              whiteSpace: 'nowrap',
            }}
          >
            {shapeName}
          </div>
        )
      })()}

      {/* Error toast notification */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

