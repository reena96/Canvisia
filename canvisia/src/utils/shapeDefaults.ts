import type { Rectangle } from '@/types/shapes'

/**
 * Creates a default rectangle shape with specified position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the rectangle (optional, defaults to blue)
 * @returns Rectangle shape with default properties
 */
export function createDefaultRectangle(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#3B82F6'
): Rectangle {
  return {
    id: crypto.randomUUID(),
    type: 'rectangle',
    x,
    y,
    width: 100,
    height: 100,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}
