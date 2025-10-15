import type { Rectangle, Circle, Line, Text, Triangle, Pentagon, Hexagon, Star } from '@/types/shapes'

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

/**
 * Creates a default triangle shape with specified position
 * @param x - X coordinate (center)
 * @param y - Y coordinate (center)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the triangle (optional, defaults to green)
 * @returns Triangle shape with default properties
 */
export function createDefaultTriangle(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#10B981'
): Triangle {
  return {
    id: crypto.randomUUID(),
    type: 'triangle',
    x,
    y,
    radius: 50,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default pentagon shape with specified position
 * @param x - X coordinate (center)
 * @param y - Y coordinate (center)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the pentagon (optional, defaults to purple)
 * @returns Pentagon shape with default properties
 */
export function createDefaultPentagon(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#8B5CF6'
): Pentagon {
  return {
    id: crypto.randomUUID(),
    type: 'pentagon',
    x,
    y,
    radius: 50,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default hexagon shape with specified position
 * @param x - X coordinate (center)
 * @param y - Y coordinate (center)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the hexagon (optional, defaults to orange)
 * @returns Hexagon shape with default properties
 */
export function createDefaultHexagon(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#F59E0B'
): Hexagon {
  return {
    id: crypto.randomUUID(),
    type: 'hexagon',
    x,
    y,
    radius: 50,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default star shape with specified position
 * @param x - X coordinate (center)
 * @param y - Y coordinate (center)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the star (optional, defaults to yellow)
 * @returns Star shape with default properties (5-pointed)
 */
export function createDefaultStar(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#FBBF24'
): Star {
  return {
    id: crypto.randomUUID(),
    type: 'star',
    x,
    y,
    outerRadius: 50,
    innerRadius: 25,
    numPoints: 5,
    fill: color,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}
