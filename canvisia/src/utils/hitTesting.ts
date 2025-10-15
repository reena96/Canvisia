/**
 * Hit testing utilities for detecting mouse/pointer interactions with shapes
 */

interface RectangleBounds {
  x: number
  y: number
  width: number
  height: number
}

interface CircleBounds {
  x: number
  y: number
  radius: number
}

interface LineBounds {
  x: number
  y: number
  x2: number
  y2: number
}

/**
 * Check if a point is inside a rectangle
 * @param px - Point x coordinate
 * @param py - Point y coordinate
 * @param rect - Rectangle bounds
 * @returns true if point is inside rectangle (inclusive of edges)
 */
export function isPointInRectangle(px: number, py: number, rect: RectangleBounds): boolean {
  return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height
}

/**
 * Check if a point is inside a circle
 * @param px - Point x coordinate
 * @param py - Point y coordinate
 * @param circle - Circle bounds (center x, y and radius)
 * @returns true if point is inside circle (inclusive of boundary)
 */
export function isPointInCircle(px: number, py: number, circle: CircleBounds): boolean {
  const dx = px - circle.x
  const dy = py - circle.y
  const distanceSquared = dx * dx + dy * dy
  const radiusSquared = circle.radius * circle.radius
  return distanceSquared <= radiusSquared
}

/**
 * Check if a point is near a line segment
 * @param px - Point x coordinate
 * @param py - Point y coordinate
 * @param line - Line segment bounds (start x,y and end x2,y2)
 * @param threshold - Distance threshold for "near" (default 10)
 * @returns true if point is within threshold distance of the line segment
 */
export function isPointNearLine(
  px: number,
  py: number,
  line: LineBounds,
  threshold: number = 10
): boolean {
  const { x: x1, y: y1, x2, y2 } = line

  // Vector from line start to end
  const dx = x2 - x1
  const dy = y2 - y1

  // Length of the line segment squared
  const lengthSquared = dx * dx + dy * dy

  // Handle degenerate case: line is actually a point
  if (lengthSquared === 0) {
    const distSquared = (px - x1) * (px - x1) + (py - y1) * (py - y1)
    return distSquared <= threshold * threshold
  }

  // Project point onto line (parametric form)
  // t = 0 at (x1,y1), t = 1 at (x2,y2)
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared

  // Clamp t to [0, 1] to stay within line segment
  t = Math.max(0, Math.min(1, t))

  // Find closest point on line segment
  const closestX = x1 + t * dx
  const closestY = y1 + t * dy

  // Calculate distance from point to closest point on line
  const distX = px - closestX
  const distY = py - closestY
  const distanceSquared = distX * distX + distY * distY

  return distanceSquared <= threshold * threshold
}
