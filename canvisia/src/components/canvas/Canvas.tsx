import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Stage, Layer, Circle, Text as KonvaText, Rect } from 'react-konva'
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
import { TextEditOverlay } from './TextEditOverlay'
import { FloatingTextToolbar } from './FloatingTextToolbar'
import { ResizeHandles } from './ResizeHandles'
import { MultiSelectResizeHandles } from './MultiSelectResizeHandles'
import {
  createDefaultRectangle,
  createDefaultCircle,
  createDefaultEllipse,
  createDefaultRoundedRectangle,
  createDefaultCylinder,
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
import type { Shape, Text } from '@/types/shapes'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'
import { calculateRectangleResize, calculateCircleResize, calculateEllipseResize } from '@/utils/resizeCalculations'
import { calculateRotationDelta, snapAngle, normalizeAngle } from '@/utils/rotationCalculations'
import type { ResizeHandle } from '@/utils/resizeCalculations'
import { writeBatchShapePositions, clearShapePositions, subscribeToLivePositions, type LivePosition } from '@/services/rtdb'

interface CanvasProps {
  onPresenceChange?: (activeUsers: import('@/types/user').Presence[]) => void
  onMountCleanup?: (cleanup: () => Promise<void>) => void
  onAskVega?: () => void
  isVegaOpen?: boolean
}

export function Canvas({ onPresenceChange, onMountCleanup, onAskVega, isVegaOpen = false }: CanvasProps = {}) {
  const stageRef = useRef<any>(null)
  const viewport = useCanvasStore((state) => state.viewport)
  const updateViewport = useCanvasStore((state) => state.updateViewport)
  // @ts-ignore - Used in later tasks
  const editingTextId = useCanvasStore((state) => state.editingTextId)
  // @ts-ignore - Used in later tasks
  const setEditingTextId = useCanvasStore((state) => state.setEditingTextId)
  const { user } = useAuth()

  // Local state for tools and selection
  const [selectedTool, setSelectedTool] = useState<Tool>('select')

  // Use store's selectedIds for multi-select support
  const selectedIds = useCanvasStore((state) => state.selectedIds)
  const setSelectedIds = useCanvasStore((state) => state.setSelectedIds)
  const selectShape = useCanvasStore((state) => state.selectShape)
  const deselectShape = useCanvasStore((state) => state.deselectShape)
  const clearSelection = useCanvasStore((state) => state.clearSelection)

  // Helper to get first selected shape ID (for backward compatibility)
  const selectedShapeId = selectedIds[0] || null

  // @ts-ignore - Used in later tasks
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Pan state (for spacebar + drag)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)

  // Drag-to-select state
  const [isBoxSelecting, setIsBoxSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null)

  // Text preview state (shows "Add text" following cursor)
  const [textPreviewPos, setTextPreviewPos] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingText, setIsDraggingText] = useState(false)

  // Dragging state (to hide toolbar while dragging)
  const [isDraggingShape, setIsDraggingShape] = useState(false)

  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [resizingHandle, setResizingHandle] = useState<ResizeHandle | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number } | null>(null)
  const [initialShapeDimensions, setInitialShapeDimensions] = useState<any>(null)

  // Multi-select resize state
  const [initialGroupBounds, setInitialGroupBounds] = useState<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null)
  const [currentGroupBounds, setCurrentGroupBounds] = useState<{ minX: number; minY: number; maxX: number; maxY: number } | null>(null)
  const initialShapesData = useRef<Map<string, Shape>>(new Map())

  // Rotation state
  const [isRotating, setIsRotating] = useState(false)
  const [rotationStart, setRotationStart] = useState<{ angle: number; initialRotation: number } | null>(null)

  // Multi-drag state: store initial positions when drag starts (using ref for synchronous access)
  const initialDragPositions = useRef<Map<string, { x: number; y: number; x2?: number; y2?: number; bendX?: number; bendY?: number }>>(new Map())

  // Track ALL shapes being moved during drag to prevent React interference with Konva's direct manipulation
  const movingShapeIds = useRef<Set<string>>(new Set())

  // Track shapes with active RTDB positions (being dragged by other users)
  // This prevents Firestore updates from causing jitter during remote drags
  const rtdbActiveShapeIds = useRef<Set<string>>(new Set())

  // PERFORMANCE: Cache Konva nodes during drag to avoid stage.findOne() on every mousemove
  const cachedNodes = useRef<Map<string, any>>(new Map())

  // PERFORMANCE: Cache shape data during drag to avoid array.find() on every mousemove
  const cachedShapeData = useRef<Map<string, { type: string; isLine: boolean; isBentConnector: boolean }>>(new Map())

  // PERFORMANCE: Cache selection box node to move it during drag
  const selectionBoxNode = useRef<any>(null)
  const initialSelectionBoxPos = useRef<{ x: number; y: number } | null>(null)

  // PERFORMANCE: Batch RTDB position data (all shapes written in single update)
  const rtdbWriteQueue = useRef<Map<string, any>>(new Map())

  // Optimistic updates: store local shape updates that haven't synced to Firestore yet
  const [localShapeUpdates, setLocalShapeUpdates] = useState<Record<string, Partial<Shape>>>({})

  // Error handling state
  const [error, setError] = useState<string | null>(null)

  // Setup canvas and user tracking
  const canvasId = 'default-canvas' // TODO: Get from canvas context/router
  const userId = user?.uid || ''
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Anonymous'
  const userColor = getUserColor(userName)

  // Setup cursor tracking
  const { cursors, updateCursor, cleanup: cleanupCursors } = useCursors(canvasId, userId, userName, userColor)

  // Setup presence tracking
  const { activeUsers, cleanup: cleanupPresence } = usePresence(canvasId, userId, userName, userColor)

  // Notify parent of presence changes
  useEffect(() => {
    if (onPresenceChange) {
      onPresenceChange(activeUsers)
    }
  }, [activeUsers, onPresenceChange])

  // Provide cleanup function to parent (combines cursor and presence cleanup)
  // Only run once on mount to avoid triggering cleanup repeatedly
  useEffect(() => {
    if (onMountCleanup) {
      const combinedCleanup = async () => {
        await Promise.all([
          cleanupCursors(),
          cleanupPresence()
        ])
      }
      onMountCleanup(combinedCleanup)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  // Setup Firestore sync for shapes
  const { shapes: firestoreShapes, loading, createShape, updateShape, deleteShape } = useFirestore(canvasId)

  // Setup RTDB subscription for live position updates from other users
  useEffect(() => {
    console.log('[RTDB] Setting up live position subscription for canvas:', canvasId)

    // Store pending position updates to be applied on next animation frame
    const pendingPositions = new Map<string, LivePosition>()
    let animationFrameId: number | null = null

    // Apply updates on animation frame for smooth 60fps rendering
    const applyPendingUpdates = () => {
      const stage = stageRef.current
      if (!stage || pendingPositions.size === 0) {
        animationFrameId = null
        return
      }

      // Process all pending position updates
      pendingPositions.forEach((position, shapeId) => {
        // Skip if this shape is being moved by the current user
        if (movingShapeIds.current.has(shapeId)) {
          return
        }

        // Skip if this update was made by the current user
        if (position.updatedBy === userId) {
          return
        }

        // Find the Konva node for this shape
        const node = stage.findOne(`#${shapeId}`)
        if (!node) {
          return
        }

        // Update the node's position directly via Konva (bypasses React)
        node.x(position.x)
        node.y(position.y)

        // RESIZE SYNC: Update dimensions if present (for smooth remote resize viewing)
        if (position.width !== undefined) node.width(position.width)
        if (position.height !== undefined) node.height(position.height)
        if (position.radius !== undefined) node.radius(position.radius)
        if (position.radiusX !== undefined) node.radiusX(position.radiusX)
        if (position.radiusY !== undefined) node.radiusY(position.radiusY)
        if (position.outerRadiusX !== undefined || position.outerRadiusY !== undefined) {
          // Star shapes - Konva uses single outerRadius/innerRadius
          // We send X/Y separately but apply as average
          const outerRadius = position.outerRadiusX || position.outerRadiusY || node.outerRadius()
          const innerRadius = position.innerRadiusX || position.innerRadiusY || node.innerRadius()
          node.outerRadius(outerRadius)
          node.innerRadius(innerRadius)
        }

        // For line-based shapes, also update endpoints via points array
        const shape = firestoreShapes.find(s => s.id === shapeId)
        if (!shape) return

        if (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'bidirectionalArrow') {
          if (position.x2 !== undefined && position.y2 !== undefined) {
            node.points([0, 0, position.x2 - position.x, position.y2 - position.y])
          }
        } else if (shape.type === 'bentConnector') {
          if (position.x2 !== undefined && position.y2 !== undefined &&
              position.bendX !== undefined && position.bendY !== undefined) {
            node.points([
              0,
              0,
              position.bendX - position.x,
              position.bendY - position.y,
              position.x2 - position.x,
              position.y2 - position.y,
            ])
          }
        }
      })

      // Clear pending updates
      pendingPositions.clear()

      // Redraw the layer after all updates (once per frame)
      const layer = stage.findOne('Layer')
      if (layer) {
        layer.batchDraw()
      }

      animationFrameId = null
    }

    const unsubscribe = subscribeToLivePositions(canvasId, (positions) => {
      // Track which shapes have active RTDB positions
      rtdbActiveShapeIds.current = new Set(positions.keys())

      // Store all position updates
      positions.forEach((position, shapeId) => {
        pendingPositions.set(shapeId, position)
      })

      // Schedule update on next animation frame if not already scheduled
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(applyPendingUpdates)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      console.log('[RTDB] Cleaning up live position subscription')
      unsubscribe()
      rtdbActiveShapeIds.current.clear() // Clear tracking on cleanup

      // Cancel pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [canvasId, userId])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't interfere with input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Delete key - remove all selected shapes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          try {
            // Delete all selected shapes in parallel
            await Promise.all(selectedIds.map(id => deleteShape(id)))
            clearSelection()
          } catch (err) {
            console.error('Failed to delete shapes:', err)
            setError('Failed to delete shapes. Please try again.')
          }
        }
      }

      // Escape key - deselect all shapes
      if (e.key === 'Escape') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          clearSelection()
        }
      }

      // Layer ordering shortcuts
      // Cmd/Ctrl + ] - Bring Forward
      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          selectedIds.forEach((id) => {
            const shape = firestoreShapes.find(s => s.id === id)
            if (shape) {
              const currentZ = shape.zIndex || 0
              updateShape(id, { zIndex: currentZ + 1 })
            }
          })
        }
      }

      // Cmd/Ctrl + [ - Send Backward
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          selectedIds.forEach((id) => {
            const shape = firestoreShapes.find(s => s.id === id)
            if (shape) {
              const currentZ = shape.zIndex || 0
              updateShape(id, { zIndex: currentZ - 1 })
            }
          })
        }
      }

      // Cmd/Ctrl + Shift + ] - Bring to Front
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === ']') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          const maxZ = Math.max(...firestoreShapes.map(s => s.zIndex || 0), 0)
          selectedIds.forEach((id) => {
            updateShape(id, { zIndex: maxZ + 1 })
          })
        }
      }

      // Cmd/Ctrl + Shift + [ - Send to Back
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '[') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          const minZ = Math.min(...firestoreShapes.map(s => s.zIndex || 0), 0)
          selectedIds.forEach((id) => {
            updateShape(id, { zIndex: minZ - 1 })
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedIds, deleteShape, clearSelection, firestoreShapes, updateShape])

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Merge Firestore shapes with local optimistic updates and sort by zIndex
  // CRITICAL: Use useRef to cache previous shapes and only create new objects when data changes
  const prevShapesRef = useRef<Shape[]>([])

  const shapes = useMemo(() => {

    const merged = firestoreShapes.map((shape) => {
      // CRITICAL: Don't apply any updates to ANY shape being moved during multi-drag
      // This prevents React from interfering with Konva's direct node manipulation
      if (movingShapeIds.current.has(shape.id)) {
        // Return previous reference if data unchanged to prevent re-renders
        const prevShape = prevShapesRef.current.find(s => s.id === shape.id)
        if (prevShape &&
            prevShape.x === shape.x &&
            prevShape.y === shape.y &&
            prevShape.updatedAt === shape.updatedAt) {
          return prevShape // Same reference = no re-render
        }
        return shape
      }

      // CRITICAL: Don't apply Firestore updates to shapes with active RTDB positions
      // This prevents jitter when remote users are dragging shapes
      if (rtdbActiveShapeIds.current.has(shape.id)) {
        // Return previous reference to freeze this shape in React
        // RTDB subscription is updating Konva nodes directly
        const prevShape = prevShapesRef.current.find(s => s.id === shape.id)
        if (prevShape) {
          return prevShape // Freeze in React, RTDB controls position
        }
        return shape
      }

      const localUpdate = localShapeUpdates[shape.id]

      // If no local update, try to return previous reference to avoid re-render
      if (!localUpdate) {
        const prevShape = prevShapesRef.current.find(s => s.id === shape.id)
        if (prevShape &&
            prevShape.x === shape.x &&
            prevShape.y === shape.y &&
            prevShape.updatedAt === shape.updatedAt) {
          return prevShape // Same reference = no re-render
        }
        return shape
      }

      // Has local update - merge and create new object
      const mergedShape = {
        ...shape,
        ...localUpdate,
      }

      // Check if this matches previous merged version
      const prevShape = prevShapesRef.current.find(s => s.id === shape.id)
      if (prevShape &&
          prevShape.x === mergedShape.x &&
          prevShape.y === mergedShape.y &&
          prevShape.updatedAt === mergedShape.updatedAt) {
        return prevShape // Same data = return same reference
      }

      return mergedShape
    }) as Shape[]

    // Sort by zIndex for proper layer ordering (shapes with lower zIndex render first/behind)
    const sorted = merged.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    // Cache for next comparison
    prevShapesRef.current = sorted

    return sorted
  }, [firestoreShapes, localShapeUpdates])

  // Viewport culling: filter shapes that are visible in current viewport
  // This dramatically improves performance with 500+ objects
  const visibleShapes = useMemo(() => {
    // Calculate viewport bounds in canvas coordinates
    // Canvas starts below header
    const viewportLeft = -viewport.x / viewport.zoom
    const viewportTop = -viewport.y / viewport.zoom
    const viewportRight = (window.innerWidth - viewport.x) / viewport.zoom
    const viewportBottom = ((window.innerHeight - CANVAS_CONFIG.HEADER_HEIGHT) - viewport.y) / viewport.zoom

    // Add padding to viewport bounds to render shapes slightly outside viewport
    // This prevents popping when shapes are partially visible
    const padding = 200 / viewport.zoom
    const left = viewportLeft - padding
    const top = viewportTop - padding
    const right = viewportRight + padding
    const bottom = viewportBottom + padding

    return shapes.filter((shape) => {
      // Calculate shape bounds
      let shapeLeft = shape.x
      let shapeTop = shape.y
      let shapeRight = shape.x
      let shapeBottom = shape.y

      // Calculate bounds based on shape type
      if ('width' in shape && 'height' in shape) {
        // Rectangle-like shapes (account for rotation by using full diagonal)
        const halfWidth = shape.width / 2
        const halfHeight = shape.height / 2
        const diagonal = Math.sqrt(halfWidth * halfWidth + halfHeight * halfHeight)
        shapeLeft = shape.x - diagonal
        shapeTop = shape.y - diagonal
        shapeRight = shape.x + diagonal
        shapeBottom = shape.y + diagonal
      } else if ('radius' in shape) {
        // Circle
        shapeLeft = shape.x - shape.radius
        shapeTop = shape.y - shape.radius
        shapeRight = shape.x + shape.radius
        shapeBottom = shape.y + shape.radius
      } else if ('radiusX' in shape && 'radiusY' in shape) {
        // Ellipse, polygon shapes
        const maxRadius = Math.max(shape.radiusX || 0, shape.radiusY || 0)
        shapeLeft = shape.x - maxRadius
        shapeTop = shape.y - maxRadius
        shapeRight = shape.x + maxRadius
        shapeBottom = shape.y + maxRadius
      } else if ('outerRadiusX' in shape && 'outerRadiusY' in shape) {
        // Star
        const maxRadius = Math.max((shape as any).outerRadiusX, (shape as any).outerRadiusY)
        shapeLeft = shape.x - maxRadius
        shapeTop = shape.y - maxRadius
        shapeRight = shape.x + maxRadius
        shapeBottom = shape.y + maxRadius
      } else if ('x2' in shape && 'y2' in shape) {
        // Line, arrow, connector
        shapeLeft = Math.min(shape.x, (shape as any).x2) - 50
        shapeTop = Math.min(shape.y, (shape as any).y2) - 50
        shapeRight = Math.max(shape.x, (shape as any).x2) + 50
        shapeBottom = Math.max(shape.y, (shape as any).y2) + 50
      }

      // Check if shape intersects with viewport
      return !(shapeRight < left || shapeLeft > right || shapeBottom < top || shapeTop > bottom)
    })
  }, [shapes, viewport])

  // Performance monitoring (only in development)
  usePerformanceMonitor(
    shapes.length,
    visibleShapes.length,
    process.env.NODE_ENV === 'development'
  )

  // Batch shape updates to send to Firestore together (avoids throttle overwrite bug)
  const pendingUpdatesRef = useRef<Map<string, Partial<Shape>>>(new Map())
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushPendingUpdates = useCallback(() => {
    const updates = new Map(pendingUpdatesRef.current)
    pendingUpdatesRef.current.clear()
    flushTimeoutRef.current = null

    // Send all batched updates to Firestore in parallel
    const promises = Array.from(updates.entries()).map(([shapeId, shapeUpdates]) =>
      updateShape(shapeId, shapeUpdates).catch((error) => {
        console.error('Batched shape update failed for', shapeId, error)
      })
    )

    Promise.all(promises).catch(console.error)
  }, [updateShape])

  // Batch updates and flush very frequently for smooth real-time collaboration
  // Using requestAnimationFrame for natural 60fps batching
  const updateShapeThrottled = useCallback((shapeId: string, updates: Partial<Shape>) => {
    // Add/merge this shape's updates into pending batch
    const existing = pendingUpdatesRef.current.get(shapeId)
    pendingUpdatesRef.current.set(shapeId, { ...existing, ...updates })

    // Schedule flush on next animation frame if not already scheduled
    if (!flushTimeoutRef.current) {
      flushTimeoutRef.current = requestAnimationFrame(() => {
        flushPendingUpdates()
      }) as any
    }
  }, [flushPendingUpdates])

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

  // Handle text formatting keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only apply shortcuts when text is selected but not editing
      if (!selectedTextId || editingTextId) return

      const selectedShape = shapes.find(s => s.id === selectedTextId)
      if (!selectedShape || selectedShape.type !== 'text') return

      // Cmd+B / Ctrl+B - Toggle Bold
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        const newWeight = selectedShape.fontWeight === 700 ? 400 : 700
        updateShape(selectedTextId, { fontWeight: newWeight })
      }

      // Cmd+I / Ctrl+I - Toggle Italic
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        const newStyle = selectedShape.fontStyle === 'italic' ? 'normal' : 'italic'
        updateShape(selectedTextId, { fontStyle: newStyle })
      }

      // Cmd+U / Ctrl+U - Toggle Underline
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        const newDecoration = selectedShape.textDecoration === 'underline' ? 'none' : 'underline'
        updateShape(selectedTextId, { textDecoration: newDecoration })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTextId, editingTextId, shapes, updateShape])

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

  // Update panning state when hand tool is selected
  useEffect(() => {
    if (selectedTool === 'hand') {
      setIsPanning(true)
      document.body.style.cursor = 'grab'
    } else if (isPanning) {
      setIsPanning(false)
      setPanStart(null)
      document.body.style.cursor = 'default'
    }

    // Clear text preview when switching away from text tool
    if (selectedTool !== 'text') {
      setTextPreviewPos(null)
    }
  }, [selectedTool, isPanning])

  // Handle spacebar for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with spacebar when typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      if (e.code === 'Space' && !isPanning) {
        e.preventDefault()
        setIsPanning(true)
        document.body.style.cursor = 'grab'
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't interfere with spacebar when typing in input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      if (e.code === 'Space' && selectedTool !== 'hand') {
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
  }, [isPanning, selectedTool])

  // Handle mouse move to broadcast cursor position and pan
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Mark user as active on mouse movement
    // Handle resizing
    if (isResizing) {
      handleResizeMove(e)
      return
    }

    // Handle rotation
    if (isRotating) {
      handleRotationMove(e)
      return
    }

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

    // Handle drag-to-select box
    if (isBoxSelecting && selectionStart) {
      const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
      const x = Math.min(selectionStart.x, canvasPos.x)
      const y = Math.min(selectionStart.y, canvasPos.y)
      const width = Math.abs(canvasPos.x - selectionStart.x)
      const height = Math.abs(canvasPos.y - selectionStart.y)
      setSelectionBox({ x, y, width, height })
      return
    }

    // Show text preview when text tool is selected or dragging text
    if (selectedTool === 'text' || isDraggingText) {
      const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
      setTextPreviewPos(canvasPos)
      return
    }

    // Only track cursor if user is authenticated
    if (!user) return

    // Convert screen coordinates to canvas coordinates
    const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
    updateCursor(canvasPos.x, canvasPos.y)
  }

  // Handle mouse down for panning, text creation, and drag-to-select
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    // Handle panning
    if (isPanning) {
      setPanStart(pointerPosition)
      return
    }

    const clickedOnEmpty = e.target === e.target.getStage()

    // Handle text tool drag start
    if (clickedOnEmpty && selectedTool === 'text') {
      setIsDraggingText(true)
      return
    }

    // Handle drag-to-select box with select tool
    // Start selection box if: clicking on empty canvas OR holding Cmd/Ctrl/Shift modifier key
    if (selectedTool === 'select') {
      const clickedShape = e.target
      const clickedOnEmpty = clickedShape === clickedShape.getStage() || clickedShape.getType() === 'Layer'
      const modifierKey = e.evt?.shiftKey || e.evt?.ctrlKey || e.evt?.metaKey // Shift, Ctrl (Windows/Linux) or Cmd (Mac)

      // Start selection box if clicking on empty canvas OR holding any modifier key
      if (clickedOnEmpty || modifierKey) {
        const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
        setIsBoxSelecting(true)
        setSelectionStart(canvasPos)
        setSelectionBox({ x: canvasPos.x, y: canvasPos.y, width: 0, height: 0 })
      }
    }
  }

  // Handle mouse up for panning, text creation, and drag-to-select
  const handleMouseUp = async (_e: KonvaEventObject<MouseEvent>) => {
    // Handle resize end
    if (isResizing) {
      handleResizeEnd()
      return
    }

    // Handle rotation end
    if (isRotating) {
      handleRotationEnd()
      return
    }

    // Handle panning
    if (isPanning) {
      setPanStart(null)
      document.body.style.cursor = 'grab'
      return
    }

    // Handle drag-to-select box end
    if (isBoxSelecting && selectionBox) {
      console.log('[Selection] Mouse up - box selecting:', {
        isBoxSelecting,
        selectionBox,
        shapesCount: shapes.length
      })

      // Find all shapes that intersect with the selection box
      const selectedShapeIds: string[] = []
      shapes.forEach((shape) => {
        if (isShapeInBox(shape, selectionBox)) {
          selectedShapeIds.push(shape.id)
        }
      })

      console.log('[Selection] Found shapes in box:', selectedShapeIds.length)
      console.log('[Selection] Previously selected:', selectedIds.length)

      // Always add to existing selection when using selection box
      // This matches intuitive behavior: keep selecting more shapes
      const newSelection = [...new Set([...selectedIds, ...selectedShapeIds])]
      console.log('[Selection] New total selection:', newSelection.length)
      setSelectedIds(newSelection)

      // Clear selection box
      setIsBoxSelecting(false)
      setSelectionBox(null)
      setSelectionStart(null)
      return
    }

    // Handle text drop
    if (isDraggingText && textPreviewPos) {
      // Create text at the current preview position
      const newShape = createDefaultText(textPreviewPos.x, textPreviewPos.y, userId, userColor)

      try {
        await createShape(newShape)
        // Automatically enter edit mode for new text
        setEditingTextId(newShape.id)
        setSelectedIds([newShape.id])
        setSelectedTextId(newShape.id)
        // Switch back to select tool and clear preview
        setSelectedTool('select')
        setTextPreviewPos(null)
      } catch (err) {
        console.error('Failed to create text:', err)
        setError('Failed to create text. Please try again.')
      }

      setIsDraggingText(false)
    }
  }

  // Helper function to check if a shape intersects with selection box
  const isShapeInBox = (shape: Shape, box: { x: number; y: number; width: number; height: number }): boolean => {
    // Get shape bounds
    let shapeLeft = shape.x
    let shapeTop = shape.y
    let shapeRight = shape.x
    let shapeBottom = shape.y

    // Calculate bounds based on shape type
    // NOTE: Rectangles use center-based coordinates (offset = width/2, height/2 in Konva)
    if ('width' in shape && 'height' in shape) {
      // Rectangle-like shapes (rectangle, roundedRectangle, cylinder)
      // x,y is the CENTER, not top-left
      shapeLeft = shape.x - shape.width / 2
      shapeTop = shape.y - shape.height / 2
      shapeRight = shape.x + shape.width / 2
      shapeBottom = shape.y + shape.height / 2
    } else if ('radius' in shape) {
      // Circle (center-based)
      shapeLeft = shape.x - shape.radius
      shapeTop = shape.y - shape.radius
      shapeRight = shape.x + shape.radius
      shapeBottom = shape.y + shape.radius
    } else if ('radiusX' in shape && 'radiusY' in shape) {
      // Ellipse, polygon shapes (center-based)
      shapeLeft = shape.x - (shape.radiusX || 0)
      shapeTop = shape.y - (shape.radiusY || 0)
      shapeRight = shape.x + (shape.radiusX || 0)
      shapeBottom = shape.y + (shape.radiusY || 0)
    } else if ('outerRadiusX' in shape && 'outerRadiusY' in shape) {
      // Star (center-based)
      const outerRadiusX = (shape as any).outerRadiusX
      const outerRadiusY = (shape as any).outerRadiusY
      shapeLeft = shape.x - outerRadiusX
      shapeTop = shape.y - outerRadiusY
      shapeRight = shape.x + outerRadiusX
      shapeBottom = shape.y + outerRadiusY
    } else if ('x2' in shape && 'y2' in shape) {
      // Line, arrow, connector
      shapeLeft = Math.min(shape.x, (shape as any).x2)
      shapeTop = Math.min(shape.y, (shape as any).y2)
      shapeRight = Math.max(shape.x, (shape as any).x2)
      shapeBottom = Math.max(shape.y, (shape as any).y2)
    }

    // Check if shape intersects with box
    return !(shapeRight < box.x || shapeLeft > box.x + box.width ||
             shapeBottom < box.y || shapeTop > box.y + box.height)
  }

  // Handle stage click for creating shapes
  const handleStageClick = async (e: KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()

    if (clickedOnEmpty) {
      // Deselect all shapes (unless shift is held for multi-select)
      if (!e.evt.shiftKey) {
        clearSelection()
        setSelectedTextId(null)
      }

      // Create new shape if tool is selected (except text, which uses drag-to-create)
      if (selectedTool !== 'select' && selectedTool !== 'text') {
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
          case 'ellipse':
            newShape = createDefaultEllipse(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'roundedRectangle':
            newShape = createDefaultRoundedRectangle(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'cylinder':
            newShape = createDefaultCylinder(canvasPos.x, canvasPos.y, userId, userColor)
            break
          case 'line':
            newShape = createDefaultLine(canvasPos.x, canvasPos.y, userId, userColor)
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
            // Switch back to select tool after creating shape
            setSelectedTool('select')
          } catch (err) {
            console.error('Failed to create shape:', err)
            setError('Failed to create shape. Please try again.')
          }
        }
      }
    }
  }

  // Handle shape selection with shift-click and ctrl/cmd-click multi-select support
  const handleShapeSelect = (shapeId: string, modifierKey: boolean = false) => {
    const shape = shapes.find(s => s.id === shapeId)

    if (modifierKey) {
      // Shift-click or Ctrl/Cmd-click: toggle selection
      if (selectedIds.includes(shapeId)) {
        deselectShape(shapeId)
        // If deselecting the current text shape, clear selectedTextId
        if (shapeId === selectedTextId) {
          setSelectedTextId(null)
        }
      } else {
        selectShape(shapeId)
        // Update selectedTextId if this is a text shape
        if (shape?.type === 'text') {
          setSelectedTextId(shapeId)
        }
      }
    } else {
      // Regular click: replace selection
      setSelectedIds([shapeId])
      if (shape?.type === 'text') {
        setSelectedTextId(shapeId)
      } else {
        setSelectedTextId(null)
      }
    }
    setSelectedTool('select')
  }

  // Handle shape drag start - capture initial positions
  const handleShapeDragStart = useCallback(
    (shapeId: string) => {
      // Determine which shapes will move
      const shapesToMove = selectedIds.includes(shapeId) ? selectedIds : [shapeId]

      // Track ALL shapes being moved to prevent React interference with Konva's direct manipulation
      movingShapeIds.current = new Set(shapesToMove)

      // Get Konva stage for caching nodes
      const stage = stageRef.current
      if (!stage) return

      // PERFORMANCE: Clear and populate all caches on drag start
      const positions = new Map()
      cachedNodes.current.clear()
      cachedShapeData.current.clear()

      shapesToMove.forEach((id) => {
        const shape = shapes.find((s) => s.id === id)
        if (!shape) return

        // Cache initial positions
        if (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'bidirectionalArrow') {
          positions.set(id, { x: shape.x, y: shape.y, x2: shape.x2, y2: shape.y2 })
        } else if (shape.type === 'bentConnector') {
          positions.set(id, { x: shape.x, y: shape.y, x2: shape.x2, y2: shape.y2, bendX: shape.bendX, bendY: shape.bendY })
        } else {
          positions.set(id, { x: shape.x, y: shape.y })
        }

        // PERFORMANCE: Cache Konva node reference (avoids stage.findOne on every mousemove)
        const node = stage.findOne(`#${id}`)
        if (node) {
          cachedNodes.current.set(id, node)
        }

        // PERFORMANCE: Cache shape type data (avoids array.find and type checks on every mousemove)
        const isLine = shape.type === 'line' || shape.type === 'arrow' || shape.type === 'bidirectionalArrow'
        const isBentConnector = shape.type === 'bentConnector'
        cachedShapeData.current.set(id, {
          type: shape.type,
          isLine,
          isBentConnector
        })
      })

      initialDragPositions.current = positions

      // PERFORMANCE: Cache selection box position for multi-select
      if (shapesToMove.length > 1) {
        const selectionBox = stage.findOne('#multi-select-box')
        if (selectionBox) {
          selectionBoxNode.current = selectionBox
          initialSelectionBoxPos.current = { x: selectionBox.x(), y: selectionBox.y() }
        }
      }
    },
    [shapes, selectedIds]
  )

  // Handle shape drag move (optimistic + throttled) with multi-select support
  const handleShapeDragMove = useCallback(
    (shapeId: string, x: number, y: number) => {
      // Get initial position of the dragged shape
      const initialPos = initialDragPositions.current.get(shapeId)
      if (!initialPos) return

      // Calculate the delta from the INITIAL position (not current)
      const dx = x - initialPos.x
      const dy = y - initialPos.y

      // If multiple shapes are selected and this shape is one of them, move all selected shapes
      const shapesToMove = selectedIds.includes(shapeId) ? selectedIds : [shapeId]

      // Get the Konva stage to directly manipulate other shape nodes
      const stage = stageRef.current
      if (!stage) return

      shapesToMove.forEach((id) => {
        // PERFORMANCE: Use cached data instead of array.find()
        const shapeData = cachedShapeData.current.get(id)
        const shapeInitialPos = initialDragPositions.current.get(id)

        if (!shapeData || !shapeInitialPos) return

        // Calculate updates based on cached shape type using INITIAL positions
        let updates: Partial<Shape>
        if (shapeData.isLine) {
          // For lines and connectors, update both endpoints
          updates = {
            x: shapeInitialPos.x + dx,
            y: shapeInitialPos.y + dy,
            x2: shapeInitialPos.x2! + dx,
            y2: shapeInitialPos.y2! + dy,
          }
        } else if (shapeData.isBentConnector) {
          // For bent connectors, also update the bend point
          updates = {
            x: shapeInitialPos.x + dx,
            y: shapeInitialPos.y + dy,
            x2: shapeInitialPos.x2! + dx,
            y2: shapeInitialPos.y2! + dy,
            bendX: shapeInitialPos.bendX! + dx,
            bendY: shapeInitialPos.bendY! + dy,
          }
        } else {
          // For other shapes, just update x and y
          updates = { x: shapeInitialPos.x + dx, y: shapeInitialPos.y + dy }
        }

        // CRITICAL: For non-dragged shapes, directly update Konva nodes for real-time movement
        // This bypasses React rendering and moves shapes immediately via Konva's native API
        if (id !== shapeId) {
          // PERFORMANCE: Use cached node instead of stage.findOne()
          const node = cachedNodes.current.get(id)
          if (node) {
            node.x(updates.x!)
            node.y(updates.y!)

            // For line-based shapes, also update endpoints via points array
            if (shapeData.isLine) {
              const lineUpdates = updates as { x: number; y: number; x2: number; y2: number }
              node.points([0, 0, lineUpdates.x2 - lineUpdates.x, lineUpdates.y2 - lineUpdates.y])
            } else if (shapeData.isBentConnector) {
              const connectorUpdates = updates as { x: number; y: number; x2: number; y2: number; bendX: number; bendY: number }
              node.points([
                0,
                0,
                connectorUpdates.bendX - connectorUpdates.x,
                connectorUpdates.bendY - connectorUpdates.y,
                connectorUpdates.x2 - connectorUpdates.x,
                connectorUpdates.y2 - connectorUpdates.y,
              ])
            }
          }
        }

        // PERFORMANCE: Queue RTDB write instead of writing immediately
        // Build position data, only including defined properties (RTDB rejects undefined)
        const positionData: any = {
          x: updates.x!,
          y: updates.y!,
          updatedBy: userId,
        }

        // Only add optional properties if they're defined
        if ((updates as any).x2 !== undefined) positionData.x2 = (updates as any).x2
        if ((updates as any).y2 !== undefined) positionData.y2 = (updates as any).y2
        if ((updates as any).bendX !== undefined) positionData.bendX = (updates as any).bendX
        if ((updates as any).bendY !== undefined) positionData.bendY = (updates as any).bendY

        // Add to batch for immediate write
        rtdbWriteQueue.current.set(id, positionData)
      })

      // PERFORMANCE: Also move the selection box with the shapes
      if (selectionBoxNode.current && initialSelectionBoxPos.current) {
        selectionBoxNode.current.x(initialSelectionBoxPos.current.x + dx)
        selectionBoxNode.current.y(initialSelectionBoxPos.current.y + dy)
      }

      // PERFORMANCE: Write ALL positions in a SINGLE batch update IMMEDIATELY
      // This gives us both benefits: low latency (no delay) + low overhead (1 RTDB write instead of 100)
      writeBatchShapePositions(canvasId, rtdbWriteQueue.current).catch(() => {
        // Silently ignore RTDB errors during drag
      })
      rtdbWriteQueue.current.clear()

      // Redraw the layer once after all nodes are updated (batch drawing for performance)
      const layer = stage.findOne('Layer')
      if (layer) {
        layer.batchDraw()
      }

      // Update cursor position during drag (since event bubbling is prevented)
      if (stage && user) {
        const pointerPosition = stage.getPointerPosition()
        if (pointerPosition) {
          const canvasPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
          updateCursor(canvasPos.x, canvasPos.y)
        }
      }
    },
    [selectedIds, user, viewport, updateCursor, canvasId, userId]
  )

  // Handle shape drag end (ensure final position is persisted) with multi-select support
  const handleShapeDragEnd = useCallback(
    async (shapeId: string, x: number, y: number) => {
      // Get initial position of the dragged shape
      const initialPos = initialDragPositions.current.get(shapeId)
      if (!initialPos) return

      // Calculate the delta from the INITIAL position
      const dx = x - initialPos.x
      const dy = y - initialPos.y

      // If multiple shapes are selected and this shape is one of them, save all selected shapes
      const shapesToSave = selectedIds.includes(shapeId) ? selectedIds : [shapeId]

      // PERFORMANCE: Flush any remaining RTDB writes before finalizing
      if (rtdbWriteQueue.current.size > 0) {
        await writeBatchShapePositions(canvasId, rtdbWriteQueue.current).catch(() => {})
        rtdbWriteQueue.current.clear()
      }

      // Batch all local updates for atomic state update
      const batchedUpdates: Record<string, Partial<Shape>> = {}

      try {
        await Promise.all(
          shapesToSave.map(async (id) => {
            // PERFORMANCE: Use cached data instead of array.find()
            const shapeData = cachedShapeData.current.get(id)
            const shapeInitialPos = initialDragPositions.current.get(id)
            if (!shapeData || !shapeInitialPos) return

            // Calculate updates based on cached shape type using INITIAL positions
            let updates: Partial<Shape>
            if (shapeData.isLine) {
              updates = {
                x: shapeInitialPos.x + dx,
                y: shapeInitialPos.y + dy,
                x2: shapeInitialPos.x2! + dx,
                y2: shapeInitialPos.y2! + dy,
              }
            } else if (shapeData.isBentConnector) {
              updates = {
                x: shapeInitialPos.x + dx,
                y: shapeInitialPos.y + dy,
                x2: shapeInitialPos.x2! + dx,
                y2: shapeInitialPos.y2! + dy,
                bendX: shapeInitialPos.bendX! + dx,
                bendY: shapeInitialPos.bendY! + dy,
              }
            } else {
              updates = { x: shapeInitialPos.x + dx, y: shapeInitialPos.y + dy }
            }

            // Add to batch
            batchedUpdates[id] = updates

            // Send final position to Firestore
            return updateShape(id, updates)
          })
        )

        // Single atomic local state update for ALL shapes
        setLocalShapeUpdates((prev) => ({
          ...prev,
          ...batchedUpdates
        }))

        // Clear RTDB positions for all moved shapes (cleanup temporary live data)
        await clearShapePositions(canvasId, shapesToSave).catch((error) => {
          console.error('[RTDB] Failed to clear positions:', error)
        })

        // PERFORMANCE: Clear all caches after drag end
        initialDragPositions.current.clear()
        movingShapeIds.current.clear()
        cachedNodes.current.clear()
        cachedShapeData.current.clear()
        selectionBoxNode.current = null
        initialSelectionBoxPos.current = null
      } catch (err) {
        console.error('Failed to update shape positions:', err)
        setError('Failed to save shape positions. Please try again.')
      }
    },
    [selectedIds, updateShape, canvasId]
  )

  // Resize handlers
  const handleResizeStart = useCallback((handle: ResizeHandle) => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    setIsResizing(true)
    setResizingHandle(handle)
    setResizeStart(screenToCanvas(pointerPosition.x, pointerPosition.y, viewport))

    // Multi-select resize
    if (selectedIds.length > 1) {
      const selectedShapes = shapes.filter(s => selectedIds.includes(s.id))

      // Calculate initial group bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

      selectedShapes.forEach(shape => {
        let left = shape.x, top = shape.y, right = shape.x, bottom = shape.y

        // Same bounds calculation as MultiSelectResizeHandles
        switch (shape.type) {
          case 'rectangle':
          case 'roundedRectangle':
          case 'cylinder':
            left = shape.x - shape.width / 2
            top = shape.y - shape.height / 2
            right = shape.x + shape.width / 2
            bottom = shape.y + shape.height / 2
            break
          case 'circle':
            left = shape.x - shape.radius
            top = shape.y - shape.radius
            right = shape.x + shape.radius
            bottom = shape.y + shape.radius
            break
          case 'ellipse':
          case 'triangle':
          case 'pentagon':
          case 'hexagon':
            left = shape.x - shape.radiusX
            top = shape.y - shape.radiusY
            right = shape.x + shape.radiusX
            bottom = shape.y + shape.radiusY
            break
          case 'star':
            left = shape.x - shape.outerRadiusX
            top = shape.y - shape.outerRadiusY
            right = shape.x + shape.outerRadiusX
            bottom = shape.y + shape.outerRadiusY
            break
          case 'text':
            left = shape.x
            top = shape.y
            right = shape.x + shape.width
            bottom = shape.y + (shape.height || shape.fontSize * 1.5)
            break
          case 'line':
          case 'arrow':
          case 'bidirectionalArrow':
            left = Math.min(shape.x, shape.x2)
            top = Math.min(shape.y, shape.y2)
            right = Math.max(shape.x, shape.x2)
            bottom = Math.max(shape.y, shape.y2)
            break
          case 'bentConnector':
            left = Math.min(shape.x, shape.bendX, shape.x2)
            top = Math.min(shape.y, shape.bendY, shape.y2)
            right = Math.max(shape.x, shape.bendX, shape.x2)
            bottom = Math.max(shape.y, shape.bendY, shape.y2)
            break
        }

        minX = Math.min(minX, left)
        minY = Math.min(minY, top)
        maxX = Math.max(maxX, right)
        maxY = Math.max(maxY, bottom)
      })

      setInitialGroupBounds({ minX, minY, maxX, maxY })
      setCurrentGroupBounds({ minX, minY, maxX, maxY })

      // PERFORMANCE: Cache Konva nodes and initial data for all shapes
      initialShapesData.current.clear()
      cachedNodes.current.clear()
      selectedShapes.forEach(shape => {
        initialShapesData.current.set(shape.id, { ...shape })

        // Cache Konva node for direct manipulation
        const node = stage.findOne(`#${shape.id}`)
        if (node) {
          cachedNodes.current.set(shape.id, node)
        }
      })
    } else if (selectedShapeId) {
      // Single shape resize
      const selectedShape = shapes.find(s => s.id === selectedShapeId)
      if (!selectedShape) return

      setInitialShapeDimensions({ ...selectedShape })
      setInitialGroupBounds(null)
      setCurrentGroupBounds(null)
    }
  }, [selectedIds, selectedShapeId, shapes, viewport])

  const handleResizeMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isResizing || !resizingHandle || !resizeStart) return

    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const currentPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)

    // Multi-select resize - scale all shapes proportionally
    if (selectedIds.length > 1 && initialGroupBounds) {
      const { minX, minY, maxX, maxY } = initialGroupBounds
      const initialWidth = maxX - minX
      const initialHeight = maxY - minY
      const initialCenterX = minX + initialWidth / 2
      const initialCenterY = minY + initialHeight / 2

      // Calculate new bounds based on handle and drag delta
      let newMinX = minX
      let newMinY = minY
      let newMaxX = maxX
      let newMaxY = maxY

      const deltaX = currentPos.x - resizeStart.x
      const deltaY = currentPos.y - resizeStart.y

      // Update bounds based on which handle is being dragged
      if (resizingHandle.includes('w')) newMinX = minX + deltaX
      if (resizingHandle.includes('e')) newMaxX = maxX + deltaX
      if (resizingHandle.includes('n')) newMinY = minY + deltaY
      if (resizingHandle.includes('s')) newMaxY = maxY + deltaY

      const newWidth = newMaxX - newMinX
      const newHeight = newMaxY - newMinY

      // Prevent negative or zero dimensions
      if (newWidth <= 10 || newHeight <= 10) return

      // Calculate scale factors
      const scaleX = newWidth / initialWidth
      const scaleY = newHeight / initialHeight

      // Calculate new center (changes when dragging from edges)
      const newCenterX = newMinX + newWidth / 2
      const newCenterY = newMinY + newHeight / 2

      // Apply transformations to all selected shapes
      selectedIds.forEach(id => {
        const initialShape = initialShapesData.current.get(id)
        if (!initialShape) return

        // Calculate shape's position relative to initial group center
        const relX = initialShape.x - initialCenterX
        const relY = initialShape.y - initialCenterY

        // Scale the relative position
        const newRelX = relX * scaleX
        const newRelY = relY * scaleY

        // Calculate new absolute position
        const newX = newCenterX + newRelX
        const newY = newCenterY + newRelY

        let updates: Partial<Shape> = { x: newX, y: newY }

        // Scale shape dimensions based on type
        if ('width' in initialShape && 'height' in initialShape) {
          (updates as any).width = initialShape.width * scaleX;
          (updates as any).height = initialShape.height * scaleY
        } else if ('radius' in initialShape && !('radiusX' in initialShape)) {
          // Circle - use average scale to maintain circular shape
          const avgScale = (scaleX + scaleY) / 2;
          (updates as any).radius = initialShape.radius * avgScale
        } else if ('radiusX' in initialShape && 'radiusY' in initialShape) {
          (updates as any).radiusX = initialShape.radiusX * scaleX;
          (updates as any).radiusY = initialShape.radiusY * scaleY
        } else if ('outerRadiusX' in initialShape && 'outerRadiusY' in initialShape) {
          // Star
          (updates as any).outerRadiusX = initialShape.outerRadiusX * scaleX;
          (updates as any).outerRadiusY = initialShape.outerRadiusY * scaleY
          if ('innerRadiusX' in initialShape && 'innerRadiusY' in initialShape) {
            (updates as any).innerRadiusX = initialShape.innerRadiusX * scaleX;
            (updates as any).innerRadiusY = initialShape.innerRadiusY * scaleY
          }
        } else if ('x2' in initialShape && 'y2' in initialShape) {
          // Lines, arrows, connectors - scale endpoints
          const relX2 = initialShape.x2 - initialCenterX
          const relY2 = initialShape.y2 - initialCenterY;
          (updates as any).x2 = newCenterX + relX2 * scaleX;
          (updates as any).y2 = newCenterY + relY2 * scaleY

          if ('bendX' in initialShape && 'bendY' in initialShape) {
            // Bent connector - also scale bend point
            const relBendX = initialShape.bendX - initialCenterX
            const relBendY = initialShape.bendY - initialCenterY;
            (updates as any).bendX = newCenterX + relBendX * scaleX;
            (updates as any).bendY = newCenterY + relBendY * scaleY
          }
        }

        // PERFORMANCE: Direct Konva manipulation (bypass React for ultra-smooth resize)
        const node = cachedNodes.current.get(id)
        if (node) {
          // Update position
          node.x(newX)
          node.y(newY)

          // Update dimensions based on shape type
          if ('width' in initialShape && 'height' in initialShape) {
            node.width(initialShape.width * scaleX)
            node.height(initialShape.height * scaleY)
          } else if ('radius' in initialShape && !('radiusX' in initialShape)) {
            const avgScale = (scaleX + scaleY) / 2
            node.radius(initialShape.radius * avgScale)
          } else if ('radiusX' in initialShape && 'radiusY' in initialShape) {
            node.radiusX(initialShape.radiusX * scaleX)
            node.radiusY(initialShape.radiusY * scaleY)
          } else if ('outerRadiusX' in initialShape && 'outerRadiusY' in initialShape) {
            // Star - uses separate X/Y radii, not a single radius property
            node.outerRadius(initialShape.outerRadiusX * scaleX)
            node.innerRadius(initialShape.innerRadiusX * scaleX)
          } else if ('x2' in initialShape && 'y2' in initialShape) {
            // Lines/arrows/connectors - update points array
            const newX2 = newCenterX + (initialShape.x2 - initialCenterX) * scaleX
            const newY2 = newCenterY + (initialShape.y2 - initialCenterY) * scaleY

            if ('bendX' in initialShape && 'bendY' in initialShape) {
              // Bent connector
              const newBendX = newCenterX + (initialShape.bendX - initialCenterX) * scaleX
              const newBendY = newCenterY + (initialShape.bendY - initialCenterY) * scaleY
              node.points([
                0, 0,
                newBendX - newX, newBendY - newY,
                newX2 - newX, newY2 - newY
              ])
            } else {
              // Regular line/arrow
              node.points([0, 0, newX2 - newX, newY2 - newY])
            }
          }
        }

        // Queue RTDB write for multi-user collaboration
        rtdbWriteQueue.current.set(id, updates)
      })

      // PERFORMANCE: Single batch RTDB write for all shapes
      writeBatchShapePositions(canvasId, rtdbWriteQueue.current).catch(() => {})
      rtdbWriteQueue.current.clear()

      // Calculate actual bounding box from transformed shapes
      let actualMinX = Infinity, actualMinY = Infinity, actualMaxX = -Infinity, actualMaxY = -Infinity

      selectedIds.forEach(id => {
        const node = cachedNodes.current.get(id)
        const initialShape = initialShapesData.current.get(id)
        if (!node || !initialShape) return

        const x = node.x()
        const y = node.y()
        let left = x, top = y, right = x, bottom = y

        // Calculate bounds based on shape type
        switch (initialShape.type) {
          case 'rectangle':
          case 'roundedRectangle':
          case 'cylinder':
            // Rectangle-like shapes (center-based)
            const width = node.width()
            const height = node.height()
            left = x - width / 2
            top = y - height / 2
            right = x + width / 2
            bottom = y + height / 2
            break

          case 'circle':
            // Circle
            const radius = node.radius()
            left = x - radius
            top = y - radius
            right = x + radius
            bottom = y + radius
            break

          case 'ellipse':
          case 'triangle':
          case 'pentagon':
          case 'hexagon':
            // Ellipse, polygon
            const radiusX = node.radiusX()
            const radiusY = node.radiusY()
            left = x - radiusX
            top = y - radiusY
            right = x + radiusX
            bottom = y + radiusY
            break

          case 'star':
            // Star
            const outerRadius = node.outerRadius()
            left = x - outerRadius
            top = y - outerRadius
            right = x + outerRadius
            bottom = y + outerRadius
            break

          case 'text':
            // Text (top-left based)
            const textWidth = node.width()
            const textHeight = node.height()
            left = x
            top = y
            right = x + textWidth
            bottom = y + textHeight
            break

          case 'line':
          case 'arrow':
          case 'bidirectionalArrow':
          case 'bentConnector':
            // Lines/connectors - get from points array
            const points = node.points()
            const xs = [x]
            const ys = [y]
            for (let i = 0; i < points.length; i += 2) {
              xs.push(x + points[i])
              ys.push(y + points[i + 1])
            }
            left = Math.min(...xs)
            top = Math.min(...ys)
            right = Math.max(...xs)
            bottom = Math.max(...ys)
            break
        }

        actualMinX = Math.min(actualMinX, left)
        actualMinY = Math.min(actualMinY, top)
        actualMaxX = Math.max(actualMaxX, right)
        actualMaxY = Math.max(actualMaxY, bottom)
      })

      // Update current group bounds with actual calculated bounds
      setCurrentGroupBounds({ minX: actualMinX, minY: actualMinY, maxX: actualMaxX, maxY: actualMaxY })

      // Redraw layer once for all updates
      const layer = stage.findOne('Layer')
      if (layer) {
        layer.batchDraw()
      }

      return
    }

    // Single shape resize
    if (!selectedShapeId || !initialShapeDimensions) return

    const currentPosForSingle = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
    let deltaX = currentPosForSingle.x - resizeStart.x
    let deltaY = currentPosForSingle.y - resizeStart.y

    const shiftPressed = e.evt?.shiftKey || false
    let updates: Partial<Shape> = {}

    // Calculate new dimensions based on shape type
    const shape = initialShapeDimensions

    // Transform deltas to shape's local coordinate system if shape is rotated
    // This ensures resize behaves correctly regardless of shape rotation
    // Skip for lines/arrows/connectors as they use absolute endpoint coordinates
    const isLineShape = 'x2' in shape && 'y2' in shape
    if (shape.rotation && shape.rotation !== 0 && !isLineShape) {
      const rotationRad = -(shape.rotation * Math.PI / 180) // Negative to reverse rotation
      const cos = Math.cos(rotationRad)
      const sin = Math.sin(rotationRad)
      const rotatedDeltaX = deltaX * cos - deltaY * sin
      const rotatedDeltaY = deltaX * sin + deltaY * cos
      deltaX = rotatedDeltaX
      deltaY = rotatedDeltaY
    }

    // Determine if this is a corner handle (should preserve aspect ratio)
    const isCornerHandle = resizingHandle.length === 2 // 'nw', 'ne', 'sw', 'se' are 2 chars
    const maintainAspectRatio = isCornerHandle || shiftPressed

    // Text shapes - edge resize changes box size, corner resize changes fontSize
    if (shape.type === 'text') {
      // Corner handles (diagonal) - change fontSize proportionally
      if (isCornerHandle) {
        const horizontalChange = resizingHandle.includes('e') ? deltaX : -deltaX
        const verticalChange = resizingHandle.includes('s') ? deltaY : -deltaY
        const fontSizeChange = (horizontalChange + verticalChange) * 0.2

        let newFontSize = shape.fontSize + fontSizeChange

        // Clamp fontSize to reasonable limits
        const MIN_FONT_SIZE = 8
        const MAX_FONT_SIZE = 200
        newFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newFontSize))

        updates = {
          x: shape.x,
          y: shape.y,
          fontSize: newFontSize,
        }
      }
      // Edge handles - resize the text box without changing fontSize
      else {
        let newWidth = shape.width
        let newHeight = shape.height

        // Horizontal resize (change width)
        if (resizingHandle.includes('e')) {
          newWidth = shape.width + deltaX
        } else if (resizingHandle.includes('w')) {
          newWidth = shape.width - deltaX
        }

        // Vertical resize (change height)
        if (resizingHandle.includes('s')) {
          newHeight = shape.height + deltaY
        } else if (resizingHandle.includes('n')) {
          newHeight = shape.height - deltaY
        }

        // Minimum size constraints
        const MIN_TEXT_WIDTH = 50
        const MIN_TEXT_HEIGHT = 20
        newWidth = Math.max(MIN_TEXT_WIDTH, newWidth)
        newHeight = Math.max(MIN_TEXT_HEIGHT, newHeight)

        updates = {
          x: shape.x,
          y: shape.y,
          width: newWidth,
          height: newHeight,
        }
      }
    }
    // Rectangular shapes (rectangle, roundedRectangle, cylinder)
    else if ('width' in shape && 'height' in shape) {
      const result = calculateRectangleResize(shape, resizingHandle, deltaX, deltaY, maintainAspectRatio)
      updates = result
    }
    // Ellipse and polygons (two radii: radiusX and radiusY)
    else if ('radiusX' in shape && 'radiusY' in shape) {
      const result = calculateEllipseResize(shape, resizingHandle, deltaX, deltaY, maintainAspectRatio)
      updates = result
    }
    // Circle (single radius)
    else if ('radius' in shape && !('radiusX' in shape) && !('outerRadius' in shape)) {
      const result = calculateCircleResize(shape, resizingHandle, deltaX, deltaY)
      updates = result
    }
    // Star (outerRadiusX/Y and innerRadiusX/Y)
    else if ('outerRadiusX' in shape && 'outerRadiusY' in shape && 'innerRadiusX' in shape && 'innerRadiusY' in shape) {
      // Maintain the ratio between inner and outer radii
      const ratioX = shape.innerRadiusX / shape.outerRadiusX
      const ratioY = shape.innerRadiusY / shape.outerRadiusY

      let newOuterRadiusX = shape.outerRadiusX
      let newOuterRadiusY = shape.outerRadiusY

      // Calculate radius changes based on handle direction
      if (resizingHandle.includes('e')) {
        newOuterRadiusX = shape.outerRadiusX + deltaX
      } else if (resizingHandle.includes('w')) {
        newOuterRadiusX = shape.outerRadiusX - deltaX
      }

      if (resizingHandle.includes('s')) {
        newOuterRadiusY = shape.outerRadiusY + deltaY
      } else if (resizingHandle.includes('n')) {
        newOuterRadiusY = shape.outerRadiusY - deltaY
      }

      // For corner handles, maintain aspect ratio
      if (isCornerHandle || maintainAspectRatio) {
        const avgChange = ((newOuterRadiusX - shape.outerRadiusX) + (newOuterRadiusY - shape.outerRadiusY)) / 2
        newOuterRadiusX = shape.outerRadiusX + avgChange
        newOuterRadiusY = shape.outerRadiusY + avgChange
      }

      // Maintain inner/outer ratio
      let newInnerRadiusX = newOuterRadiusX * ratioX
      let newInnerRadiusY = newOuterRadiusY * ratioY

      const MIN_OUTER_RADIUS = 10
      const MIN_INNER_RADIUS = 5
      if (newOuterRadiusX < MIN_OUTER_RADIUS) newOuterRadiusX = MIN_OUTER_RADIUS
      if (newOuterRadiusY < MIN_OUTER_RADIUS) newOuterRadiusY = MIN_OUTER_RADIUS
      if (newInnerRadiusX < MIN_INNER_RADIUS) newInnerRadiusX = MIN_INNER_RADIUS
      if (newInnerRadiusY < MIN_INNER_RADIUS) newInnerRadiusY = MIN_INNER_RADIUS

      updates = {
        x: shape.x,
        y: shape.y,
        outerRadiusX: newOuterRadiusX,
        outerRadiusY: newOuterRadiusY,
        innerRadiusX: newInnerRadiusX,
        innerRadiusY: newInnerRadiusY
      }
    }
    // Lines and arrows (x2, y2 endpoints)
    else if ('x2' in shape && 'y2' in shape) {
      // Check if it's a bent connector (has bendX and bendY)
      if ('bendX' in shape && 'bendY' in shape) {
        // For bent connectors, handle 3 control points
        if (resizingHandle === 'nw') {
          // Start point
          const newX = shape.x + deltaX
          const newY = shape.y + deltaY
          updates = { x: newX, y: newY } as Partial<Shape>
        } else if (resizingHandle === 'n') {
          // Bend point
          const newBendX = shape.bendX + deltaX
          const newBendY = shape.bendY + deltaY
          updates = { bendX: newBendX, bendY: newBendY } as Partial<Shape>
        } else if (resizingHandle === 'se') {
          // End point
          const newX2 = shape.x2 + deltaX
          const newY2 = shape.y2 + deltaY
          updates = { x2: newX2, y2: newY2 } as Partial<Shape>
        }
      } else {
        // For regular lines/arrows, handle 2 endpoints
        if (resizingHandle === 'nw') {
          // Start point (x, y)
          const newX = shape.x + deltaX
          const newY = shape.y + deltaY
          updates = { x: newX, y: newY } as Partial<Shape>
        } else if (resizingHandle === 'se') {
          // End point (x2, y2)
          const newX2 = shape.x2 + deltaX
          const newY2 = shape.y2 + deltaY
          updates = { x2: newX2, y2: newY2 } as Partial<Shape>
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      updateShapeLocal(selectedShapeId, updates)
      updateShapeThrottled(selectedShapeId, updates)
    }
  }, [isResizing, resizingHandle, resizeStart, selectedShapeId, initialShapeDimensions, selectedIds, initialGroupBounds, viewport, updateShapeLocal, updateShapeThrottled])

  const handleResizeEnd = useCallback(async () => {
    if (!isResizing) return

    setIsResizing(false)
    setResizingHandle(null)
    setResizeStart(null)
    setInitialShapeDimensions(null)
    setInitialGroupBounds(null)
    setCurrentGroupBounds(null)

    // Multi-select resize - read final state from Konva nodes and save to Firestore
    if (selectedIds.length > 1) {
      try {
        await Promise.all(
          selectedIds.map(id => {
            const node = cachedNodes.current.get(id)
            const initialShape = initialShapesData.current.get(id)
            if (!node || !initialShape) return Promise.resolve()

            // Read final values from Konva node
            let updates: Partial<Shape> = {
              x: node.x(),
              y: node.y()
            }

            // Read dimensions based on shape type
            if ('width' in initialShape && 'height' in initialShape) {
              (updates as any).width = node.width();
              (updates as any).height = node.height()
            } else if ('radius' in initialShape && !('radiusX' in initialShape)) {
              (updates as any).radius = node.radius()
            } else if ('radiusX' in initialShape && 'radiusY' in initialShape) {
              (updates as any).radiusX = node.radiusX();
              (updates as any).radiusY = node.radiusY()
            } else if ('outerRadiusX' in initialShape && 'outerRadiusY' in initialShape) {
              // Star - read from node and store as X/Y properties
              const outerRadius = node.outerRadius()
              const innerRadius = node.innerRadius();
              (updates as any).outerRadiusX = outerRadius;
              (updates as any).outerRadiusY = outerRadius;
              (updates as any).innerRadiusX = innerRadius;
              (updates as any).innerRadiusY = innerRadius
            } else if ('x2' in initialShape && 'y2' in initialShape) {
              // Lines/arrows - calculate from points array
              const points = node.points()
              const x = node.x()
              const y = node.y();
              (updates as any).x2 = x + points[points.length - 2];
              (updates as any).y2 = y + points[points.length - 1]

              if ('bendX' in initialShape && 'bendY' in initialShape && points.length === 6) {
                (updates as any).bendX = x + points[2];
                (updates as any).bendY = y + points[3]
              }
            }

            return updateShape(id, updates)
          })
        )
        initialShapesData.current.clear()
        cachedNodes.current.clear()
      } catch (err) {
        console.error('Failed to save group resize:', err)
        setError('Failed to save resize. Please try again.')
      }
    }
    // Single shape resize
    else if (selectedShapeId) {
      const currentShape = shapes.find(s => s.id === selectedShapeId)
      if (currentShape) {
        try {
          await updateShape(selectedShapeId, { ...localShapeUpdates[selectedShapeId] })
        } catch (err) {
          console.error('Failed to save final resize:', err)
          setError('Failed to save resize. Please try again.')
        }
      }
    }
  }, [selectedIds, selectedShapeId, isResizing, shapes, localShapeUpdates, updateShape])

  // Rotation handlers
  const handleRotationStart = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const currentPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)

    // Multi-select rotation
    if (selectedIds.length > 1) {
      const selectedShapes = shapes.filter(s => selectedIds.includes(s.id))

      // Calculate group center
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      selectedShapes.forEach(shape => {
        minX = Math.min(minX, shape.x)
        minY = Math.min(minY, shape.y)
        maxX = Math.max(maxX, shape.x)
        maxY = Math.max(maxY, shape.y)
      })

      const groupCenterX = (minX + maxX) / 2
      const groupCenterY = (minY + maxY) / 2

      // Calculate initial angle relative to group center
      const deltaX = currentPos.x - groupCenterX
      const deltaY = currentPos.y - groupCenterY
      const initialAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI

      // Store initial data for all shapes
      initialShapesData.current.clear()
      selectedShapes.forEach(shape => {
        initialShapesData.current.set(shape.id, { ...shape })
      })

      setInitialGroupBounds({ minX, minY, maxX, maxY })
      setIsRotating(true)
      setRotationStart({
        angle: initialAngle,
        initialRotation: 0 // Not used for multi-select
      })
    }
    // Single shape rotation
    else if (selectedShapeId) {
      const selectedShape = shapes.find(s => s.id === selectedShapeId)
      if (!selectedShape) return

      const initialAngle = calculateRotationDelta(selectedShape, currentPos.x, currentPos.y)

      setIsRotating(true)
      setRotationStart({
        angle: initialAngle,
        initialRotation: selectedShape.rotation
      })
    }
  }, [selectedIds, selectedShapeId, shapes, viewport])

  const handleRotationMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isRotating || !rotationStart) return

    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const currentPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)

    // Multi-select rotation - rotate all shapes around group center
    if (selectedIds.length > 1 && initialGroupBounds) {
      const { minX, minY, maxX, maxY } = initialGroupBounds
      const groupCenterX = (minX + maxX) / 2
      const groupCenterY = (minY + maxY) / 2

      // Calculate current angle relative to group center
      const deltaX = currentPos.x - groupCenterX
      const deltaY = currentPos.y - groupCenterY
      const currentAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI

      // Calculate rotation delta
      let angleDelta = currentAngle - rotationStart.angle

      // Snap to 15-degree increments if shift is pressed
      if (e.evt?.shiftKey) {
        angleDelta = Math.round(angleDelta / 15) * 15
      }

      const angleRad = angleDelta * Math.PI / 180

      // Rotate all shapes around group center
      selectedIds.forEach(id => {
        const initialShape = initialShapesData.current.get(id)
        if (!initialShape) return

        // Calculate position relative to group center
        const relX = initialShape.x - groupCenterX
        const relY = initialShape.y - groupCenterY

        // Rotate position around group center
        const cos = Math.cos(angleRad)
        const sin = Math.sin(angleRad)
        const newRelX = relX * cos - relY * sin
        const newRelY = relX * sin + relY * cos

        // Calculate new absolute position
        const newX = groupCenterX + newRelX
        const newY = groupCenterY + newRelY

        // Update shape position and rotation
        const newRotation = normalizeAngle((initialShape.rotation || 0) + angleDelta)

        let updates: Partial<Shape> = {
          x: newX,
          y: newY,
          rotation: newRotation
        }

        // For lines/arrows/connectors, also rotate endpoints
        if ('x2' in initialShape && 'y2' in initialShape) {
          const relX2 = initialShape.x2 - groupCenterX
          const relY2 = initialShape.y2 - groupCenterY
          const newRelX2 = relX2 * cos - relY2 * sin
          const newRelY2 = relX2 * sin + relY2 * cos;
          (updates as any).x2 = groupCenterX + newRelX2;
          (updates as any).y2 = groupCenterY + newRelY2

          if ('bendX' in initialShape && 'bendY' in initialShape) {
            const relBendX = initialShape.bendX - groupCenterX
            const relBendY = initialShape.bendY - groupCenterY
            const newRelBendX = relBendX * cos - relBendY * sin
            const newRelBendY = relBendX * sin + relBendY * cos;
            (updates as any).bendX = groupCenterX + newRelBendX;
            (updates as any).bendY = groupCenterY + newRelBendY
          }
        }

        updateShapeLocal(id, updates)
      })
    }
    // Single shape rotation
    else if (selectedShapeId) {
      const selectedShape = shapes.find(s => s.id === selectedShapeId)
      if (!selectedShape) return

      const currentAngle = calculateRotationDelta(selectedShape, currentPos.x, currentPos.y)

      // Calculate the angle delta from the initial drag position
      let angleDelta = currentAngle - rotationStart.angle

      // Calculate new rotation by adding delta to initial rotation
      let newRotation = rotationStart.initialRotation + angleDelta

      // Normalize to 0-360 range
      newRotation = normalizeAngle(newRotation)

      // Snap to 15-degree increments if shift is pressed
      if (e.evt?.shiftKey) {
        newRotation = snapAngle(newRotation, 15)
      }

      updateShapeLocal(selectedShapeId, { rotation: newRotation })
      updateShapeThrottled(selectedShapeId, { rotation: newRotation })
    }
  }, [isRotating, selectedIds, selectedShapeId, rotationStart, initialGroupBounds, shapes, viewport, updateShapeLocal, updateShapeThrottled])

  const handleRotationEnd = useCallback(async () => {
    if (!isRotating) return

    setIsRotating(false)
    setRotationStart(null)
    setInitialGroupBounds(null)

    // Multi-select rotation - save all shapes
    if (selectedIds.length > 1) {
      try {
        await Promise.all(
          selectedIds.map(id => {
            const updates = localShapeUpdates[id]
            if (updates) {
              return updateShape(id, updates)
            }
            return Promise.resolve()
          })
        )
        initialShapesData.current.clear()
      } catch (err) {
        console.error('Failed to save group rotation:', err)
        setError('Failed to save rotation. Please try again.')
      }
    }
    // Single shape rotation
    else if (selectedShapeId) {
      const currentShape = shapes.find(s => s.id === selectedShapeId)
      if (currentShape) {
        try {
          await updateShape(selectedShapeId, { rotation: currentShape.rotation })
        } catch (err) {
          console.error('Failed to save final rotation:', err)
          setError('Failed to save rotation. Please try again.')
        }
      }
    }
  }, [selectedIds, selectedShapeId, isRotating, shapes, localShapeUpdates, updateShape])

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

  const handleResetView = useCallback(() => {
    updateViewport({
      x: 0,
      y: 0,
      zoom: CANVAS_CONFIG.DEFAULT_ZOOM,
    })
  }, [updateViewport])

  // Calculate toolbar position above text shape
  const calculateToolbarPosition = (shape: Text): { x: number; y: number } => {
    const screenX = shape.x * viewport.zoom + viewport.x
    const screenY = shape.y * viewport.zoom + viewport.y

    const toolbarHeight = 60
    const toolbarWidth = 700 // Approximate

    let x = screenX
    let y = screenY - toolbarHeight - 1

    // If toolbar would go above screen, show below
    if (y < 0) {
      y = screenY + (shape.fontSize * shape.lineHeight * viewport.zoom) + 1
    }

    // Keep toolbar on screen horizontally
    const maxX = window.innerWidth - toolbarWidth
    if (x > maxX) {
      x = maxX
    }
    if (x < 0) {
      x = 0
    }

    return { x, y }
  }

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
        position: 'absolute',
        top: `${CANVAS_CONFIG.HEADER_HEIGHT}px`,
        left: 0,
        width: '100%',
        height: `calc(100vh - ${CANVAS_CONFIG.HEADER_HEIGHT}px)`,
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      {/* Toolbar */}
      <Toolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
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
          if ('fill' in selectedShape && selectedShape.fill !== undefined) {
            (updates as any).fill = color
          }
          if ('stroke' in selectedShape && selectedShape.stroke !== undefined) {
            (updates as any).stroke = color
          }
          if (Object.keys(updates).length > 0) {
            updateShapeLocal(selectedShapeId, updates)
            updateShape(selectedShapeId, updates).catch(err => {
              console.error('Failed to update shape color:', err)
            })
          }
        } : undefined}
        zoomPercentage={Math.round(viewport.zoom * 100)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onResetView={handleResetView}
        onAskVega={onAskVega}
        isVegaOpen={isVegaOpen}
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
          <span style={{ fontSize: '14px', color: '#1F2937 !important' }}>Loading shapes...</span>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - CANVAS_CONFIG.HEADER_HEIGHT}
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

          {/* Render shapes (using viewport culling for performance) */}
          {visibleShapes.map((shape) => (
            <ShapeRenderer
              key={shape.id}
              shape={shape}
              isSelected={selectedIds.includes(shape.id)}
              onSelect={(shiftKey) => handleShapeSelect(shape.id, shiftKey)}
              onDragStart={() => {
                setIsDraggingShape(true)
                handleShapeDragStart(shape.id)
              }}
              onDragMove={(x, y) => {
                handleShapeDragMove(shape.id, x, y)
              }}
              onDragEnd={(x, y) => {
                setIsDraggingShape(false)
                handleShapeDragEnd(shape.id, x, y)
              }}
            />
          ))}

          {/* Drag-to-select box */}
          {isBoxSelecting && selectionBox && (
            <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3B82F6"
              strokeWidth={1 / viewport.zoom}
              dash={[5 / viewport.zoom, 5 / viewport.zoom]}
              listening={false}
            />
          )}

          {/* Live selection box during multi-select resize */}
          {isResizing && currentGroupBounds && selectedIds.length > 1 && (
            <Rect
              id="multi-select-box"
              x={currentGroupBounds.minX}
              y={currentGroupBounds.minY}
              width={currentGroupBounds.maxX - currentGroupBounds.minX}
              height={currentGroupBounds.maxY - currentGroupBounds.minY}
              stroke="#3B82F6"
              strokeWidth={2 / viewport.zoom}
              dash={[8 / viewport.zoom, 4 / viewport.zoom]}
              listening={false}
            />
          )}

          {/* Multi-select resize handles (hide while dragging, resizing, or rotating) */}
          {selectedIds.length > 1 && !isDraggingShape && !isResizing && !isRotating && (() => {
            const selectedShapes = shapes.filter(s => selectedIds.includes(s.id))
            if (selectedShapes.length === 0) return null

            return (
              <MultiSelectResizeHandles
                shapes={selectedShapes}
                onResizeStart={handleResizeStart}
                onRotationStart={handleRotationStart}
                viewport={viewport}
              />
            )
          })()}

          {/* Text creation preview */}
          {selectedTool === 'text' && textPreviewPos && (
            <>
              <Rect
                x={textPreviewPos.x - 4}
                y={textPreviewPos.y - 2}
                width={80}
                height={24}
                stroke="#3B82F6"
                strokeWidth={2}
                dash={[5, 5]}
                fill="transparent"
                listening={false}
              />
              <KonvaText
                x={textPreviewPos.x}
                y={textPreviewPos.y}
                text="Add text"
                fontSize={16}
                fontFamily="Inter"
                fill="#9ca3af"
                listening={false}
              />
            </>
          )}

          {/* Resize handles for single selected shape (hide while dragging, resizing, rotating, or editing text) */}
          {selectedIds.length === 1 && selectedShapeId && !isDraggingShape && !isResizing && !isRotating && !editingTextId && (() => {
            const selectedShape = shapes.find(s => s.id === selectedShapeId)
            if (!selectedShape) return null

            return (
              <ResizeHandles
                shape={selectedShape}
                onResizeStart={handleResizeStart}
                onRotationStart={handleRotationStart}
              />
            )
          })()}
        </Layer>
      </Stage>

      {/* Multiplayer cursors overlay */}
      <CursorOverlay cursors={cursors} activeUsers={activeUsers} viewport={viewport} />

      {/* Text Edit Overlay */}
      {editingTextId && (() => {
        const editingShape = shapes.find(s => s.id === editingTextId)
        if (!editingShape || editingShape.type !== 'text') return null

        return (
          <TextEditOverlay
            shape={editingShape}
            stagePosition={{ x: viewport.x, y: viewport.y }}
            stageScale={viewport.zoom}
            onTextChange={(text, width, height) => {
              const updates: Partial<Text> = { text }
              if (width !== undefined) updates.width = width
              if (height !== undefined) updates.height = height
              updateShape(editingTextId, updates)
            }}
            onExitEdit={() => {
              setEditingTextId(null)
              // If text is empty, delete the shape
              if (editingShape.text.trim() === '') {
                deleteShape(editingTextId)
              }
            }}
          />
        )
      })()}

      {/* Floating Text Toolbar - hide while dragging */}
      {selectedTextId && !isDraggingShape && (() => {
        const selectedShape = shapes.find(s => s.id === selectedTextId)
        if (!selectedShape || selectedShape.type !== 'text') return null

        const position = calculateToolbarPosition(selectedShape)

        return (
          <FloatingTextToolbar
            position={position}
            fontFamily={selectedShape.fontFamily}
            fontSize={selectedShape.fontSize}
            fontWeight={selectedShape.fontWeight}
            fontStyle={selectedShape.fontStyle}
            textDecoration={selectedShape.textDecoration}
            align={selectedShape.align}
            lineHeight={selectedShape.lineHeight}
            color={selectedShape.fill}
            onFontFamilyChange={(fontFamily) => {
              updateShape(selectedTextId, { fontFamily })
            }}
            onFontSizeChange={(fontSize) => {
              updateShape(selectedTextId, { fontSize })
            }}
            onToggleBold={() => {
              const newWeight = selectedShape.fontWeight === 700 ? 400 : 700
              updateShape(selectedTextId, { fontWeight: newWeight })
            }}
            onToggleItalic={() => {
              const newStyle = selectedShape.fontStyle === 'italic' ? 'normal' : 'italic'
              updateShape(selectedTextId, { fontStyle: newStyle })
            }}
            onToggleUnderline={() => {
              const newDecoration = selectedShape.textDecoration === 'underline' ? 'none' : 'underline'
              updateShape(selectedTextId, { textDecoration: newDecoration })
            }}
            onAlignChange={(align) => {
              updateShape(selectedTextId, { align })
            }}
            onLineHeightChange={(lineHeight) => {
              updateShape(selectedTextId, { lineHeight })
            }}
            onColorChange={(fill) => {
              updateShape(selectedTextId, { fill })
            }}
          />
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

