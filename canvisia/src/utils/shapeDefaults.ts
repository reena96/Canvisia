import type { Rectangle } from '@/types/shapes'

/**
 * Creates a default rectangle shape with specified position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param userId - User ID for createdBy field (optional)
 * @returns Rectangle shape with default properties
 */
export function createDefaultRectangle(
  x: number,
  y: number,
  userId: string = 'anonymous'
): Rectangle {
  return {
    id: crypto.randomUUID(),
    type: 'rectangle',
    x,
    y,
    width: 100,
    height: 100,
    fill: '#3B82F6', // Blue
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}
