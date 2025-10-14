import { useRef } from 'react'
import { Stage, Layer, Line, Rect } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useCanvasStore } from '@/stores/canvasStore'
import { CANVAS_CONFIG } from '@/config/canvas.config'
import { calculateZoom, screenToCanvas } from '@/utils/canvasUtils'
import { CursorOverlay } from './CursorOverlay'
import { useCursors } from '@/hooks/useCursors'
import { useAuth } from '@/components/auth/AuthProvider'

export function Canvas() {
  const stageRef = useRef<any>(null)
  const viewport = useCanvasStore((state) => state.viewport)
  const updateViewport = useCanvasStore((state) => state.updateViewport)
  const { user } = useAuth()

  // Setup cursor tracking
  const canvasId = 'default-canvas' // TODO: Get from canvas context/router
  const userId = user?.uid || ''
  const userName = user?.displayName || 'Anonymous'
  const userColor = getUserColor(userId)
  const { cursors, updateCursor } = useCursors(canvasId, userId, userName, userColor)

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

          {/* Shapes will be rendered here in later PRs */}
        </Layer>
      </Stage>

      {/* Multiplayer cursors overlay */}
      <CursorOverlay cursors={cursors} viewport={viewport} />
    </div>
  )
}

/**
 * Generate a consistent color for a user based on their ID
 */
function getUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52B788', // Green
  ]

  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
