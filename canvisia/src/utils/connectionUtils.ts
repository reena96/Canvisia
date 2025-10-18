import type { Shape, Arrow, BidirectionalArrow, BentConnector, Rectangle, Circle, Ellipse, RoundedRectangle, Cylinder, Triangle, Pentagon, Hexagon, Star } from '@/types/shapes'

/**
 * Detect which shapes an arrow connects to based on start/end positions
 */
export function detectConnection(
  arrow: Arrow | BidirectionalArrow | BentConnector,
  shapes: Shape[]
): { fromShapeId?: string; toShapeId?: string } {
  const [x1, y1] = [arrow.x, arrow.y]
  const [x2, y2] = [arrow.x2, arrow.y2]

  const fromShape = shapes.find(s => s.id !== arrow.id && isPointInShape({ x: x1, y: y1 }, s))
  const toShape = shapes.find(s => s.id !== arrow.id && isPointInShape({ x: x2, y: y2 }, s))

  return {
    fromShapeId: fromShape?.id,
    toShapeId: toShape?.id
  }
}

/**
 * Check if a point is inside a shape
 */
export function isPointInShape(point: { x: number; y: number }, shape: Shape): boolean {
  const { x, y } = point

  switch (shape.type) {
    case 'rectangle':
    case 'roundedRectangle':
    case 'cylinder': {
      const rect = shape as Rectangle | RoundedRectangle | Cylinder
      return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
      )
    }

    case 'circle': {
      const circle = shape as Circle
      const dx = x - circle.x
      const dy = y - circle.y
      return Math.sqrt(dx * dx + dy * dy) <= circle.radius
    }

    case 'ellipse': {
      const ellipse = shape as Ellipse
      const dx = x - ellipse.x
      const dy = y - ellipse.y
      const normalizedX = dx / ellipse.radiusX
      const normalizedY = dy / ellipse.radiusY
      return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1
    }

    case 'triangle':
    case 'pentagon':
    case 'hexagon': {
      const poly = shape as Triangle | Pentagon | Hexagon
      // For polygons, use a simple bounding circle approximation
      const dx = x - poly.x
      const dy = y - poly.y
      const maxRadius = Math.max(poly.radiusX, poly.radiusY)
      return Math.sqrt(dx * dx + dy * dy) <= maxRadius
    }

    case 'star': {
      const star = shape as Star
      // For stars, use outer radius bounding circle
      const dx = x - star.x
      const dy = y - star.y
      const maxRadius = Math.max(star.outerRadiusX, star.outerRadiusY)
      return Math.sqrt(dx * dx + dy * dy) <= maxRadius
    }

    case 'text': {
      // Text shapes have a bounding box
      return (
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height
      )
    }

    default:
      return false
  }
}

/**
 * Find the closest shape to a point
 */
export function findClosestShape(
  point: { x: number; y: number },
  shapes: Shape[],
  maxDistance = 50
): Shape | undefined {
  let closestShape: Shape | undefined
  let minDistance = maxDistance

  for (const shape of shapes) {
    const center = getShapeCenter(shape)
    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestShape = shape
    }
  }

  return closestShape
}

/**
 * Get the center point of a shape
 */
export function getShapeCenter(shape: Shape): { x: number; y: number } {
  switch (shape.type) {
    case 'rectangle':
    case 'roundedRectangle':
    case 'cylinder': {
      const rect = shape as Rectangle | RoundedRectangle | Cylinder
      return {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
      }
    }

    case 'circle':
    case 'ellipse':
    case 'triangle':
    case 'pentagon':
    case 'hexagon':
    case 'star':
      // These shapes are already centered at (x, y)
      return { x: shape.x, y: shape.y }

    case 'text':
      return {
        x: shape.x + shape.width / 2,
        y: shape.y + shape.height / 2
      }

    case 'arrow':
    case 'bidirectionalArrow':
    case 'bentConnector': {
      const arrow = shape as Arrow | BidirectionalArrow | BentConnector
      return {
        x: (arrow.x + arrow.x2) / 2,
        y: (arrow.y + arrow.y2) / 2
      }
    }

    default:
      return { x: shape.x, y: shape.y }
  }
}

/**
 * Calculate the connection point on a shape's edge closest to a target point
 */
export function getConnectionPoint(
  shape: Shape,
  targetPoint: { x: number; y: number }
): { x: number; y: number } {
  const center = getShapeCenter(shape)

  // Calculate angle from center to target
  const angle = Math.atan2(targetPoint.y - center.y, targetPoint.x - center.x)

  // For different shape types, calculate the edge point
  switch (shape.type) {
    case 'circle': {
      const circle = shape as Circle
      return {
        x: center.x + circle.radius * Math.cos(angle),
        y: center.y + circle.radius * Math.sin(angle)
      }
    }

    case 'ellipse': {
      const ellipse = shape as Ellipse
      return {
        x: center.x + ellipse.radiusX * Math.cos(angle),
        y: center.y + ellipse.radiusY * Math.sin(angle)
      }
    }

    case 'rectangle':
    case 'roundedRectangle':
    case 'cylinder': {
      const rect = shape as Rectangle | RoundedRectangle | Cylinder
      // Find intersection with rectangle edge
      const dx = targetPoint.x - center.x
      const dy = targetPoint.y - center.y

      const halfWidth = rect.width / 2
      const halfHeight = rect.height / 2

      // Determine which edge the line intersects
      const slope = dy / dx
      const intersectX = halfWidth
      const intersectY = slope * intersectX

      if (Math.abs(intersectY) <= halfHeight) {
        // Intersects left or right edge
        return {
          x: center.x + (dx > 0 ? halfWidth : -halfWidth),
          y: center.y + intersectY * (dx > 0 ? 1 : -1)
        }
      } else {
        // Intersects top or bottom edge
        const intersectY = halfHeight
        const intersectX = intersectY / slope
        return {
          x: center.x + intersectX * (dy > 0 ? 1 : -1),
          y: center.y + (dy > 0 ? halfHeight : -halfHeight)
        }
      }
    }

    default:
      return center
  }
}
