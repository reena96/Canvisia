import { Group, Rect, Circle } from 'react-konva'
import type { ResizeHandle } from '@/utils/resizeCalculations'
import type { Shape } from '@/types/shapes'

interface MultiSelectResizeHandlesProps {
  shapes: Shape[]
  onResizeStart: (handle: ResizeHandle) => void
  onRotationStart: () => void
  viewport: { zoom: number }
}

const HANDLE_SIZE = 8
const HANDLE_COLOR = '#3B82F6'
const HANDLE_STROKE = '#FFFFFF'
const ROTATION_HANDLE_SIZE = 12
const ROTATION_HANDLE_OFFSET = 40

/**
 * Calculate the appropriate cursor based on handle position
 */
function getCursor(handle: ResizeHandle): string {
  const cursorMap: Record<ResizeHandle, string> = {
    'nw': 'nwse-resize',
    'n': 'ns-resize',
    'ne': 'nesw-resize',
    'w': 'ew-resize',
    'e': 'ew-resize',
    'sw': 'nesw-resize',
    's': 'ns-resize',
    'se': 'nwse-resize',
  }
  return cursorMap[handle] || 'default'
}

/**
 * Component that renders resize handles for multiple selected shapes
 * Shows 8 handles (4 corners + 4 edges) around the group bounding box
 * Plus a rotation handle above the group
 */
export function MultiSelectResizeHandles({ shapes, onResizeStart, onRotationStart, viewport }: MultiSelectResizeHandlesProps) {
  if (shapes.length === 0) return null

  // Calculate bounding box of all selected shapes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  shapes.forEach(shape => {
    // Debug: Log any shape with suspicious values
    if (shape.x > 10000 || shape.y > 10000 ||
        ('width' in shape && (shape.width === undefined || shape.width > 10000)) ||
        ('height' in shape && (shape.height === undefined || shape.height > 10000))) {
      console.warn('[MultiSelectResizeHandles] Suspicious shape data:', {
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y,
        width: 'width' in shape ? shape.width : 'N/A',
        height: 'height' in shape ? shape.height : 'N/A'
      })
    }
    let left = shape.x, top = shape.y, right = shape.x, bottom = shape.y

    // Calculate bounds based on shape type
    switch (shape.type) {
      case 'rectangle':
      case 'roundedRectangle':
      case 'cylinder':
        // Rectangle-like shapes (center-based)
        left = shape.x - shape.width / 2
        top = shape.y - shape.height / 2
        right = shape.x + shape.width / 2
        bottom = shape.y + shape.height / 2
        break

      case 'circle':
        // Circle
        left = shape.x - shape.radius
        top = shape.y - shape.radius
        right = shape.x + shape.radius
        bottom = shape.y + shape.radius
        break

      case 'ellipse':
      case 'triangle':
      case 'pentagon':
      case 'hexagon':
        // Ellipse, polygon
        left = shape.x - shape.radiusX
        top = shape.y - shape.radiusY
        right = shape.x + shape.radiusX
        bottom = shape.y + shape.radiusY
        break

      case 'star':
        // Star
        left = shape.x - shape.outerRadiusX
        top = shape.y - shape.outerRadiusY
        right = shape.x + shape.outerRadiusX
        bottom = shape.y + shape.outerRadiusY
        break

      case 'text':
        // Text (top-left based)
        left = shape.x
        top = shape.y
        right = shape.x + shape.width
        bottom = shape.y + (shape.height || shape.fontSize * 1.5)
        break

      case 'line':
      case 'arrow':
      case 'bidirectionalArrow':
        // Line, arrow
        left = Math.min(shape.x, shape.x2)
        top = Math.min(shape.y, shape.y2)
        right = Math.max(shape.x, shape.x2)
        bottom = Math.max(shape.y, shape.y2)
        break

      case 'bentConnector':
        // Bent connector
        left = Math.min(shape.x, shape.bendX, shape.x2)
        top = Math.min(shape.y, shape.bendY, shape.y2)
        right = Math.max(shape.x, shape.bendX, shape.x2)
        bottom = Math.max(shape.y, shape.bendY, shape.y2)
        break
    }

    // Guard against NaN or invalid values
    if (!isNaN(left) && !isNaN(right) && !isNaN(top) && !isNaN(bottom) &&
        isFinite(left) && isFinite(right) && isFinite(top) && isFinite(bottom)) {
      minX = Math.min(minX, left)
      minY = Math.min(minY, top)
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
    } else {
      console.error('[MultiSelectResizeHandles] Invalid bounds for shape:', {
        id: shape.id,
        type: shape.type,
        left, top, right, bottom,
        shape
      })
    }
  })

  const width = maxX - minX
  const height = maxY - minY
  const centerX = minX + width / 2
  const centerY = minY + height / 2

  // Resize handle positions (4 corners + 4 edges)
  const handles: { handle: ResizeHandle; x: number; y: number }[] = [
    { handle: 'nw', x: minX, y: minY },
    { handle: 'n', x: centerX, y: minY },
    { handle: 'ne', x: maxX, y: minY },
    { handle: 'w', x: minX, y: centerY },
    { handle: 'e', x: maxX, y: centerY },
    { handle: 'sw', x: minX, y: maxY },
    { handle: 's', x: centerX, y: maxY },
    { handle: 'se', x: maxX, y: maxY },
  ]

  // Rotation handle position (above the group)
  const rotationHandleX = centerX
  const rotationHandleY = minY - ROTATION_HANDLE_OFFSET

  return (
    <Group>
      {/* Bounding box outline */}
      <Rect
        x={minX}
        y={minY}
        width={width}
        height={height}
        stroke={HANDLE_COLOR}
        strokeWidth={2 / viewport.zoom}
        dash={[8 / viewport.zoom, 4 / viewport.zoom]}
        listening={false}
      />

      {/* Rotation handle connector line */}
      <Rect
        x={rotationHandleX - 1}
        y={rotationHandleY + ROTATION_HANDLE_SIZE}
        width={2}
        height={ROTATION_HANDLE_OFFSET - ROTATION_HANDLE_SIZE}
        fill={HANDLE_COLOR}
        listening={false}
      />

      {/* Rotation handle */}
      <Circle
        x={rotationHandleX}
        y={rotationHandleY}
        radius={ROTATION_HANDLE_SIZE / 2}
        fill={HANDLE_COLOR}
        stroke={HANDLE_STROKE}
        strokeWidth={2}
        onMouseDown={(e) => {
          e.cancelBubble = true
          onRotationStart()
        }}
        onTouchStart={(e) => {
          e.cancelBubble = true
          onRotationStart()
        }}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container()
          if (container) {
            container.style.cursor = 'grab'
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container()
          if (container) {
            container.style.cursor = 'default'
          }
        }}
      />

      {/* Resize handles */}
      {handles.map(({ handle, x, y }) => {
        const cursor = getCursor(handle)
        return (
          <Rect
            key={handle}
            x={x - HANDLE_SIZE / 2}
            y={y - HANDLE_SIZE / 2}
            width={HANDLE_SIZE}
            height={HANDLE_SIZE}
            fill={HANDLE_COLOR}
            stroke={HANDLE_STROKE}
            strokeWidth={2}
            onMouseDown={(e) => {
              e.cancelBubble = true
              onResizeStart(handle)
            }}
            onTouchStart={(e) => {
              e.cancelBubble = true
              onResizeStart(handle)
            }}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container()
              if (container) {
                container.style.cursor = cursor
              }
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container()
              if (container) {
                container.style.cursor = 'default'
              }
            }}
          />
        )
      })}
    </Group>
  )
}
