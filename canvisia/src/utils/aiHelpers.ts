import { createShape, updateShape, getShapes } from '@/services/firestore'
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
  mauve: '#E0B4D6', // Updated to match Claude's actual mauve color
  lavender: '#E0B0FF',
  gray: '#6B7280',
  black: '#000000',
  white: '#FFFFFF',
  orange: '#F97316',
  cyan: '#06B6D4',
  teal: '#14B8A6',
}

/**
 * Convert color name to hex code
 * Always returns a valid hex color
 */
function resolveColor(color?: string): string {
  if (!color) return DEFAULTS.fill

  // If already hex code, normalize it to lowercase
  if (color.startsWith('#')) {
    return color.toLowerCase()
  }

  // Try to resolve from color map
  const lowerColor = color.toLowerCase()
  const resolved = COLOR_MAP[lowerColor]

  if (!resolved) {
    console.warn(`[AI Helpers] Unknown color "${color}", using default blue`)
    return DEFAULTS.fill
  }

  console.log(`[AI Helpers] Resolved color: "${color}" → ${resolved}`)
  return resolved
}

/**
 * Execute create_shape tool call
 */
export async function executeCreateShape(
  canvasId: string,
  userId: string,
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
  console.log('[AI Helpers] executeCreateShape called with:', input, 'userId:', userId)

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
    createdBy: userId, // Use actual user ID instead of 'ai'
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

  console.log('[AI Helpers] Creating shape in Firestore:', shape)
  await createShape(canvasId, shape)
  console.log('[AI Helpers] Shape created successfully:', shape.id)
}

/**
 * Execute create_text tool call
 */
export async function executeCreateText(
  canvasId: string,
  userId: string,
  input: {
    text: string
    x: number
    y: number
    fontSize?: number
    color?: string
    fontFamily?: string
  }
): Promise<void> {
  console.log('[AI Helpers] executeCreateText called with:', input, 'userId:', userId)

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
    createdBy: userId, // Use actual user ID instead of 'ai'
    updatedAt: new Date().toISOString(),
    rotation: DEFAULTS.rotation,
  }

  console.log('[AI Helpers] Creating text in Firestore:', textShape)
  await createShape(canvasId, textShape)
  console.log('[AI Helpers] Text created successfully:', textShape.id)
}

/**
 * Execute create_arrow tool call
 */
export async function executeCreateArrow(
  canvasId: string,
  userId: string,
  input: {
    x1: number
    y1: number
    x2: number
    y2: number
    color?: string
    arrowType?: string
  }
): Promise<void> {
  console.log('[AI Helpers] executeCreateArrow called with:', input, 'userId:', userId)

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
    createdBy: userId, // Use actual user ID instead of 'ai'
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

  console.log('[AI Helpers] Creating arrow in Firestore:', arrow)
  await createShape(canvasId, arrow)
  console.log('[AI Helpers] Arrow created successfully:', arrow.id)
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

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Calculate color distance (Euclidean distance in RGB space)
 * Returns a value from 0 (identical) to ~441 (opposite colors)
 */
function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  if (!rgb1 || !rgb2) return Infinity

  const rDiff = rgb1.r - rgb2.r
  const gDiff = rgb1.g - rgb2.g
  const bDiff = rgb1.b - rgb2.b

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

/**
 * Check if a color is similar to target color (fuzzy matching)
 * Threshold of 50 allows for slight variations in shade
 */
function isColorSimilar(actualHex: string, targetHex: string, threshold = 50): boolean {
  const distance = colorDistance(actualHex, targetHex)
  return distance <= threshold
}

/**
 * Check if a shape's color matches a color name or hex value
 * Uses fuzzy matching to handle color variations
 */
function matchesColor(shape: Shape, colorQuery: string): boolean {
  const fill = 'fill' in shape ? (shape as any).fill : undefined
  const stroke = 'stroke' in shape ? (shape as any).stroke : undefined

  // If query is a hex color, use fuzzy matching
  if (colorQuery.startsWith('#')) {
    if (fill && isColorSimilar(fill, colorQuery)) return true
    if (stroke && isColorSimilar(stroke, colorQuery)) return true
    return false
  }

  // For color names, get the canonical hex value
  const queryLower = colorQuery.toLowerCase()
  const canonicalHex = COLOR_MAP[queryLower]

  if (!canonicalHex) {
    console.warn('[AI Helpers] Unknown color name:', colorQuery)
    return false
  }

  // Use fuzzy matching against canonical color
  // This handles all variations (user colors, default colors, etc.)
  if (fill && isColorSimilar(fill, canonicalHex, 80)) {
    console.log(`[AI Helpers] Fuzzy match: fill ${fill} ≈ ${colorQuery} (${canonicalHex})`)
    return true
  }

  if (stroke && isColorSimilar(stroke, canonicalHex, 80)) {
    console.log(`[AI Helpers] Fuzzy match: stroke ${stroke} ≈ ${colorQuery} (${canonicalHex})`)
    return true
  }

  return false
}

/**
 * Find a shape by descriptor (ID, type, color, or description)
 */
export function findShape(
  shapes: Shape[],
  descriptor: {
    id?: string
    type?: string
    color?: string
    description?: string
  }
): Shape | undefined {
  console.log('[AI Helpers] findShape called with:', descriptor, 'shapes count:', shapes.length)
  console.log('[AI Helpers] Available shapes:', shapes.map(s => ({
    id: s.id,
    type: s.type,
    fill: 'fill' in s ? (s as any).fill : 'N/A'
  })))

  // Find by ID (most specific)
  if (descriptor.id) {
    const shape = shapes.find(s => s.id === descriptor.id)
    console.log('[AI Helpers] Found by ID:', shape?.id)
    return shape
  }

  // Find by color + type
  if (descriptor.color && descriptor.type) {
    console.log('[AI Helpers] Searching for color:', descriptor.color, 'type:', descriptor.type)

    const typeMatches = shapes.filter(s => s.type === descriptor.type)
    console.log('[AI Helpers] Type matches:', typeMatches.length)

    const colorMatches = typeMatches.filter(s => {
      const isMatch = matchesColor(s, descriptor.color!)
      const shapeFill = 'fill' in s ? (s as any).fill : 'N/A'
      const shapeStroke = 'stroke' in s ? (s as any).stroke : 'N/A'
      console.log('[AI Helpers] Color match check: fill:', shapeFill, 'stroke:', shapeStroke, 'vs', descriptor.color, '=', isMatch)
      return isMatch
    })
    console.log('[AI Helpers] Color matches:', colorMatches.length)

    // Return most recently created
    const shape = colorMatches[colorMatches.length - 1]
    console.log('[AI Helpers] Found by color + type:', shape?.id)
    return shape
  }

  // Find by type only (most recent)
  if (descriptor.type) {
    const matches = shapes.filter(s => s.type === descriptor.type)
    const shape = matches[matches.length - 1]
    console.log('[AI Helpers] Found by type:', shape?.id)
    return shape
  }

  // Find by color only (most recent)
  if (descriptor.color) {
    const matches = shapes.filter(s => matchesColor(s, descriptor.color!))
    const shape = matches[matches.length - 1]
    console.log('[AI Helpers] Found by color:', shape?.id)
    return shape
  }

  console.log('[AI Helpers] No shape found matching descriptor')
  return undefined
}

/**
 * Execute move_element tool call
 */
export async function executeMoveElement(
  canvasId: string,
  _userId: string,
  input: {
    elementId?: string
    description?: string
    type?: string
    color?: string
    x?: number
    y?: number
    position?: string
  }
): Promise<void> {
  console.log('[AI Helpers] executeMoveElement called with:', input)

  // Get all shapes
  const shapes = await getShapes(canvasId)

  // Find the target shape
  const shape = findShape(shapes, {
    id: input.elementId,
    type: input.type,
    color: input.color,
    description: input.description,
  })

  if (!shape) {
    throw new Error('Shape not found matching the description')
  }

  // Determine new position
  let newX: number
  let newY: number

  if (input.position) {
    const smartPos = calculateSmartPosition(input.position)
    newX = smartPos.x
    newY = smartPos.y
  } else if (input.x !== undefined && input.y !== undefined) {
    newX = input.x
    newY = input.y
  } else {
    throw new Error('Must specify either position or x,y coordinates')
  }

  // Update shape position
  console.log(`[AI Helpers] Moving shape ${shape.id} to (${newX}, ${newY})`)
  await updateShape(canvasId, shape.id, { x: newX, y: newY })
  console.log('[AI Helpers] Shape moved successfully')
}

/**
 * Execute resize_element tool call
 */
export async function executeResizeElement(
  canvasId: string,
  _userId: string,
  input: {
    elementId?: string
    description?: string
    type?: string
    color?: string
    scale?: number
    width?: number
    height?: number
    radius?: number
    radiusX?: number
    radiusY?: number
  }
): Promise<void> {
  console.log('[AI Helpers] executeResizeElement called with:', input)

  // Get all shapes
  const shapes = await getShapes(canvasId)

  // Find the target shape
  const shape = findShape(shapes, {
    id: input.elementId,
    type: input.type,
    color: input.color,
    description: input.description,
  })

  if (!shape) {
    throw new Error('Shape not found matching the description')
  }

  // Prepare update object (use any to handle different shape types)
  const updates: any = {}

  if (input.scale !== undefined) {
    // Scale by factor
    if ('width' in shape && shape.width) {
      updates.width = shape.width * input.scale
    }
    if ('height' in shape && shape.height) {
      updates.height = shape.height * input.scale
    }
    if ('radius' in shape && shape.radius) {
      updates.radius = shape.radius * input.scale
    }
    if ('radiusX' in shape && shape.radiusX) {
      updates.radiusX = shape.radiusX * input.scale
    }
    if ('radiusY' in shape && shape.radiusY) {
      updates.radiusY = shape.radiusY * input.scale
    }
    if ('outerRadiusX' in shape && shape.outerRadiusX) {
      updates.outerRadiusX = shape.outerRadiusX * input.scale
    }
    if ('outerRadiusY' in shape && shape.outerRadiusY) {
      updates.outerRadiusY = shape.outerRadiusY * input.scale
    }
    if ('innerRadiusX' in shape && shape.innerRadiusX) {
      updates.innerRadiusX = shape.innerRadiusX * input.scale
    }
    if ('innerRadiusY' in shape && shape.innerRadiusY) {
      updates.innerRadiusY = shape.innerRadiusY * input.scale
    }
  } else {
    // Set explicit dimensions
    // For ellipses, convert width/height to radiusX/radiusY
    if (shape.type === 'ellipse') {
      if (input.width !== undefined) updates.radiusX = input.width / 2
      if (input.height !== undefined) updates.radiusY = input.height / 2
      if (input.radiusX !== undefined) updates.radiusX = input.radiusX
      if (input.radiusY !== undefined) updates.radiusY = input.radiusY
    } else {
      // For other shapes, use width/height directly
      if (input.width !== undefined) updates.width = input.width
      if (input.height !== undefined) updates.height = input.height
      if (input.radius !== undefined) updates.radius = input.radius
      if (input.radiusX !== undefined) updates.radiusX = input.radiusX
      if (input.radiusY !== undefined) updates.radiusY = input.radiusY
    }
  }

  console.log(`[AI Helpers] Resizing shape ${shape.id} with updates:`, updates)
  await updateShape(canvasId, shape.id, updates)
  console.log('[AI Helpers] Shape resized successfully')
}

/**
 * Execute rotate_element tool call
 */
export async function executeRotateElement(
  canvasId: string,
  _userId: string,
  input: {
    elementId?: string
    description?: string
    type?: string
    color?: string
    angle: number
  }
): Promise<void> {
  console.log('[AI Helpers] executeRotateElement called with:', input)

  // Get all shapes
  const shapes = await getShapes(canvasId)

  // Find the target shape
  const shape = findShape(shapes, {
    id: input.elementId,
    type: input.type,
    color: input.color,
    description: input.description,
  })

  if (!shape) {
    throw new Error('Shape not found matching the description')
  }

  // Update rotation
  console.log(`[AI Helpers] Rotating shape ${shape.id} by ${input.angle} degrees`)
  await updateShape(canvasId, shape.id, { rotation: input.angle })
  console.log('[AI Helpers] Shape rotated successfully')
}
