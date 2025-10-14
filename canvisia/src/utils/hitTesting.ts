/**
 * Hit testing utilities for detecting mouse/pointer interactions with shapes
 */

interface RectangleBounds {
  x: number
  y: number
  width: number
  height: number
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
