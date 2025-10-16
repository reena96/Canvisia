import type { Rectangle, Circle, Ellipse, RoundedRectangle, Cylinder, Diamond, Line, Text, Triangle, Pentagon, Hexagon, Star, Arrow, BidirectionalArrow, BentConnector } from '@/types/shapes'

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
  color: string = '#1F2937'
): Rectangle {
  return {
    id: crypto.randomUUID(),
    type: 'rectangle',
    x,
    y,
    width: 100,
    height: 100,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
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
  color: string = '#1F2937'
): Circle {
  return {
    id: crypto.randomUUID(),
    type: 'circle',
    x,
    y,
    radius: 50,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
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
  color: string = '#1F2937'
): Line {
  return {
    id: crypto.randomUUID(),
    type: 'line',
    x,
    y,
    x2: x + 150, // 150px horizontal line
    y2: y,
    stroke: color,
    strokeWidth: 3,
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
  color: string = '#1F2937'
): Text {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x,
    y,
    text: '',
    fontSize: 16,
    fontFamily: 'Inter',
    fill: color,
    fontWeight: 400,
    fontStyle: 'normal',
    textDecoration: 'none',
    align: 'left',
    lineHeight: 1.2,
    width: 200, // Default width
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
  color: string = '#1F2937'
): Triangle {
  return {
    id: crypto.randomUUID(),
    type: 'triangle',
    x,
    y,
    radius: 50,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
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
  color: string = '#1F2937'
): Pentagon {
  return {
    id: crypto.randomUUID(),
    type: 'pentagon',
    x,
    y,
    radius: 50,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
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
  color: string = '#1F2937'
): Hexagon {
  return {
    id: crypto.randomUUID(),
    type: 'hexagon',
    x,
    y,
    radius: 50,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
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
  color: string = '#1F2937'
): Star {
  return {
    id: crypto.randomUUID(),
    type: 'star',
    x,
    y,
    outerRadius: 50,
    innerRadius: 25,
    numPoints: 5,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default arrow connector with specified start position
 * @param x - X coordinate (start point)
 * @param y - Y coordinate (start point)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Stroke color for the arrow (optional, defaults to black)
 * @returns Arrow shape with default properties (150px horizontal with arrowhead)
 */
export function createDefaultArrow(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): Arrow {
  return {
    id: crypto.randomUUID(),
    type: 'arrow',
    x,
    y,
    x2: x + 150, // 150px horizontal arrow
    y2: y,
    stroke: color,
    strokeWidth: 3,
    pointerLength: 10,
    pointerWidth: 10,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default bidirectional arrow connector with specified start position
 * @param x - X coordinate (start point)
 * @param y - Y coordinate (start point)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Stroke color for the arrow (optional, defaults to black)
 * @returns BidirectionalArrow shape with default properties (150px horizontal with arrowheads on both ends)
 */
export function createDefaultBidirectionalArrow(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): BidirectionalArrow {
  return {
    id: crypto.randomUUID(),
    type: 'bidirectionalArrow',
    x,
    y,
    x2: x + 150, // 150px horizontal arrow
    y2: y,
    stroke: color,
    strokeWidth: 3,
    pointerLength: 10,
    pointerWidth: 10,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default bent connector with specified start position
 * @param x - X coordinate (start point)
 * @param y - Y coordinate (start point)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Stroke color for the connector (optional, defaults to gray)
 * @returns BentConnector shape with default properties (L-shaped connector)
 */
export function createDefaultBentConnector(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#6B7280'
): BentConnector {
  const x2 = x + 150
  const y2 = y + 100
  // Calculate bend point (midpoint horizontally, at start Y for L-shape)
  const bendX = (x + x2) / 2
  const bendY = y

  return {
    id: crypto.randomUUID(),
    type: 'bentConnector',
    x,
    y,
    x2,
    y2,
    bendX,
    bendY,
    stroke: color,
    strokeWidth: 3,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default ellipse shape with specified position
 * @param x - X coordinate (center)
 * @param y - Y coordinate (center)
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the ellipse (optional, defaults to teal)
 * @returns Ellipse shape with default properties
 */
export function createDefaultEllipse(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): Ellipse {
  return {
    id: crypto.randomUUID(),
    type: 'ellipse',
    x,
    y,
    radiusX: 50,
    radiusY: 75,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default rounded rectangle shape with specified position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the rounded rectangle (optional, defaults to indigo)
 * @returns RoundedRectangle shape with default properties
 */
export function createDefaultRoundedRectangle(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): RoundedRectangle {
  return {
    id: crypto.randomUUID(),
    type: 'roundedRectangle',
    x,
    y,
    width: 100,
    height: 100,
    cornerRadius: 10,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default cylinder shape with specified position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the cylinder (optional, defaults to cyan)
 * @returns Cylinder shape with default properties
 */
export function createDefaultCylinder(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): Cylinder {
  return {
    id: crypto.randomUUID(),
    type: 'cylinder',
    x,
    y,
    width: 100,
    height: 120,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Creates a default diamond shape with specified position
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param userId - User ID for createdBy field (optional)
 * @param color - Fill color for the diamond (optional, defaults to pink)
 * @returns Diamond shape with default properties
 */
export function createDefaultDiamond(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): Diamond {
  return {
    id: crypto.randomUUID(),
    type: 'diamond',
    x,
    y,
    width: 100,
    height: 100,
    fill: '#FFFFFF',
    stroke: color,
    strokeWidth: 3,
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}
