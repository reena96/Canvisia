import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Stage, Layer, Line, Rect } from 'react-konva'
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
import { createDefaultRectangle } from '@/utils/shapeDefaults'
import { useFirestore } from '@/hooks/useFirestore'
import { getUserColor } from '@/config/userColors'
import { throttle } from '@/utils/throttle'
import type { Shape } from '@/types/shapes'

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

  // Handle zoom with mouse wheel
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    // Get pointer position
    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Calculate zoom delta (negative for zoom in, positive for zoom out)
    const zoomDelta = -e.evt.deltaY * CANVAS_CONFIG.ZOOM_SENSITIVITY

    // Calculate new viewport centered on pointer
    const newViewport = calculateZoom(
      viewport.zoom,
      zoomDelta,
      pointerPosition.x,
      pointerPosition.y,
      viewport
    )

    updateViewport(newViewport)
  }

  // Handle drag end to update viewport position
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target
    updateViewport({
      x: stage.x(),
      y: stage.y(),
    })
  }

  // Handle mouse move to broadcast cursor position
  const handleMouseMove = () => {
    // Only track cursor if user is authenticated
    if (!user) return

    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Convert screen coordinates to canvas coordinates
    const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
    updateCursor(canvasPos.x, canvasPos.y)
  }

  // Handle stage click for creating shapes
  const handleStageClick = async (e: KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()

    if (clickedOnEmpty) {
      // Deselect shape
      setSelectedShapeId(null)

      // Create new shape if tool is selected
      if (selectedTool === 'rectangle') {
        const stage = stageRef.current
        if (!stage) return

        const pointerPosition = stage.getPointerPosition()
        if (!pointerPosition) return

        // Convert screen coordinates to canvas coordinates
        const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)

        // Create new rectangle at click position with user's color
        const newRect = createDefaultRectangle(canvasPos.x, canvasPos.y, userId, userColor)

        // Write to Firestore (will automatically sync back via subscription)
        try {
          await createShape(newRect)
        } catch (err) {
          console.error('Failed to create shape:', err)
          setError('Failed to create shape. Please try again.')
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
      // Optimistic: update local state immediately for instant feedback
      updateShapeLocal(shapeId, { x, y })

      // Throttled: sync to Firestore (max 20 updates/sec)
      updateShapeThrottled(shapeId, { x, y })

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
    [updateShapeLocal, updateShapeThrottled, user, viewport, updateCursor]
  )

  // Handle shape drag end (ensure final position is persisted)
  const handleShapeDragEnd = useCallback(
    async (shapeId: string, x: number, y: number) => {
      // Update local state
      updateShapeLocal(shapeId, { x, y })

      // Send final position to Firestore (not throttled)
      try {
        await updateShape(shapeId, { x, y })
      } catch (err) {
        console.error('Failed to update shape position:', err)
        setError('Failed to save shape position. Please try again.')
      }
    },
    [updateShape, updateShapeLocal]
  )

  // Generate grid lines
  const renderGrid = () => {
    const gridSize = 50 // 50px grid
    const lines: React.ReactElement[] = []

    // Vertical lines
    for (let i = 0; i < CANVAS_CONFIG.WIDTH; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, CANVAS_CONFIG.HEIGHT]}
          stroke="#ddd"
          strokeWidth={1 / viewport.zoom}
          listening={false}
        />
      )
    }

    // Horizontal lines
    for (let i = 0; i < CANVAS_CONFIG.HEIGHT; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, CANVAS_CONFIG.WIDTH, i]}
          stroke="#ddd"
          strokeWidth={1 / viewport.zoom}
          listening={false}
        />
      )
    }

    return lines
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Toolbar selectedTool={selectedTool} onToolSelect={setSelectedTool} />

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
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={CANVAS_CONFIG.WIDTH}
            height={CANVAS_CONFIG.HEIGHT}
            fill="white"
            listening={false}
          />

          {/* Grid */}
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
            />
          ))}
        </Layer>
      </Stage>

      {/* Multiplayer cursors overlay */}
      <CursorOverlay cursors={cursors} viewport={viewport} />

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

