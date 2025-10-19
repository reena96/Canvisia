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
    // CRITICAL: Validate core position properties first
    if (shape.x === undefined || shape.y === undefined ||
        isNaN(shape.x) || isNaN(shape.y) ||
        !isFinite(shape.x) || !isFinite(shape.y)) {
      console.error('[MultiSelectResizeHandles] Shape has invalid position, skipping:', {
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y
      })
      return // Skip this shape entirely
    }

    // Validate shape-specific required properties
    let hasValidProperties = true
    switch (shape.type) {
      case 'rectangle':
      case 'roundedRectangle':
      case 'cylinder':
      case 'text':
        if (shape.width === undefined || shape.height === undefined ||
            isNaN(shape.width) || isNaN(shape.height) ||
            shape.width <= 0 || shape.height <= 0) {
          console.error('[MultiSelectResizeHandles] Shape has invalid dimensions, skipping:', {
            id: shape.id,
            type: shape.type,
            width: shape.width,
            height: shape.height
          })
          hasValidProperties = false
        }
        break
      case 'circle':
        if (shape.radius === undefined || isNaN(shape.radius) || shape.radius <= 0) {
          console.error('[MultiSelectResizeHandles] Circle has invalid radius, skipping:', {
            id: shape.id,
            radius: shape.radius
          })
          hasValidProperties = false
        }
        break
      case 'ellipse':
      case 'triangle':
      case 'pentagon':
      case 'hexagon':
        if (shape.radiusX === undefined || shape.radiusY === undefined ||
            isNaN(shape.radiusX) || isNaN(shape.radiusY) ||
            shape.radiusX <= 0 || shape.radiusY <= 0) {
          console.error('[MultiSelectResizeHandles] Shape has invalid radii, skipping:', {
            id: shape.id,
            type: shape.type,
            radiusX: shape.radiusX,
            radiusY: shape.radiusY
          })
          hasValidProperties = false
        }
        break
      case 'star':
        if (shape.outerRadiusX === undefined || shape.outerRadiusY === undefined ||
            isNaN(shape.outerRadiusX) || isNaN(shape.outerRadiusY) ||
            shape.outerRadiusX <= 0 || shape.outerRadiusY <= 0) {
          console.error('[MultiSelectResizeHandles] Star has invalid radii, skipping:', {
            id: shape.id,
            outerRadiusX: shape.outerRadiusX,
            outerRadiusY: shape.outerRadiusY
          })
          hasValidProperties = false
        }
        break
      case 'line':
      case 'arrow':
      case 'bidirectionalArrow':
        if (shape.x2 === undefined || shape.y2 === undefined ||
            isNaN(shape.x2) || isNaN(shape.y2)) {
          console.error('[MultiSelectResizeHandles] Line has invalid endpoints, skipping:', {
            id: shape.id,
            type: shape.type,
            x2: shape.x2,
            y2: shape.y2
          })
          hasValidProperties = false
        }
        break
      case 'bentConnector':
        if (shape.x2 === undefined || shape.y2 === undefined ||
            shape.bendX === undefined || shape.bendY === undefined ||
            isNaN(shape.x2) || isNaN(shape.y2) ||
            isNaN(shape.bendX) || isNaN(shape.bendY)) {
          console.error('[MultiSelectResizeHandles] Bent connector has invalid points, skipping:', {
            id: shape.id,
            x2: shape.x2,
            y2: shape.y2,
            bendX: shape.bendX,
            bendY: shape.bendY
          })
          hasValidProperties = false
        }
        break
    }

    if (!hasValidProperties) {
      return // Skip this shape
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

    minX = Math.min(minX, left)
    minY = Math.min(minY, top)
    maxX = Math.max(maxX, right)
    maxY = Math.max(maxY, bottom)
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
