import { createShape } from '@/services/firestore'
import type { Shape, Rectangle, Circle, Ellipse, RoundedRectangle, Cylinder, Triangle, Pentagon, Hexagon, Star, Text, Arrow, BidirectionalArrow } from '@/types/shapes'
import { v4 as uuidv4 } from 'uuid'

/**
 * Default values for shape creation
 */
const DEFAULTS = {
  // Shape defaults
  width: 100,
  height: 100,
  radius: 50,
  radiusX: 50,
  radiusY: 50,
  fill: '#3B82F6', // Blue
  stroke: '#1F2937', // Dark gray
  strokeWidth: 2,
  rotation: 0,
  cornerRadius: 10,

  // Text defaults
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 400,
  fontStyle: 'normal' as const,
  textDecoration: 'none' as const,
  align: 'left' as const,
  lineHeight: 1.2,
  textColor: '#000000',

  // Arrow defaults
  arrowColor: '#000000',
  pointerLength: 10,
  pointerWidth: 10,

  // Position defaults
  centerX: 1000,
  centerY: 1000,
}

/**
 * Color name to hex mapping
 */
const COLOR_MAP: Record<string, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280',
  black: '#000000',
  white: '#FFFFFF',
  orange: '#F97316',
  cyan: '#06B6D4',
  teal: '#14B8A6',
}

/**
 * Convert color name to hex code
 */
function resolveColor(color?: string): string {
  if (!color) return DEFAULTS.fill

  // If already hex code, return as is
  if (color.startsWith('#')) return color

  // Try to resolve from color map
  const lowerColor = color.toLowerCase()
  return COLOR_MAP[lowerColor] || DEFAULTS.fill
}

/**
 * Execute create_shape tool call
 */
export async function executeCreateShape(
  canvasId: string,
  input: {
    shapeType: string
    x: number
    y: number
    width?: number
    height?: number
    radius?: number
    radiusX?: number
    radiusY?: number
    color?: string
    cornerRadius?: number
  }
): Promise<void> {
  const {
    shapeType,
    x,
    y,
    width = DEFAULTS.width,
    height = DEFAULTS.height,
    radius = DEFAULTS.radius,
    radiusX = DEFAULTS.radiusX,
    radiusY = DEFAULTS.radiusY,
    color,
    cornerRadius = DEFAULTS.cornerRadius,
  } = input

  const fill = resolveColor(color)
  const id = uuidv4()
  const baseProps = {
    id,
    x,
    y,
    createdBy: 'ai',
    updatedAt: new Date().toISOString(),
    rotation: DEFAULTS.rotation,
  }

  let shape: Shape

  switch (shapeType) {
    case 'rectangle':
      shape = {
        ...baseProps,
        type: 'rectangle',
        width,
        height,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Rectangle
      break

    case 'circle':
      shape = {
        ...baseProps,
        type: 'circle',
        radius,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Circle
      break

    case 'ellipse':
      shape = {
        ...baseProps,
        type: 'ellipse',
        radiusX,
        radiusY,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Ellipse
      break

    case 'roundedRectangle':
      shape = {
        ...baseProps,
        type: 'roundedRectangle',
        width,
        height,
        cornerRadius,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as RoundedRectangle
      break

    case 'cylinder':
      shape = {
        ...baseProps,
        type: 'cylinder',
        width,
        height,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Cylinder
      break

    case 'triangle':
      shape = {
        ...baseProps,
        type: 'triangle',
        radiusX,
        radiusY,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Triangle
      break

    case 'pentagon':
      shape = {
        ...baseProps,
        type: 'pentagon',
        radiusX,
        radiusY,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Pentagon
      break

    case 'hexagon':
      shape = {
        ...baseProps,
        type: 'hexagon',
        radiusX,
        radiusY,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Hexagon
      break

    case 'star':
      shape = {
        ...baseProps,
        type: 'star',
        outerRadiusX: radiusX,
        outerRadiusY: radiusY,
        innerRadiusX: radiusX * 0.5,
        innerRadiusY: radiusY * 0.5,
        numPoints: 5,
        fill,
        stroke: DEFAULTS.stroke,
        strokeWidth: DEFAULTS.strokeWidth,
      } as Star
      break

    default:
      throw new Error(`Unsupported shape type: ${shapeType}`)
  }

  await createShape(canvasId, shape)
}

/**
 * Execute create_text tool call
 */
export async function executeCreateText(
  canvasId: string,
  input: {
    text: string
    x: number
    y: number
    fontSize?: number
    color?: string
    fontFamily?: string
  }
): Promise<void> {
  const {
    text,
    x,
    y,
    fontSize = DEFAULTS.fontSize,
    color,
    fontFamily = DEFAULTS.fontFamily,
  } = input

  const fill = resolveColor(color) || DEFAULTS.textColor

  const textShape: Text = {
    id: uuidv4(),
    type: 'text',
    text,
    x,
    y,
    fontSize,
    fontFamily,
    fill,
    fontWeight: DEFAULTS.fontWeight,
    fontStyle: DEFAULTS.fontStyle,
    textDecoration: DEFAULTS.textDecoration,
    align: DEFAULTS.align,
    lineHeight: DEFAULTS.lineHeight,
    width: 200, // Default text box width
    height: fontSize * DEFAULTS.lineHeight, // Auto-calculate based on font size
    createdBy: 'ai',
    updatedAt: new Date().toISOString(),
    rotation: DEFAULTS.rotation,
  }

  await createShape(canvasId, textShape)
}

/**
 * Execute create_arrow tool call
 */
export async function executeCreateArrow(
  canvasId: string,
  input: {
    x1: number
    y1: number
    x2: number
    y2: number
    color?: string
    arrowType?: string
  }
): Promise<void> {
  const {
    x1,
    y1,
    x2,
    y2,
    color,
    arrowType = 'arrow',
  } = input

  const stroke = resolveColor(color) || DEFAULTS.arrowColor

  const baseProps = {
    id: uuidv4(),
    x: x1,
    y: y1,
    x2,
    y2,
    stroke,
    strokeWidth: DEFAULTS.strokeWidth,
    pointerLength: DEFAULTS.pointerLength,
    pointerWidth: DEFAULTS.pointerWidth,
    createdBy: 'ai',
    updatedAt: new Date().toISOString(),
    rotation: DEFAULTS.rotation,
  }

  let arrow: Arrow | BidirectionalArrow

  if (arrowType === 'bidirectionalArrow') {
    arrow = {
      ...baseProps,
      type: 'bidirectionalArrow',
    } as BidirectionalArrow
  } else {
    arrow = {
      ...baseProps,
      type: 'arrow',
    } as Arrow
  }

  await createShape(canvasId, arrow)
}

/**
 * Smart position defaults
 * Convert named positions to coordinates
 */
export function calculateSmartPosition(
  position: string,
  canvasSize = { width: 2000, height: 2000 }
): { x: number; y: number } {
  const margin = 200

  switch (position.toLowerCase()) {
    case 'center':
      return { x: canvasSize.width / 2, y: canvasSize.height / 2 }
    case 'top left':
      return { x: margin, y: margin }
    case 'top':
    case 'top center':
      return { x: canvasSize.width / 2, y: margin }
    case 'top right':
      return { x: canvasSize.width - margin, y: margin }
    case 'left':
    case 'center left':
      return { x: margin, y: canvasSize.height / 2 }
    case 'right':
    case 'center right':
      return { x: canvasSize.width - margin, y: canvasSize.height / 2 }
    case 'bottom left':
      return { x: margin, y: canvasSize.height - margin }
    case 'bottom':
    case 'bottom center':
      return { x: canvasSize.width / 2, y: canvasSize.height - margin }
    case 'bottom right':
      return { x: canvasSize.width - margin, y: canvasSize.height - margin }
    default:
      return { x: DEFAULTS.centerX, y: DEFAULTS.centerY }
  }
}
