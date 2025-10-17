import { Circle, Group, Rect } from 'react-konva'
import type { ResizeHandle } from '@/utils/resizeCalculations'
import type { Shape } from '@/types/shapes'

interface ResizeHandlesProps {
  shape: Shape
  onResizeStart: (handle: ResizeHandle) => void
  onRotationStart: () => void
}

const HANDLE_SIZE = 8
const HANDLE_COLOR = '#3B82F6'
const HANDLE_STROKE = '#FFFFFF'
const ROTATION_HANDLE_SIZE = 12
const ROTATION_HANDLE_OFFSET = 40

/**
 * Calculate the appropriate cursor based on handle position and shape rotation
 * @param handle - The resize handle (nw, n, ne, w, e, sw, s, se)
 * @param rotation - Shape rotation in degrees
 * @returns CSS cursor string
 *
 * Note: System resize cursors (ns-resize, ew-resize, etc.) may appear at slightly
 * different sizes depending on the OS. This is a browser/OS limitation.
 */
function getRotatedCursor(handle: ResizeHandle, rotation: number): string {
  // Base angles for each handle (in degrees, 0° = east/right)
  const baseAngles: Record<ResizeHandle, number> = {
    'e': 0,      // →
    'se': 45,    // ↘
    's': 90,     // ↓
    'sw': 135,   // ↙
    'w': 180,    // ←
    'nw': 225,   // ↖
    'n': 270,    // ↑
    'ne': 315,   // ↗
  }

  // Add rotation to base angle and normalize to 0-360
  let angle = (baseAngles[handle] + rotation) % 360
  if (angle < 0) angle += 360

  // Map angle ranges to cursor types
  // Each cursor covers a 45° range centered on its direction
  if (angle >= 337.5 || angle < 22.5) return 'ew-resize'      // → horizontal
  if (angle >= 22.5 && angle < 67.5) return 'nwse-resize'     // ↗↙ diagonal
  if (angle >= 67.5 && angle < 112.5) return 'ns-resize'      // ↑↓ vertical
  if (angle >= 112.5 && angle < 157.5) return 'nesw-resize'   // ↖↘ diagonal
  if (angle >= 157.5 && angle < 202.5) return 'ew-resize'     // ← horizontal
  if (angle >= 202.5 && angle < 247.5) return 'nwse-resize'   // ↙↗ diagonal
  if (angle >= 247.5 && angle < 292.5) return 'ns-resize'     // ↓↑ vertical
  if (angle >= 292.5 && angle < 337.5) return 'nesw-resize'   // ↘↖ diagonal

  return 'move'
}

/**
 * Component that renders resize handles and rotation handle for a selected shape
 */
export function ResizeHandles({ shape, onResizeStart, onRotationStart }: ResizeHandlesProps) {
  // Special handling for lines and arrows - only show endpoint handles
  const isLineType = shape.type === 'line' || shape.type === 'arrow' || shape.type === 'bidirectionalArrow'
  const isBentConnector = shape.type === 'bentConnector'

  if (isLineType) {
    return (
      <Group>
        {/* Start point handle */}
        <Circle
          x={shape.x}
          y={shape.y}
          radius={HANDLE_SIZE / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          onMouseDown={(e) => {
            e.cancelBubble = true
            onResizeStart('nw') // Use 'nw' to indicate start point
          }}
          onTouchStart={(e) => {
            e.cancelBubble = true
            onResizeStart('nw')
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'move'
            }
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'default'
            }
          }}
        />

        {/* End point handle */}
        <Circle
          x={shape.x2}
          y={shape.y2}
          radius={HANDLE_SIZE / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          onMouseDown={(e) => {
            e.cancelBubble = true
            onResizeStart('se') // Use 'se' to indicate end point
          }}
          onTouchStart={(e) => {
            e.cancelBubble = true
            onResizeStart('se')
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'move'
            }
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'default'
            }
          }}
        />
      </Group>
    )
  }

  if (isBentConnector) {
    return (
      <Group>
        {/* Start point handle */}
        <Circle
          x={shape.x}
          y={shape.y}
          radius={HANDLE_SIZE / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          onMouseDown={(e) => {
            e.cancelBubble = true
            onResizeStart('nw') // Start point
          }}
          onTouchStart={(e) => {
            e.cancelBubble = true
            onResizeStart('nw')
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'move'
            }
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'default'
            }
          }}
        />

        {/* Bend point handle */}
        <Circle
          x={shape.bendX}
          y={shape.bendY}
          radius={HANDLE_SIZE / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          onMouseDown={(e) => {
            e.cancelBubble = true
            onResizeStart('n') // Use 'n' to indicate bend point
          }}
          onTouchStart={(e) => {
            e.cancelBubble = true
            onResizeStart('n')
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'move'
            }
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'default'
            }
          }}
        />

        {/* End point handle */}
        <Circle
          x={shape.x2}
          y={shape.y2}
          radius={HANDLE_SIZE / 2}
          fill={HANDLE_COLOR}
          stroke={HANDLE_STROKE}
          strokeWidth={2}
          onMouseDown={(e) => {
            e.cancelBubble = true
            onResizeStart('se') // End point
          }}
          onTouchStart={(e) => {
            e.cancelBubble = true
            onResizeStart('se')
          }}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'move'
            }
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'default'
            }
          }}
        />
      </Group>
    )
  }

  // Calculate bounding box for handles
  const bounds = getShapeBounds(shape)

  if (!bounds) return null

  const { x: boxX, y: boxY, width, height } = bounds

  // All shapes now rotate around their center (x, y)
  const pivotX = shape.x
  const pivotY = shape.y

  // Resize handle positions (relative to bounding box)
  const handles: { handle: ResizeHandle; x: number; y: number }[] = [
    { handle: 'nw', x: boxX, y: boxY },
    { handle: 'n', x: boxX + width / 2, y: boxY },
    { handle: 'ne', x: boxX + width, y: boxY },
    { handle: 'w', x: boxX, y: boxY + height / 2 },
    { handle: 'e', x: boxX + width, y: boxY + height / 2 },
    { handle: 'sw', x: boxX, y: boxY + height },
    { handle: 's', x: boxX + width / 2, y: boxY + height },
    { handle: 'se', x: boxX + width, y: boxY + height },
  ]

  // Rotation handle position (above the shape in local coordinates)
  const rotationHandleX = boxX + width / 2
  const rotationHandleY = boxY - ROTATION_HANDLE_OFFSET

  // Circles don't need rotation since they're symmetrical
  const showRotationHandle = shape.type !== 'circle'

  return (
    <Group
      x={pivotX}
      y={pivotY}
      rotation={shape.rotation}
    >
      {/* Selection rectangle outline - positioned relative to pivot */}
      <Rect
        x={boxX}
        y={boxY}
        width={width}
        height={height}
        stroke={HANDLE_COLOR}
        strokeWidth={2}
        dash={[5, 5]}
        listening={false}
      />

      {/* Rotation handle connector line - only show for rotatable shapes */}
      {showRotationHandle && (
        <Rect
          x={rotationHandleX - 1}
          y={rotationHandleY + ROTATION_HANDLE_SIZE}
          width={2}
          height={ROTATION_HANDLE_OFFSET - ROTATION_HANDLE_SIZE}
          fill={HANDLE_COLOR}
          listening={false}
        />
      )}

      {/* Rotation handle - only show for rotatable shapes */}
      {showRotationHandle && (
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
      )}

      {/* Resize handles */}
      {handles.map(({ handle, x: hx, y: hy }) => {
        const cursor = getRotatedCursor(handle, shape.rotation)
        return (
          <Rect
            key={handle}
            x={hx - HANDLE_SIZE / 2}
            y={hy - HANDLE_SIZE / 2}
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

/**
 * Calculate bounding box for any shape type
 */
function getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } | null {
  switch (shape.type) {
    case 'rectangle':
    case 'roundedRectangle':
    case 'cylinder':
      // Return bounds in local coordinates (relative to shape center)
      return {
        x: -shape.width / 2,
        y: -shape.height / 2,
        width: shape.width,
        height: shape.height,
      }

    case 'circle':
      // Return bounds in local coordinates (relative to shape center)
      return {
        x: -shape.radius,
        y: -shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2,
      }

    case 'ellipse':
      // Return bounds in local coordinates (relative to shape center)
      return {
        x: -shape.radiusX,
        y: -shape.radiusY,
        width: shape.radiusX * 2,
        height: shape.radiusY * 2,
      }

    case 'triangle':
      // Konva RegularPolygon with 3 sides starting at -90° (top vertex)
      // Calculate vertex positions in local coordinates (relative to shape center)
      const cos30 = Math.cos(30 * Math.PI / 180) // ≈ 0.866
      const sin30 = Math.sin(30 * Math.PI / 180) // = 0.5
      const cos150 = Math.cos(150 * Math.PI / 180) // ≈ -0.866
      const sin150 = Math.sin(150 * Math.PI / 180) // = 0.5

      // Vertices in local coordinates (relative to shape center)
      const v1x = 0
      const v1y = -shape.radiusY
      const v2x = shape.radiusX * cos30
      const v2y = shape.radiusY * sin30
      const v3x = shape.radiusX * cos150
      const v3y = shape.radiusY * sin150

      // Calculate bounding box in local coordinates using min/max of vertices
      const triangleMinX = Math.min(v1x, v2x, v3x)
      const triangleMaxX = Math.max(v1x, v2x, v3x)
      const triangleMinY = Math.min(v1y, v2y, v3y)
      const triangleMaxY = Math.max(v1y, v2y, v3y)

      // Return bounds in local coordinates (the Group will handle rotation)
      return {
        x: triangleMinX,
        y: triangleMinY,
        width: triangleMaxX - triangleMinX,
        height: triangleMaxY - triangleMinY,
      }

    case 'pentagon': {
      // Pentagon: 5 vertices starting at -90° (top vertex)
      const sides = 5
      const vertices: { x: number; y: number }[] = []
      for (let i = 0; i < sides; i++) {
        const angle = (i * 360 / sides - 90) * Math.PI / 180
        vertices.push({
          x: shape.radiusX * Math.cos(angle),
          y: shape.radiusY * Math.sin(angle),
        })
      }

      const pentagonMinX = Math.min(...vertices.map(v => v.x))
      const pentagonMaxX = Math.max(...vertices.map(v => v.x))
      const pentagonMinY = Math.min(...vertices.map(v => v.y))
      const pentagonMaxY = Math.max(...vertices.map(v => v.y))

      return {
        x: pentagonMinX,
        y: pentagonMinY,
        width: pentagonMaxX - pentagonMinX,
        height: pentagonMaxY - pentagonMinY,
      }
    }

    case 'hexagon': {
      // Hexagon: 6 vertices starting at -90° (top vertex)
      const sides = 6
      const vertices: { x: number; y: number }[] = []
      for (let i = 0; i < sides; i++) {
        const angle = (i * 360 / sides - 90) * Math.PI / 180
        vertices.push({
          x: shape.radiusX * Math.cos(angle),
          y: shape.radiusY * Math.sin(angle),
        })
      }

      const hexagonMinX = Math.min(...vertices.map(v => v.x))
      const hexagonMaxX = Math.max(...vertices.map(v => v.x))
      const hexagonMinY = Math.min(...vertices.map(v => v.y))
      const hexagonMaxY = Math.max(...vertices.map(v => v.y))

      return {
        x: hexagonMinX,
        y: hexagonMinY,
        width: hexagonMaxX - hexagonMinX,
        height: hexagonMaxY - hexagonMinY,
      }
    }

    case 'star': {
      // Star: alternating outer and inner vertices starting at -90° (top vertex)
      const numPoints = shape.numPoints
      const vertices: { x: number; y: number }[] = []

      for (let i = 0; i < numPoints * 2; i++) {
        const angle = (i * 180 / numPoints - 90) * Math.PI / 180
        const isOuter = i % 2 === 0
        const radiusX = isOuter ? shape.outerRadiusX : shape.innerRadiusX
        const radiusY = isOuter ? shape.outerRadiusY : shape.innerRadiusY

        vertices.push({
          x: radiusX * Math.cos(angle),
          y: radiusY * Math.sin(angle),
        })
      }

      const starMinX = Math.min(...vertices.map(v => v.x))
      const starMaxX = Math.max(...vertices.map(v => v.x))
      const starMinY = Math.min(...vertices.map(v => v.y))
      const starMaxY = Math.max(...vertices.map(v => v.y))

      return {
        x: starMinX,
        y: starMinY,
        width: starMaxX - starMinX,
        height: starMaxY - starMinY,
      }
    }

    case 'line':
    case 'arrow':
    case 'bidirectionalArrow':
      // For lines, create bounding box from endpoints
      const minX = Math.min(shape.x, shape.x2)
      const maxX = Math.max(shape.x, shape.x2)
      const minY = Math.min(shape.y, shape.y2)
      const maxY = Math.max(shape.y, shape.y2)
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      }

    case 'bentConnector':
      // For bent connectors, include bend point in bounding box
      const allX = [shape.x, shape.x2, shape.bendX]
      const allY = [shape.y, shape.y2, shape.bendY]
      const boxMinX = Math.min(...allX)
      const boxMaxX = Math.max(...allX)
      const boxMinY = Math.min(...allY)
      const boxMaxY = Math.max(...allY)
      return {
        x: boxMinX,
        y: boxMinY,
        width: boxMaxX - boxMinX,
        height: boxMaxY - boxMinY,
      }

    case 'text': {
      // For text, use the width and height from the shape
      // Text box size is defined by width/height properties
      // Fallback to calculated height if not present (for backward compatibility)
      const textHeight = shape.height || (shape.fontSize * shape.lineHeight * 3)
      return {
        x: 0,
        y: 0,
        width: shape.width,
        height: textHeight,
      }
    }

    default:
      return null
  }
}
