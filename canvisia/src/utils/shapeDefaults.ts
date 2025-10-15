import type { Rectangle, Circle, Line, Text } from '@/types/shapes'

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

/**
 * Creates a default circle shape with specified position
 * @param x - X coordinate (center)
 * @param y - Y coordinate (center)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the circle (optional, defaults to red)
 * @returns Circle shape with default properties
 */
export function createDefaultCircle(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#EF4444'
): Circle {
  return {
    id: crypto.randomUUID(),
    type: 'circle',
    x,
    y,
    radius: 50,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default line shape with specified start position
 * @param x - X coordinate (start point)
 * @param y - Y coordinate (start point)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Stroke color for the line (optional, defaults to black)
 * @returns Line shape with default properties (150px horizontal)
 */
export function createDefaultLine(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#000000'
): Line {
  return {
    id: crypto.randomUUID(),
    type: 'line',
    x,
    y,
    x2: x + 150, // 150px horizontal line
    y2: y,
    stroke: color,
    strokeWidth: 2,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default text shape with specified position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the text (optional, defaults to black)
 * @returns Text shape with default properties
 */
export function createDefaultText(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#000000'
): Text {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x,
    y,
    text: 'Double-click to edit',
    fontSize: 16,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}
