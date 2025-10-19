import type { Shape } from '@/types/shapes'
import type { Viewport } from '@/types/canvas'

/**
 * Viewport bounds in canvas coordinates
 */
export interface ViewportBounds {
  x: number      // Left edge in canvas coordinates
  y: number      // Top edge in canvas coordinates
  width: number  // Viewport width in canvas units
  height: number // Viewport height in canvas units
}

/**
 * Viewport edges with margins
 */
export interface ViewportEdges {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
}

/**
 * Result of finding empty space in viewport
 */
export interface PlacementResult {
  x: number
  y: number
  isOutsideViewport: boolean
}

/**
 * Get viewport bounds in canvas coordinates
 * Accounts for zoom level and pan position
 */
export function getViewportBounds(viewport: Viewport): ViewportBounds {
  return {
    x: -viewport.x / viewport.zoom,
    y: -viewport.y / viewport.zoom,
    width: window.innerWidth / viewport.zoom,
    height: window.innerHeight / viewport.zoom
  }
}

/**
 * Get viewport edges with margins
 */
export function getViewportEdges(viewport: ViewportBounds, margin = 20): ViewportEdges {
  return {
    left: viewport.x + margin,
    right: viewport.x + viewport.width - margin,
    top: viewport.y + margin,
    bottom: viewport.y + viewport.height - margin,
    centerX: viewport.x + viewport.width / 2,
    centerY: viewport.y + viewport.height / 2
  }
}

/**
 * Get width of a shape
 */
export function getShapeWidth(shape: Shape): number {
  switch (shape.type) {
    case 'rectangle':
    case 'roundedRectangle':
    case 'cylinder':
    case 'text':
    case 'image':
      return shape.width

    case 'circle':
      return shape.radius * 2

    case 'ellipse':
      return shape.radiusX * 2

    case 'triangle':
    case 'pentagon':
    case 'hexagon':
      return shape.radiusX * 2

    case 'star':
      return shape.outerRadiusX * 2

    case 'arrow':
    case 'bidirectionalArrow':
    case 'line':
    case 'bentConnector':
      return Math.abs(shape.x2 - shape.x)

    default:
      return 100 // Default fallback
  }
}

/**
 * Get height of a shape
 */
export function getShapeHeight(shape: Shape): number {
  switch (shape.type) {
    case 'rectangle':
    case 'roundedRectangle':
    case 'cylinder':
    case 'text':
    case 'image':
      return shape.height

    case 'circle':
      return shape.radius * 2

    case 'ellipse':
      return shape.radiusY * 2

    case 'triangle':
    case 'pentagon':
    case 'hexagon':
      return shape.radiusY * 2

    case 'star':
      return shape.outerRadiusY * 2

    case 'arrow':
    case 'bidirectionalArrow':
    case 'line':
    case 'bentConnector':
      return Math.abs(shape.y2 - shape.y)

    default:
      return 100 // Default fallback
  }
}

/**
 * Check if two shapes collide (with padding)
 */
export function shapesCollide(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  shape: Shape,
  padding = 10
): boolean {
  const shapeWidth = getShapeWidth(shape)
  const shapeHeight = getShapeHeight(shape)

  // Check if bounding boxes overlap (with padding)
  return !(
    pos.x + size.width + padding < shape.x ||
    pos.x > shape.x + shapeWidth + padding ||
    pos.y + size.height + padding < shape.y ||
    pos.y > shape.y + shapeHeight + padding
  )
}

/**
 * Check if position is within viewport bounds
 */
export function isWithinViewport(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  viewport: ViewportBounds
): boolean {
  return (
    pos.x >= viewport.x &&
    pos.y >= viewport.y &&
    pos.x + size.width <= viewport.x + viewport.width &&
    pos.y + size.height <= viewport.y + viewport.height
  )
}

/**
 * Generate spiral positions from a center point
 */
function getSpiralPositions(
  centerX: number,
  centerY: number,
  radius: number,
  points = 8
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = []

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    })
  }

  return positions
}

/**
 * Find empty space in viewport without collisions
 * Priority: 1) Center, 2) Spiral outward, 3) Outside viewport
 */
export function findEmptySpaceInViewport(
  viewport: ViewportBounds,
  existingShapes: Shape[],
  newShapeSize: { width: number; height: number },
  allowOutsideViewport = true
): PlacementResult {
  const edges = getViewportEdges(viewport)
  const GRID_SIZE = 50 // Check every 50px

  // Priority 1: Center of viewport
  const centerPos = {
    x: edges.centerX - newShapeSize.width / 2,
    y: edges.centerY - newShapeSize.height / 2
  }

  if (!hasCollisionWithAny(centerPos, newShapeSize, existingShapes)) {
    return { ...centerPos, isOutsideViewport: false }
  }

  // Priority 2: Spiral outward from center
  for (let radius = GRID_SIZE; radius < viewport.width * 2; radius += GRID_SIZE) {
    const positions = getSpiralPositions(edges.centerX, edges.centerY, radius)

    for (const pos of positions) {
      const candidatePos = {
        x: pos.x - newShapeSize.width / 2,
        y: pos.y - newShapeSize.height / 2
      }

      // Check if within viewport
      if (isWithinViewport(candidatePos, newShapeSize, viewport)) {
        if (!hasCollisionWithAny(candidatePos, newShapeSize, existingShapes)) {
          return { ...candidatePos, isOutsideViewport: false }
        }
      }
    }
  }

  // Priority 3: Just outside viewport (visible on zoom out)
  if (allowOutsideViewport) {
    const outsidePos = {
      x: edges.right + 50,
      y: edges.top
    }

    return { ...outsidePos, isOutsideViewport: true }
  }

  // Fallback: Center (unavoidable overlap)
  return { ...centerPos, isOutsideViewport: false }
}

/**
 * Check if position collides with any existing shapes
 */
function hasCollisionWithAny(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  shapes: Shape[]
): boolean {
  for (const shape of shapes) {
    if (shapesCollide(pos, size, shape)) {
      return true
    }
  }
  return false
}

/**
 * Calculate required zoom level to see all shapes
 */
export function calculateRequiredZoom(
  viewport: Viewport,
  shapes: Shape[]
): number {
  if (shapes.length === 0) return viewport.zoom

  // Find bounding box of all shapes
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const shape of shapes) {
    const width = getShapeWidth(shape)
    const height = getShapeHeight(shape)

    minX = Math.min(minX, shape.x)
    minY = Math.min(minY, shape.y)
    maxX = Math.max(maxX, shape.x + width)
    maxY = Math.max(maxY, shape.y + height)
  }

  const contentWidth = maxX - minX
  const contentHeight = maxY - minY

  // Calculate zoom to fit content with 20% margin
  const zoomX = (window.innerWidth * 0.8) / contentWidth
  const zoomY = (window.innerHeight * 0.8) / contentHeight

  return Math.min(zoomX, zoomY, 1) // Don't zoom in beyond 100%
}
