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
import { ZoomControls } from './ZoomControls'
import { ShapeRenderer } from './ShapeRenderer'
import { TextEditOverlay } from './TextEditOverlay'
import { FloatingTextToolbar } from './FloatingTextToolbar'
import { ResizeHandles } from './ResizeHandles'
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
import { throttle } from '@/utils/throttle'
import type { Shape, Text } from '@/types/shapes'
import { calculateRectangleResize, calculateCircleResize, calculateEllipseResize } from '@/utils/resizeCalculations'
import { calculateRotationDelta, snapAngle, normalizeAngle } from '@/utils/rotationCalculations'
import type { ResizeHandle } from '@/utils/resizeCalculations'

interface CanvasProps {
  onPresenceChange?: (activeUsers: import('@/types/user').Presence[]) => void
  onMountCleanup?: (cleanup: () => Promise<void>) => void
}

export function Canvas({ onPresenceChange, onMountCleanup }: CanvasProps = {}) {
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
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  // @ts-ignore - Used in later tasks
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)

  // Pan state (for spacebar + drag)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)

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

  // Rotation state
  const [isRotating, setIsRotating] = useState(false)
  const [rotationStart, setRotationStart] = useState<{ angle: number; initialRotation: number } | null>(null)

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

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't interfere with input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

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

  // Handle mouse down for panning and text creation
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    // Handle panning
    if (isPanning) {
      const pointerPosition = stage.getPointerPosition()
      if (pointerPosition) {
        setPanStart(pointerPosition)
      }
      return
    }

    // Handle text tool drag start
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty && selectedTool === 'text') {
      setIsDraggingText(true)
    }
  }

  // Handle mouse up for panning and text creation
  const handleMouseUp = async () => {
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

    // Handle text drop
    if (isDraggingText && textPreviewPos) {
      // Create text at the current preview position
      const newShape = createDefaultText(textPreviewPos.x, textPreviewPos.y, userId, userColor)

      try {
        await createShape(newShape)
        // Automatically enter edit mode for new text
        setEditingTextId(newShape.id)
        setSelectedShapeId(newShape.id)
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

  // Handle stage click for creating shapes
  const handleStageClick = async (e: KonvaEventObject<MouseEvent>) => {
    // If clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()

    if (clickedOnEmpty) {
      // Deselect shape
      setSelectedShapeId(null)
      setSelectedTextId(null)

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

  // Handle shape selection
  const handleShapeSelect = (shapeId: string) => {
    const shape = shapes.find(s => s.id === shapeId)
    if (shape?.type === 'text') {
      setSelectedTextId(shapeId)
    } else {
      setSelectedTextId(null)
    }
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

  // Resize handlers
  const handleResizeStart = useCallback((handle: ResizeHandle) => {
    const stage = stageRef.current
    if (!stage || !selectedShapeId) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const selectedShape = shapes.find(s => s.id === selectedShapeId)
    if (!selectedShape) return

    setIsResizing(true)
    setResizingHandle(handle)
    setResizeStart(screenToCanvas(pointerPosition.x, pointerPosition.y, viewport))
    setInitialShapeDimensions({ ...selectedShape })
  }, [selectedShapeId, shapes, viewport])

  const handleResizeMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isResizing || !resizingHandle || !resizeStart || !selectedShapeId || !initialShapeDimensions) return

    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const currentPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
    let deltaX = currentPos.x - resizeStart.x
    let deltaY = currentPos.y - resizeStart.y

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
  }, [isResizing, resizingHandle, resizeStart, selectedShapeId, initialShapeDimensions, viewport, updateShapeLocal, updateShapeThrottled])

  const handleResizeEnd = useCallback(async () => {
    if (!selectedShapeId || !isResizing) return

    setIsResizing(false)
    setResizingHandle(null)
    setResizeStart(null)
    setInitialShapeDimensions(null)

    // Final update to ensure sync
    const currentShape = shapes.find(s => s.id === selectedShapeId)
    if (currentShape) {
      try {
        await updateShape(selectedShapeId, { ...localShapeUpdates[selectedShapeId] })
      } catch (err) {
        console.error('Failed to save final resize:', err)
        setError('Failed to save resize. Please try again.')
      }
    }
  }, [selectedShapeId, isResizing, shapes, localShapeUpdates, updateShape])

  // Rotation handlers
  const handleRotationStart = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return

    const selectedShape = shapes.find(s => s.id === selectedShapeId)
    if (!selectedShape) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const currentPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
    const initialAngle = calculateRotationDelta(selectedShape, currentPos.x, currentPos.y)

    setIsRotating(true)
    setRotationStart({
      angle: initialAngle,
      initialRotation: selectedShape.rotation
    })
  }, [selectedShapeId, shapes, viewport])

  const handleRotationMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isRotating || !selectedShapeId || !rotationStart) return

    const stage = stageRef.current
    if (!stage) return

    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return

    const selectedShape = shapes.find(s => s.id === selectedShapeId)
    if (!selectedShape) return

    const currentPos = screenToCanvas(pointerPosition.x, pointerPosition.y, viewport)
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
  }, [isRotating, selectedShapeId, rotationStart, shapes, viewport, updateShapeLocal, updateShapeThrottled])

  const handleRotationEnd = useCallback(async () => {
    if (!selectedShapeId || !isRotating) return

    setIsRotating(false)
    setRotationStart(null)

    // Final update to ensure sync
    const currentShape = shapes.find(s => s.id === selectedShapeId)
    if (currentShape) {
      try {
        await updateShape(selectedShapeId, { rotation: currentShape.rotation })
      } catch (err) {
        console.error('Failed to save final rotation:', err)
        setError('Failed to save rotation. Please try again.')
      }
    }
  }, [selectedShapeId, isRotating, shapes, updateShape])

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
      />

      {/* Zoom Controls - Bottom Right Corner */}
      <ZoomControls
        zoomPercentage={Math.round(viewport.zoom * 100)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onResetView={handleResetView}
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
              onDragMove={(x, y) => {
                setIsDraggingShape(true)
                handleShapeDragMove(shape.id, x, y)
              }}
              onDragEnd={(x, y) => {
                setIsDraggingShape(false)
                handleShapeDragEnd(shape.id, x, y)
              }}
            />
          ))}

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

          {/* Resize handles for selected shape (hide while dragging, resizing, rotating, or editing text) */}
          {selectedShapeId && !isDraggingShape && !isResizing && !isRotating && !editingTextId && (() => {
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

