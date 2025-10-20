import type { Shape } from '@/types/shapes'
import type { Viewport } from '@/types/canvas'
import { CANVAS_CONFIG } from '@/config/canvas.config'

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
 * Returns the visible canvas area accounting for zoom and pan
 *
 * Canvas coordinate (0, 0) = top-left of visible canvas area (below header)
 * Viewport extends to bottom of window (includes the toolbar overlay area)
 */
export function getViewportBounds(viewport: Viewport): ViewportBounds {
  // Visible canvas dimensions (excludes header at top, extends to bottom of window)
  const visibleWidth = window.innerWidth
  const visibleHeight = window.innerHeight - CANVAS_CONFIG.HEADER_HEIGHT

  // Convert to canvas coordinates accounting for pan and zoom
  return {
    x: -viewport.x / viewport.zoom,
    y: -viewport.y / viewport.zoom,
    width: visibleWidth / viewport.zoom,
    height: visibleHeight / viewport.zoom
  }
}

/**
 * Get viewport edges in canvas coordinates
 * Returns the actual edges of the visible viewport without any padding
 * Use this for alignment commands to align shapes to exact viewport edges
 */
export function getViewportEdges(viewport: ViewportBounds, margin = 0): ViewportEdges {
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
 * Get width of a shape (bounding box)
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
      return shape.radiusX * Math.sqrt(3)

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
      return 100
  }
}

/**
 * Get height of a shape (bounding box)
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
      return shape.radiusY * 1.5

    case 'pentagon':
      return shape.radiusY * 1.9

    case 'hexagon':
      return shape.radiusY * Math.sqrt(3)

    case 'star':
      return shape.outerRadiusY * 2

    case 'arrow':
    case 'bidirectionalArrow':
    case 'line':
    case 'bentConnector':
      return Math.abs(shape.y2 - shape.y)

    default:
      return 100
  }
}

/**
 * Get offset from center to top edge for asymmetric shapes
 * For shapes where the center is NOT at height/2 from the top
 */
export function getTopOffset(shape: Shape): number {
  switch (shape.type) {
    case 'triangle':
      // Triangle: top vertex is at distance 'radius' from center
      return shape.radiusY

    case 'pentagon':
      // Pentagon: top is at distance 'radius' from center
      return shape.radiusY

    case 'hexagon':
      // Hexagon with flat top: top is at distance 'radius * cos(30°)' from center
      return shape.radiusY * (Math.sqrt(3) / 2)

    default:
      // Symmetric shapes: top offset is half the height
      return getShapeHeight(shape) / 2
  }
}

/**
 * Get offset from center to left edge for asymmetric shapes
 */
export function getLeftOffset(shape: Shape): number {
  switch (shape.type) {
    case 'triangle':
      // Triangle: left edge is at distance 'radius * sqrt(3)/2' from center
      return shape.radiusX * (Math.sqrt(3) / 2)

    default:
      // Symmetric shapes: left offset is half the width
      return getShapeWidth(shape) / 2
  }
}

/**
 * Get offset from center to right edge for asymmetric shapes
 */
export function getRightOffset(shape: Shape): number {
  const width = getShapeWidth(shape)
  const leftOffset = getLeftOffset(shape)
  return width - leftOffset
}

/**
 * Get offset from center to bottom edge for asymmetric shapes
 */
export function getBottomOffset(shape: Shape): number {
  const height = getShapeHeight(shape)
  const topOffset = getTopOffset(shape)
  return height - topOffset
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
 * Get bounding box for a group of shapes
 */
function getGroupBoundingBox(groupShapes: Shape[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (groupShapes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const shape of groupShapes) {
    const shapeWidth = getShapeWidth(shape)
    const shapeHeight = getShapeHeight(shape)

    minX = Math.min(minX, shape.x)
    minY = Math.min(minY, shape.y)
    maxX = Math.max(maxX, shape.x + shapeWidth)
    maxY = Math.max(maxY, shape.y + shapeHeight)
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * Check if position collides with any existing shapes
 * IMPORTANT: Treats grouped shapes (flowcharts, UI components, diagrams) as single entities
 * to avoid placing new content inside or too close to complex diagrams
 */
function hasCollisionWithAny(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  shapes: Shape[]
): boolean {
  // Group shapes by groupId
  const groupedShapes = new Map<string, Shape[]>()
  const ungroupedShapes: Shape[] = []

  for (const shape of shapes) {
    if (shape.groupId) {
      if (!groupedShapes.has(shape.groupId)) {
        groupedShapes.set(shape.groupId, [])
      }
      groupedShapes.get(shape.groupId)!.push(shape)
    } else {
      ungroupedShapes.push(shape)
    }
  }

  // Check collision with grouped shapes (flowcharts, UI components, diagrams)
  // Use larger padding (50px) to avoid placing things too close to complex diagrams
  const GROUP_PADDING = 50

  for (const [groupId, groupShapes] of groupedShapes) {
    const groupBox = getGroupBoundingBox(groupShapes)

    // Check if new shape would overlap with group's bounding box
    const hasOverlap = !(
      pos.x + size.width + GROUP_PADDING < groupBox.x ||
      pos.x > groupBox.x + groupBox.width + GROUP_PADDING ||
      pos.y + size.height + GROUP_PADDING < groupBox.y ||
      pos.y > groupBox.y + groupBox.height + GROUP_PADDING
    )

    if (hasOverlap) {
      console.log(`[Viewport] Collision detected with group: ${groupShapes[0].groupName || groupId}`)
      return true
    }
  }

  // Check collision with individual ungrouped shapes (normal padding)
  for (const shape of ungroupedShapes) {
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

  // Calculate zoom to fit content with 20% margin (accounting for header)
  const visibleWidth = window.innerWidth
  const visibleHeight = window.innerHeight - CANVAS_CONFIG.HEADER_HEIGHT
  const zoomX = (visibleWidth * 0.8) / contentWidth
  const zoomY = (visibleHeight * 0.8) / contentHeight

  return Math.min(zoomX, zoomY, 1) // Don't zoom in beyond 100%
}
