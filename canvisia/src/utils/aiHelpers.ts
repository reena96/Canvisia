import { createShape, updateShape, getShapes } from '@/services/firestore'
import { writeBatchShapePositions, clearShapePositions } from '@/services/rtdb'
import type { Shape, Rectangle, Circle, Ellipse, RoundedRectangle, Cylinder, Triangle, Pentagon, Hexagon, Star, Text, Arrow, BidirectionalArrow } from '@/types/shapes'
import type { Viewport } from '@/types/canvas'
import { v4 as uuidv4 } from 'uuid'
import {
  getViewportBounds,
  getViewportEdges,
  getShapeWidth,
  getShapeHeight,
  getTopOffset,
  getLeftOffset,
  getRightOffset,
  getBottomOffset,
  findEmptySpaceInViewport,
  calculateRequiredZoom,
} from './viewportHelpers'

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
 * Element categories for filtering
 * Used to distinguish between shapes, text, and arrows
 */
const ELEMENT_CATEGORIES = {
  shapes: ['rectangle', 'circle', 'ellipse', 'roundedRectangle', 'cylinder',
           'triangle', 'pentagon', 'hexagon', 'star'],
  text: ['text'],
  arrows: ['arrow', 'bidirectionalArrow'],
} as const

/**
 * Comprehensive color name to hex mapping
 * Used for both creating shapes and identifying colors
 */
const COLOR_MAP: Record<string, string> = {
  // Primary colors
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#F59E0B',

  // Secondary colors
  green: '#10B981',
  orange: '#F97316',
  purple: '#8B5CF6',

  // Tertiary colors
  pink: '#EC4899',
  cyan: '#06B6D4',
  teal: '#14B8A6',

  // Pastels
  mauve: '#E0B4D6',
  lavender: '#E0B0FF',
  sage: '#9CAF88',
  mint: '#98D8C8',
  peach: '#FFDAB9',
  coral: '#FF6B6B',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6B7280',
  brown: '#8B4513',
  beige: '#F5F5DC',

  // Bright colors
  lime: '#84CC16',
  magenta: '#D946EF',
  indigo: '#6366F1',
  violet: '#8B5CF6',

  // Earth tones
  olive: '#808000',
  maroon: '#800000',
  navy: '#000080',

  // Metallics (closest approximations)
  gold: '#FFD700',
  silver: '#C0C0C0',
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
 * Execute create_multiple_shapes tool call
 * Creates N shapes and arranges them in a grid pattern by default
 */
export async function executeCreateMultipleShapes(
  canvasId: string,
  userId: string,
  input: {
    count: number
    shapeType: string
    width?: number
    height?: number
    radius?: number
    radiusX?: number
    radiusY?: number
    color?: string
    cornerRadius?: number
    pattern?: 'grid' | 'row' | 'column'
    spacing?: number
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateMultipleShapes called with:', input, 'userId:', userId)

  const {
    count,
    shapeType,
    width = DEFAULTS.width,
    height = DEFAULTS.height,
    radius = DEFAULTS.radius,
    radiusX = DEFAULTS.radiusX,
    radiusY = DEFAULTS.radiusY,
    color,
    cornerRadius = DEFAULTS.cornerRadius,
    pattern = 'grid', // Default to grid if not specified
    spacing = 20,
  } = input

  if (count <= 0 || count > 1000) {
    throw new Error('Count must be between 1 and 1000')
  }

  console.log(`[AI Helpers] Creating ${count} ${shapeType} shapes in ${pattern} pattern`)

  // Smart placement starting position
  const viewportBounds = getViewportBounds(viewport)
  const existingShapes = await getShapes(canvasId)

  // Determine shape size for initial placement
  let shapeWidth = width
  let shapeHeight = height

  if (shapeType === 'circle') {
    shapeWidth = radius * 2
    shapeHeight = radius * 2
  } else if (['triangle', 'pentagon', 'hexagon', 'ellipse'].includes(shapeType)) {
    shapeWidth = radiusX * 2
    shapeHeight = radiusY * 2
  }

  // Find a good starting position in viewport
  const placement = findEmptySpaceInViewport(
    viewportBounds,
    existingShapes,
    { width: shapeWidth, height: shapeHeight }
  )

  const fill = resolveColor(color)

  // Create all shapes first (at temporary positions)
  const newShapes: Shape[] = []

  for (let i = 0; i < count; i++) {
    const id = uuidv4()
    const baseProps = {
      id,
      x: placement.x, // Temporary position, will be arranged
      y: placement.y,
      createdBy: userId,
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

    newShapes.push(shape)
  }

  // Arrange shapes in specified pattern
  let arrangedShapes: Shape[]

  switch (pattern) {
    case 'grid':
      arrangedShapes = arrangeInGrid(newShapes, spacing)
      break
    case 'row':
      arrangedShapes = arrangeInRow(newShapes, spacing)
      break
    case 'column':
      arrangedShapes = arrangeInColumn(newShapes, spacing)
      break
    default:
      arrangedShapes = arrangeInGrid(newShapes, spacing) // Default to grid
  }

  // Offset to starting position
  const offsetX = placement.x
  const offsetY = placement.y

  for (const shape of arrangedShapes) {
    shape.x += offsetX
    shape.y += offsetY
  }

  // Create all shapes in Firestore
  console.log(`[AI Helpers] Creating ${arrangedShapes.length} shapes in Firestore`)

  for (const shape of arrangedShapes) {
    await createShape(canvasId, shape)
  }

  console.log('[AI Helpers] Multiple shapes created successfully')
}

/**
 * Execute create_shape tool call
 */
export async function executeCreateShape(
  canvasId: string,
  userId: string,
  input: {
    shapeType: string
    x?: number
    y?: number
    width?: number
    height?: number
    radius?: number
    radiusX?: number
    radiusY?: number
    color?: string
    cornerRadius?: number
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateShape called with:', input, 'userId:', userId)

  const {
    shapeType,
    x: inputX,
    y: inputY,
    width = DEFAULTS.width,
    height = DEFAULTS.height,
    radius = DEFAULTS.radius,
    radiusX = DEFAULTS.radiusX,
    radiusY = DEFAULTS.radiusY,
    color,
    cornerRadius = DEFAULTS.cornerRadius,
  } = input

  // Determine final position (smart placement or explicit)
  let finalX: number
  let finalY: number

  if (inputX !== undefined && inputY !== undefined) {
    // User specified coordinates - use them
    finalX = inputX
    finalY = inputY
    console.log('[AI Helpers] Using explicit coordinates:', finalX, finalY)
  } else {
    // Smart placement in viewport
    const viewportBounds = getViewportBounds(viewport)
    const existingShapes = await getShapes(canvasId)

    // Determine shape size for collision detection
    let shapeWidth = width
    let shapeHeight = height

    if (shapeType === 'circle') {
      shapeWidth = radius * 2
      shapeHeight = radius * 2
    } else if (['triangle', 'pentagon', 'hexagon', 'ellipse'].includes(shapeType)) {
      shapeWidth = radiusX * 2
      shapeHeight = radiusY * 2
    }

    const placement = findEmptySpaceInViewport(
      viewportBounds,
      existingShapes,
      { width: shapeWidth, height: shapeHeight }
    )

    finalX = placement.x
    finalY = placement.y

    if (placement.isOutsideViewport) {
      const requiredZoom = calculateRequiredZoom(viewport, [...existingShapes])
      console.warn(`[AI Helpers] ⚠️ Shape placed outside viewport. Zoom out to ${Math.round(requiredZoom * 100)}% to see all elements.`)
    } else {
      console.log('[AI Helpers] Smart placement in viewport:', finalX, finalY)
    }
  }

  const fill = resolveColor(color)
  const id = uuidv4()
  const baseProps = {
    id,
    x: finalX,
    y: finalY,
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
    x?: number
    y?: number
    fontSize?: number
    color?: string
    fontFamily?: string
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateText called with:', input, 'userId:', userId)

  const {
    text,
    x: inputX,
    y: inputY,
    fontSize = DEFAULTS.fontSize,
    color,
    fontFamily = DEFAULTS.fontFamily,
  } = input

  // Determine final position (smart placement or explicit)
  let finalX: number
  let finalY: number
  const textWidth = 200
  const textHeight = fontSize * DEFAULTS.lineHeight

  if (inputX !== undefined && inputY !== undefined) {
    // User specified coordinates - use them
    finalX = inputX
    finalY = inputY
    console.log('[AI Helpers] Using explicit coordinates:', finalX, finalY)
  } else {
    // Smart placement in viewport
    const viewportBounds = getViewportBounds(viewport)
    const existingShapes = await getShapes(canvasId)

    const placement = findEmptySpaceInViewport(
      viewportBounds,
      existingShapes,
      { width: textWidth, height: textHeight }
    )

    finalX = placement.x
    finalY = placement.y

    if (placement.isOutsideViewport) {
      const requiredZoom = calculateRequiredZoom(viewport, [...existingShapes])
      console.warn(`[AI Helpers] ⚠️ Text placed outside viewport. Zoom out to ${Math.round(requiredZoom * 100)}% to see all elements.`)
    } else {
      console.log('[AI Helpers] Smart placement in viewport:', finalX, finalY)
    }
  }

  const fill = resolveColor(color) || DEFAULTS.textColor

  const textShape: Text = {
    id: uuidv4(),
    type: 'text',
    text,
    x: finalX,
    y: finalY,
    fontSize,
    fontFamily,
    fill,
    fontWeight: DEFAULTS.fontWeight,
    fontStyle: DEFAULTS.fontStyle,
    textDecoration: DEFAULTS.textDecoration,
    align: DEFAULTS.align,
    lineHeight: DEFAULTS.lineHeight,
    width: textWidth,
    height: textHeight,
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
    x1?: number
    y1?: number
    x2?: number
    y2?: number
    color?: string
    arrowType?: string
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateArrow called with:', input, 'userId:', userId)

  const {
    x1: inputX1,
    y1: inputY1,
    x2: inputX2,
    y2: inputY2,
    color,
    arrowType = 'arrow',
  } = input

  // Determine final position (smart placement or explicit)
  let finalX1: number
  let finalY1: number
  let finalX2: number
  let finalY2: number
  const defaultArrowLength = 150

  if (inputX1 !== undefined && inputY1 !== undefined && inputX2 !== undefined && inputY2 !== undefined) {
    // User specified all coordinates - use them
    finalX1 = inputX1
    finalY1 = inputY1
    finalX2 = inputX2
    finalY2 = inputY2
    console.log('[AI Helpers] Using explicit coordinates:', finalX1, finalY1, finalX2, finalY2)
  } else {
    // Smart placement in viewport
    const viewportBounds = getViewportBounds(viewport)
    const existingShapes = await getShapes(canvasId)

    const placement = findEmptySpaceInViewport(
      viewportBounds,
      existingShapes,
      { width: defaultArrowLength, height: 10 } // Arrows are typically horizontal
    )

    finalX1 = placement.x
    finalY1 = placement.y
    finalX2 = placement.x + defaultArrowLength
    finalY2 = placement.y

    if (placement.isOutsideViewport) {
      const requiredZoom = calculateRequiredZoom(viewport, [...existingShapes])
      console.warn(`[AI Helpers] ⚠️ Arrow placed outside viewport. Zoom out to ${Math.round(requiredZoom * 100)}% to see all elements.`)
    } else {
      console.log('[AI Helpers] Smart placement in viewport:', finalX1, finalY1, finalX2, finalY2)
    }
  }

  const stroke = resolveColor(color) || DEFAULTS.arrowColor

  const baseProps = {
    id: uuidv4(),
    x: finalX1,
    y: finalY1,
    x2: finalX2,
    y2: finalY2,
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
 * Identify what color family a hex color belongs to
 * Returns the closest color name (e.g., "red", "blue", "green")
 */
function identifyColorName(hex: string): string {
  let closestColor = 'gray'
  let minDistance = Infinity

  // Find the closest color in COLOR_MAP
  for (const [colorName, colorHex] of Object.entries(COLOR_MAP)) {
    const distance = colorDistance(hex, colorHex)
    if (distance < minDistance) {
      minDistance = distance
      closestColor = colorName
    }
  }

  console.log(`[AI Helpers] Color identified: ${hex} → "${closestColor}" (distance: ${minDistance.toFixed(1)})`)
  return closestColor
}

/**
 * Check if a shape's color matches a color name or hex value
 * Uses intelligent color identification - works with ANY color!
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

  // For color names, identify what color the shape actually is
  const queryLower = colorQuery.toLowerCase()

  // Check fill color
  if (fill) {
    const fillColorName = identifyColorName(fill)
    if (fillColorName === queryLower) {
      console.log(`[AI Helpers] ✅ Match: fill ${fill} identified as "${fillColorName}"`)
      return true
    }
  }

  // Check stroke color
  if (stroke) {
    const strokeColorName = identifyColorName(stroke)
    if (strokeColorName === queryLower) {
      console.log(`[AI Helpers] ✅ Match: stroke ${stroke} identified as "${strokeColorName}"`)
      return true
    }
  }

  return false
}

/**
 * Apply category filter to shapes
 */
function applyCategoryFilter(shapes: Shape[], category?: 'shapes' | 'text' | 'arrows'): Shape[] {
  if (!category) return shapes

  const typesInCategory = ELEMENT_CATEGORIES[category] as readonly string[]
  const filtered = shapes.filter(s => (typesInCategory as string[]).includes(s.type))

  console.log(`[AI Helpers] Category filter "${category}": ${shapes.length} → ${filtered.length} elements`)
  return filtered
}

/**
 * Apply type filter to shapes
 */
function applyTypeFilter(shapes: Shape[], type?: string): Shape[] {
  if (!type) return shapes

  const filtered = shapes.filter(s => s.type === type)
  console.log(`[AI Helpers] Type filter "${type}": ${shapes.length} → ${filtered.length} elements`)
  return filtered
}

/**
 * Apply color filter to shapes
 */
function applyColorFilter(shapes: Shape[], color?: string): Shape[] {
  if (!color) return shapes

  const filtered = shapes.filter(s => matchesColor(s, color))
  console.log(`[AI Helpers] Color filter "${color}": ${shapes.length} → ${filtered.length} elements`)
  return filtered
}

/**
 * Apply text content filter (for text elements only)
 */
function applyTextContentFilter(shapes: Shape[], textContent?: string): Shape[] {
  if (!textContent) return shapes

  const filtered = shapes.filter(s => {
    if (s.type === 'text') {
      const text = (s as Text).text || ''
      return text.toLowerCase().includes(textContent.toLowerCase())
    }
    return false
  })

  console.log(`[AI Helpers] Text content filter "${textContent}": ${shapes.length} → ${filtered.length} elements`)
  return filtered
}

/**
 * Apply all filters in order: category → type → color → textContent
 */
function applyFilters(
  shapes: Shape[],
  filters: {
    category?: 'shapes' | 'text' | 'arrows'
    type?: string
    color?: string
    textContent?: string
  }
): Shape[] {
  let filtered = shapes

  filtered = applyCategoryFilter(filtered, filters.category)
  filtered = applyTypeFilter(filtered, filters.type)
  filtered = applyColorFilter(filtered, filters.color)
  filtered = applyTextContentFilter(filtered, filters.textContent)

  return filtered
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
 * Execute move_element tool call with smooth rendering
 * Uses RTDB for instant visual feedback, then persists to Firestore
 */
export async function executeMoveElement(
  canvasId: string,
  userId: string,
  input: {
    elementId?: string
    description?: string
    type?: string
    color?: string
    x?: number
    y?: number
    position?: string
  },
  _viewport: Viewport
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

  console.log(`[AI Helpers] Moving shape ${shape.id} to (${newX}, ${newY})`)

  // SMOOTH RENDERING PATTERN:
  // 1. Write to RTDB first (Canvas subscribes and applies changes smoothly)
  const rtdbUpdates = new Map<string, any>()
  const positionData: any = {
    x: newX,
    y: newY,
    updatedBy: userId,
  }

  // For lines/arrows/connectors, also update endpoints
  if ('x2' in shape && 'y2' in shape) {
    const dx = newX - shape.x
    const dy = newY - shape.y
    positionData.x2 = (shape as any).x2 + dx
    positionData.y2 = (shape as any).y2 + dy

    // For bent connectors, also move the bend point
    if ('bendX' in shape && 'bendY' in shape) {
      positionData.bendX = (shape as any).bendX + dx
      positionData.bendY = (shape as any).bendY + dy
    }
  }

  rtdbUpdates.set(shape.id, positionData)
  await writeBatchShapePositions(canvasId, rtdbUpdates)

  // 2. Brief delay to allow smooth animation
  await new Promise(resolve => setTimeout(resolve, 100))

  // 3. Persist to Firestore for permanent storage
  const firestoreUpdates: any = { x: newX, y: newY }
  if (positionData.x2 !== undefined) {
    firestoreUpdates.x2 = positionData.x2
    firestoreUpdates.y2 = positionData.y2
  }
  if (positionData.bendX !== undefined) {
    firestoreUpdates.bendX = positionData.bendX
    firestoreUpdates.bendY = positionData.bendY
  }
  await updateShape(canvasId, shape.id, firestoreUpdates)

  // 4. Clear RTDB (Firestore is now source of truth)
  await clearShapePositions(canvasId, [shape.id])

  console.log('[AI Helpers] Shape moved successfully with smooth rendering')
}

/**
 * Execute resize_element tool call with smooth rendering
 * Uses RTDB for instant visual feedback, then persists to Firestore
 */
export async function executeResizeElement(
  canvasId: string,
  userId: string,
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
  },
  _viewport: Viewport
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

  // SMOOTH RENDERING PATTERN:
  // 1. Write to RTDB first (Canvas subscribes and applies changes smoothly)
  const rtdbUpdates = new Map<string, any>()
  const positionData: any = {
    x: shape.x,
    y: shape.y,
    updatedBy: userId,
    ...updates, // Include all dimension updates
  }
  rtdbUpdates.set(shape.id, positionData)
  await writeBatchShapePositions(canvasId, rtdbUpdates)

  // 2. Brief delay to allow smooth animation
  await new Promise(resolve => setTimeout(resolve, 100))

  // 3. Persist to Firestore for permanent storage
  await updateShape(canvasId, shape.id, updates)

  // 4. Clear RTDB (Firestore is now source of truth)
  await clearShapePositions(canvasId, [shape.id])

  console.log('[AI Helpers] Shape resized successfully with smooth rendering')
}

/**
 * Execute rotate_element tool call with smooth rendering
 * Uses RTDB for instant visual feedback, then persists to Firestore
 */
export async function executeRotateElement(
  canvasId: string,
  userId: string,
  input: {
    elementId?: string
    description?: string
    type?: string
    color?: string
    angle: number
  },
  _viewport: Viewport
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

  console.log(`[AI Helpers] Rotating shape ${shape.id} to ${input.angle} degrees`)

  // SMOOTH RENDERING PATTERN:
  // 1. Write to RTDB first (Canvas subscribes and applies changes smoothly)
  const rtdbUpdates = new Map<string, any>()
  const positionData: any = {
    x: shape.x,
    y: shape.y,
    rotation: input.angle,
    updatedBy: userId,
  }
  rtdbUpdates.set(shape.id, positionData)
  await writeBatchShapePositions(canvasId, rtdbUpdates)

  // 2. Brief delay to allow smooth animation
  await new Promise(resolve => setTimeout(resolve, 100))

  // 3. Persist to Firestore for permanent storage
  await updateShape(canvasId, shape.id, { rotation: input.angle })

  // 4. Clear RTDB (Firestore is now source of truth)
  await clearShapePositions(canvasId, [shape.id])

  console.log('[AI Helpers] Shape rotated successfully with smooth rendering')
}

/**
 * Arrange shapes in a grid pattern
 * Returns new array with updated positions (immutable)
 */
export function arrangeInGrid(shapes: Shape[], spacing: number = 20): Shape[] {
  if (shapes.length === 0) return []

  // Calculate grid dimensions (approximately square)
  const cols = Math.ceil(Math.sqrt(shapes.length))
  const rows = Math.ceil(shapes.length / cols)

  console.log(`[AI Helpers] Arranging ${shapes.length} shapes in ${rows}x${cols} grid`)

  // Create new array to avoid mutation (lesson from bugfix docs)
  const arranged: Shape[] = []
  let currentX = 0
  let currentY = 0

  for (let row = 0; row < rows; row++) {
    let maxHeightInRow = 0
    currentX = 0

    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      if (index >= shapes.length) break

      const shape = shapes[index]
      const shapeWidth = getShapeWidth(shape)
      const shapeHeight = getShapeHeight(shape)

      // Update position (create new object to avoid mutation)
      arranged.push({
        ...shape,
        x: currentX,
        y: currentY,
      })

      currentX += shapeWidth + spacing
      maxHeightInRow = Math.max(maxHeightInRow, shapeHeight)
    }

    currentY += maxHeightInRow + spacing
  }

  return arranged
}

/**
 * Arrange shapes in a horizontal row
 * Returns new array with updated positions (immutable)
 */
export function arrangeInRow(shapes: Shape[], spacing: number = 20): Shape[] {
  if (shapes.length === 0) return []

  console.log(`[AI Helpers] Arranging ${shapes.length} shapes in row`)

  // Create new array to avoid mutation
  const arranged: Shape[] = []
  let currentX = 0

  // Use first shape's Y position as baseline
  const baseY = shapes[0]?.y ?? 0

  for (const shape of shapes) {
    const shapeWidth = getShapeWidth(shape)

    arranged.push({
      ...shape,
      x: currentX,
      y: baseY,
    })

    currentX += shapeWidth + spacing
  }

  return arranged
}

/**
 * Arrange shapes in a vertical column
 * Returns new array with updated positions (immutable)
 */
export function arrangeInColumn(shapes: Shape[], spacing: number = 20): Shape[] {
  if (shapes.length === 0) return []

  console.log(`[AI Helpers] Arranging ${shapes.length} shapes in column`)

  // Create new array to avoid mutation
  const arranged: Shape[] = []
  let currentY = 0

  // Use first shape's X position as baseline
  const baseX = shapes[0]?.x ?? 0

  for (const shape of shapes) {
    const shapeHeight = getShapeHeight(shape)

    arranged.push({
      ...shape,
      x: baseX,
      y: currentY,
    })

    currentY += shapeHeight + spacing
  }

  return arranged
}

/**
 * Align shapes to a specific alignment
 * Returns new array with updated positions (immutable)
 */
export function alignShapes(
  shapes: Shape[],
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'
): Shape[] {
  if (shapes.length === 0) return []

  console.log(`[AI Helpers] Aligning ${shapes.length} shapes to ${alignment} (maintaining relative positioning)`)

  // Create new array to avoid mutation
  const aligned: Shape[] = []
  let deltaX = 0
  let deltaY = 0

  switch (alignment) {
    case 'left': {
      // Move all shapes so the leftmost shape stays at its current position
      // (This aligns the group to the left-most shape's position)
      deltaX = 0  // No change needed - already at leftmost position
      for (const shape of shapes) {
        aligned.push({ ...shape })
      }
      break
    }

    case 'right': {
      // Find the current rightmost edge and leftmost edge
      const currentRightmost = Math.max(...shapes.map(s => s.x + getShapeWidth(s)))
      const currentLeftmost = Math.min(...shapes.map(s => s.x))
      // Calculate the leftmost x that would align the rightmost shape
      const targetLeftmost = currentRightmost - getShapeWidth(shapes.find(s => s.x + getShapeWidth(s) === currentRightmost)!)
      // Move all shapes by the delta
      deltaX = targetLeftmost - currentLeftmost
      for (const shape of shapes) {
        aligned.push({ ...shape, x: shape.x + deltaX })
      }
      break
    }

    case 'top': {
      // Move all shapes so the topmost shape stays at its current position
      deltaY = 0  // No change needed - already at topmost position
      for (const shape of shapes) {
        aligned.push({ ...shape })
      }
      break
    }

    case 'bottom': {
      // Find the current bottommost edge and topmost edge
      const currentBottommost = Math.max(...shapes.map(s => s.y + getShapeHeight(s)))
      const currentTopmost = Math.min(...shapes.map(s => s.y))
      // Calculate the topmost y that would align the bottommost shape
      const targetTopmost = currentBottommost - getShapeHeight(shapes.find(s => s.y + getShapeHeight(s) === currentBottommost)!)
      // Move all shapes by the delta
      deltaY = targetTopmost - currentTopmost
      for (const shape of shapes) {
        aligned.push({ ...shape, y: shape.y + deltaY })
      }
      break
    }

    case 'center-horizontal': {
      // Calculate the group's center x
      const minX = Math.min(...shapes.map(s => s.x))
      const maxX = Math.max(...shapes.map(s => s.x + getShapeWidth(s)))
      const groupCenterX = (minX + maxX) / 2

      // Calculate the average center x (target)
      const centerXs = shapes.map(s => s.x + getShapeWidth(s) / 2)
      const avgCenterX = centerXs.reduce((sum, x) => sum + x, 0) / centerXs.length

      // Move all shapes by the delta to center the group
      deltaX = avgCenterX - groupCenterX
      for (const shape of shapes) {
        aligned.push({ ...shape, x: shape.x + deltaX })
      }
      break
    }

    case 'center-vertical': {
      // Calculate the group's center y
      const minY = Math.min(...shapes.map(s => s.y))
      const maxY = Math.max(...shapes.map(s => s.y + getShapeHeight(s)))
      const groupCenterY = (minY + maxY) / 2

      // Calculate the average center y (target)
      const centerYs = shapes.map(s => s.y + getShapeHeight(s) / 2)
      const avgCenterY = centerYs.reduce((sum, y) => sum + y, 0) / centerYs.length

      // Move all shapes by the delta to center the group
      deltaY = avgCenterY - groupCenterY
      for (const shape of shapes) {
        aligned.push({ ...shape, y: shape.y + deltaY })
      }
      break
    }

    default:
      console.warn(`[AI Helpers] Unknown alignment: ${alignment}`)
      return shapes
  }

  console.log(`[AI Helpers] Applied delta: (${deltaX}, ${deltaY})`)
  return aligned
}

/**
 * Align shapes to viewport edges (viewport-aware alignment)
 * Maintains relative positioning - moves shapes as a group
 *
 * Top: Group's top edge aligns to viewport.top (no padding)
 * Bottom: Group's bottom edge aligns with 10px padding from viewport.bottom
 * Left: Group's left edge aligns with 10px padding from viewport.left
 * Right: Group's right edge aligns with 10px padding from viewport.right
 */
function alignShapesToViewport(
  shapes: Shape[],
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical',
  viewport: Viewport
): Shape[] {
  const viewportBounds = getViewportBounds(viewport)
  const edges = getViewportEdges(viewportBounds)
  const aligned: Shape[] = []

  console.log(`[AI Helpers] Aligning ${shapes.length} shapes to viewport ${alignment} (maintaining relative positioning)`)
  console.log(`[AI Helpers] Viewport bounds:`, viewportBounds)
  console.log(`[AI Helpers] Viewport edges:`, edges)

  // Padding to ensure shapes are inside viewport on all sides (in screen pixels)
  const EDGE_PADDING_PX = 10
  const edgePadding = EDGE_PADDING_PX / viewport.zoom

  console.log(`[AI Helpers] Edge padding (all sides): ${edgePadding}px (${EDGE_PADDING_PX}px screen)`)

  let deltaX = 0
  let deltaY = 0

  switch (alignment) {
    case 'left': {
      // Find the leftmost shape's left edge
      const currentLeftmost = Math.min(...shapes.map(s => s.x - getLeftOffset(s)))
      // Target: viewport left edge + padding
      const targetLeft = edges.left + edgePadding
      // Calculate delta to move the entire group
      deltaX = targetLeft - currentLeftmost
      console.log(`[AI Helpers] Moving group from x=${currentLeftmost} to x=${targetLeft} (delta: ${deltaX})`)
      for (const shape of shapes) {
        aligned.push({ ...shape, x: shape.x + deltaX })
      }
      break
    }

    case 'right': {
      // Find the rightmost shape's right edge
      const currentRightmost = Math.max(...shapes.map(s => s.x + getRightOffset(s)))
      // Target: viewport right edge - padding
      const targetRight = edges.right - edgePadding
      // Calculate delta to move the entire group
      deltaX = targetRight - currentRightmost
      console.log(`[AI Helpers] Moving group from right edge=${currentRightmost} to ${targetRight} (delta: ${deltaX})`)
      for (const shape of shapes) {
        aligned.push({ ...shape, x: shape.x + deltaX })
      }
      break
    }

    case 'top': {
      // Find the topmost shape's top edge
      const currentTopmost = Math.min(...shapes.map(s => s.y - getTopOffset(s)))
      // Target: viewport top edge (no padding at top)
      const targetTop = edges.top
      // Calculate delta to move the entire group
      deltaY = targetTop - currentTopmost
      console.log(`[AI Helpers] Moving group from y=${currentTopmost} to y=${targetTop} (delta: ${deltaY})`)
      for (const shape of shapes) {
        aligned.push({ ...shape, y: shape.y + deltaY })
      }
      break
    }

    case 'bottom': {
      // Find the bottommost shape's bottom edge
      const currentBottommost = Math.max(...shapes.map(s => s.y + getBottomOffset(s)))
      // Target: viewport bottom edge - padding
      const targetBottom = edges.bottom - edgePadding
      // Calculate delta to move the entire group
      deltaY = targetBottom - currentBottommost
      console.log(`[AI Helpers] Moving group from bottom edge=${currentBottommost} to ${targetBottom} (delta: ${deltaY})`)
      for (const shape of shapes) {
        aligned.push({ ...shape, y: shape.y + deltaY })
      }
      break
    }

    case 'center-horizontal': {
      // Find the group's horizontal center
      const minX = Math.min(...shapes.map(s => s.x - getLeftOffset(s)))
      const maxX = Math.max(...shapes.map(s => s.x + getRightOffset(s)))
      const currentGroupCenterX = (minX + maxX) / 2
      // Target: viewport center
      const targetCenterX = edges.centerX
      // Calculate delta to move the entire group
      deltaX = targetCenterX - currentGroupCenterX
      console.log(`[AI Helpers] Moving group center from x=${currentGroupCenterX} to x=${targetCenterX} (delta: ${deltaX})`)
      for (const shape of shapes) {
        aligned.push({ ...shape, x: shape.x + deltaX })
      }
      break
    }

    case 'center-vertical': {
      // Find the group's vertical center
      const minY = Math.min(...shapes.map(s => s.y - getTopOffset(s)))
      const maxY = Math.max(...shapes.map(s => s.y + getBottomOffset(s)))
      const currentGroupCenterY = (minY + maxY) / 2
      // Target: viewport center
      const targetCenterY = edges.centerY
      // Calculate delta to move the entire group
      deltaY = targetCenterY - currentGroupCenterY
      console.log(`[AI Helpers] Moving group center from y=${currentGroupCenterY} to y=${targetCenterY} (delta: ${deltaY})`)
      for (const shape of shapes) {
        aligned.push({ ...shape, y: shape.y + deltaY })
      }
      break
    }

    default:
      console.warn(`[AI Helpers] Unknown alignment: ${alignment}`)
      return shapes
  }

  console.log(`[AI Helpers] Applied delta: (${deltaX}, ${deltaY})`)
  console.log(`[AI Helpers] Aligned shapes:`, aligned.map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y })))
  return aligned
}

/**
 * Execute arrange_elements tool call with smooth rendering
 * Uses RTDB for instant visual feedback, then persists to Firestore
 */
export async function executeArrangeElements(
  canvasId: string,
  userId: string,
  input: {
    elementIds: string[]
    pattern: 'grid' | 'row' | 'column' | 'circle'
    spacing?: number
    category?: 'shapes' | 'text' | 'arrows'
    type?: string
    color?: string
    textContent?: string
  }
): Promise<void> {
  console.log('[AI Helpers] executeArrangeElements called with:', input)

  const { elementIds, pattern, spacing = 20, category, type, color, textContent } = input

  // Get all shapes
  const allShapes = await getShapes(canvasId)

  // Handle "all" keyword - arrange all shapes on canvas
  const shouldArrangeAll = elementIds?.includes('all') || elementIds?.length === 1 && elementIds[0] === 'all'

  let shapesToArrange = shouldArrangeAll
    ? allShapes  // Use all shapes
    : allShapes.filter(s => elementIds?.includes(s.id))  // Filter to requested shapes

  // Apply filters when using "all"
  if (shouldArrangeAll) {
    shapesToArrange = applyFilters(shapesToArrange, { category, type, color, textContent })
  }

  if (shapesToArrange.length === 0) {
    throw new Error('No matching shapes found to arrange')
  }

  console.log(`[AI Helpers] Arranging ${shouldArrangeAll ? 'ALL' : shapesToArrange.length} shapes`)

  console.log(`[AI Helpers] Found ${shapesToArrange.length} shapes to arrange in ${pattern} pattern`)

  // Arrange shapes based on pattern
  let arrangedShapes: Shape[]

  switch (pattern) {
    case 'grid':
      arrangedShapes = arrangeInGrid(shapesToArrange, spacing)
      break

    case 'row':
      arrangedShapes = arrangeInRow(shapesToArrange, spacing)
      break

    case 'column':
      arrangedShapes = arrangeInColumn(shapesToArrange, spacing)
      break

    case 'circle':
      // TODO: Implement circular arrangement in future PR
      console.warn('[AI Helpers] Circular arrangement not yet implemented, using grid')
      arrangedShapes = arrangeInGrid(shapesToArrange, spacing)
      break

    default:
      throw new Error(`Unknown arrangement pattern: ${pattern}`)
  }

  // SMOOTH RENDERING PATTERN:
  // 1. Write all positions to RTDB in a single batch (Canvas subscribes and applies smoothly)
  const rtdbUpdates = new Map<string, any>()
  for (const shape of arrangedShapes) {
    rtdbUpdates.set(shape.id, {
      x: shape.x,
      y: shape.y,
      updatedBy: userId,
    })
  }
  await writeBatchShapePositions(canvasId, rtdbUpdates)

  // 2. Brief delay to allow smooth animation
  await new Promise(resolve => setTimeout(resolve, 150))

  // 3. Persist all to Firestore (batch update)
  console.log('[AI Helpers] Updating shape positions in Firestore')
  for (const shape of arrangedShapes) {
    await updateShape(canvasId, shape.id, {
      x: shape.x,
      y: shape.y,
    })
  }

  // 4. Clear all RTDB positions (Firestore is now source of truth)
  await clearShapePositions(canvasId, arrangedShapes.map(s => s.id))

  console.log('[AI Helpers] Arrangement complete with smooth rendering')
}

/**
 * Execute align_elements tool call with smooth rendering
 * Uses RTDB for instant visual feedback, then persists to Firestore
 */
export async function executeAlignElements(
  canvasId: string,
  userId: string,
  input: {
    elementIds: string[]
    alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'
    alignTo?: 'viewport' | 'canvas'
    category?: 'shapes' | 'text' | 'arrows'
    type?: string
    color?: string
    textContent?: string
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeAlignElements called with:', input)

  const { elementIds, alignment, alignTo = 'viewport', category, type, color, textContent } = input

  // Get all shapes
  const allShapes = await getShapes(canvasId)

  // Handle "all" keyword - align all shapes on canvas
  const shouldAlignAll = elementIds?.includes('all') || elementIds?.length === 1 && elementIds[0] === 'all'

  let shapesToAlign = shouldAlignAll
    ? allShapes  // Use all shapes
    : allShapes.filter(s => elementIds?.includes(s.id))  // Filter to requested shapes

  // Apply filters when using "all"
  if (shouldAlignAll) {
    shapesToAlign = applyFilters(shapesToAlign, { category, type, color, textContent })
  }

  if (shapesToAlign.length === 0) {
    throw new Error('No matching shapes found to align')
  }

  console.log(`[AI Helpers] Aligning ${shouldAlignAll ? 'ALL' : shapesToAlign.length} shapes to ${alignment} (${alignTo})`)

  // Align shapes
  const alignedShapes = alignTo === 'viewport'
    ? alignShapesToViewport(shapesToAlign, alignment, viewport)
    : alignShapes(shapesToAlign, alignment)

  // Log before/after positions for debugging
  console.log('[AI Helpers] Position changes:')
  for (let i = 0; i < shapesToAlign.length; i++) {
    const original = shapesToAlign[i]
    const aligned = alignedShapes[i]
    console.log(`  Shape ${original.id}: (${original.x}, ${original.y}) → (${aligned.x}, ${aligned.y})`)
  }

  // SMOOTH RENDERING PATTERN:
  // 1. Write all positions to RTDB in a single batch (Canvas subscribes and applies smoothly)
  const rtdbUpdates = new Map<string, any>()
  for (const alignedShape of alignedShapes) {
    rtdbUpdates.set(alignedShape.id, {
      x: alignedShape.x,
      y: alignedShape.y,
      updatedBy: userId,
    })
  }
  await writeBatchShapePositions(canvasId, rtdbUpdates)

  // 2. Brief delay to allow smooth animation
  await new Promise(resolve => setTimeout(resolve, 150))

  // 3. Persist all to Firestore (batch update)
  console.log('[AI Helpers] Updating shape positions in Firestore')
  for (const alignedShape of alignedShapes) {
    await updateShape(canvasId, alignedShape.id, {
      x: alignedShape.x,
      y: alignedShape.y,
    })
  }

  // 4. Clear all RTDB positions (Firestore is now source of truth)
  await clearShapePositions(canvasId, alignedShapes.map(s => s.id))

  console.log('[AI Helpers] Alignment complete with smooth rendering')
}

// =============================================================================
// PR #17: Complex AI Commands
// =============================================================================

/**
 * Execute create_ui_component tool call
 * Creates common UI components like login forms, nav bars, cards, etc.
 */
export async function executeCreateUIComponent(
  canvasId: string,
  userId: string,
  input: {
    componentType: 'button' | 'card' | 'form' | 'navbar' | 'sidebar'
    x: number
    y: number
    label?: string
    width?: number
    height?: number
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateUIComponent called with:', input, 'userId:', userId)

  const { componentType, label, width = 200, height = 50 } = input

  // Determine starting position using smart placement
  const viewportBounds = getViewportBounds(viewport)
  const existingShapes = await getShapes(canvasId)
  const { x: startX, y: startY } = findEmptySpaceInViewport(
    viewportBounds,
    existingShapes,
    { width, height: height + 300 } // Extra height for multi-element components
  )

  const shapes: Shape[] = []

  switch (componentType) {
    case 'button': {
      // Simple button: rectangle + centered text
      const buttonId = uuidv4()
      const textId = uuidv4()

      const button: Rectangle = {
        id: buttonId,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: width,
        height: height,
        fill: '#3B82F6',
        stroke: '#2563EB',
        strokeWidth: 2,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }

      const text: Text = {
        id: textId,
        type: 'text',
        x: startX + width / 2,
        y: startY + height / 2 - 12, // Center vertically
        text: label || 'Button',
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 700,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'center',
        lineHeight: 1.2,
        fill: '#000000',
        width: width - 20,
        height: 24,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }

      shapes.push(button, text)
      break
    }

    case 'card': {
      // Card: background rectangle + title + content placeholder
      const cardBg = uuidv4()
      const titleId = uuidv4()
      const contentId = uuidv4()

      const cardHeight = height * 3 // Cards are typically taller

      const background: Rectangle = {
        id: cardBg,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: width,
        height: cardHeight,
        fill: '#FFFFFF',
        stroke: '#E5E7EB',
        strokeWidth: 1,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }

      const title: Text = {
        id: titleId,
        type: 'text',
        x: startX + 16,
        y: startY + 16,
        text: label || 'Card Title',
        fontSize: 22,
        fontFamily: 'Arial',
        fontWeight: 700,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.2,
        fill: '#111827',
        width: width - 32,
        height: 32,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }

      const content: Text = {
        id: contentId,
        type: 'text',
        x: startX + 16,
        y: startY + 58,
        text: 'Card content goes here',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 400,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.4,
        fill: '#6B7280',
        width: width - 32,
        height: 64,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }

      shapes.push(background, title, content)
      break
    }

    case 'form': {
      // Login form: 2 input fields (username, password) + button
      // Create rectangles FIRST, then text labels on top (proper z-order)
      const usernameLabel = uuidv4()
      const usernameInput = uuidv4()
      const passwordLabel = uuidv4()
      const passwordInput = uuidv4()
      const submitButton = uuidv4()
      const buttonText = uuidv4()

      // Username input rectangle (background layer)
      shapes.push({
        id: usernameInput,
        type: 'rectangle',
        x: startX,
        y: startY + 30,
        width: width,
        height: 40,
        fill: '#FFFFFF',
        stroke: '#D1D5DB',
        strokeWidth: 1,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Rectangle)

      // Password input rectangle (background layer)
      shapes.push({
        id: passwordInput,
        type: 'rectangle',
        x: startX,
        y: startY + 100,
        width: width,
        height: 40,
        fill: '#FFFFFF',
        stroke: '#D1D5DB',
        strokeWidth: 1,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Rectangle)

      // Submit button rectangle (background layer)
      shapes.push({
        id: submitButton,
        type: 'rectangle',
        x: startX,
        y: startY + 170,
        width: width,
        height: 40,
        fill: '#3B82F6',
        stroke: '#2563EB',
        strokeWidth: 2,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Rectangle)

      // Username label (text layer - on top)
      shapes.push({
        id: usernameLabel,
        type: 'text',
        x: startX,
        y: startY,
        text: 'Username',
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 600,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.2,
        fill: '#1F2937',
        width: width,
        height: 24,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Text)

      // Password label (text layer - on top)
      shapes.push({
        id: passwordLabel,
        type: 'text',
        x: startX,
        y: startY + 70,
        text: 'Password',
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 600,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.2,
        fill: '#1F2937',
        width: width,
        height: 24,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Text)

      // Button text (text layer - on top)
      shapes.push({
        id: buttonText,
        type: 'text',
        x: startX + width / 2,
        y: startY + 178,
        text: label || 'Login',
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 700,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'center',
        lineHeight: 1.2,
        fill: '#000000',
        width: width - 20,
        height: 24,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Text)

      break
    }

    case 'navbar': {
      // Nav bar: background + 4 menu items
      // Create background FIRST (bottom layer), then text on top
      const navBg = uuidv4()
      const menuItems = ['Home', 'About', 'Services', 'Contact']
      const navbarWidth = width * 2.5 // Wider for nav bar
      const itemSpacing = navbarWidth / (menuItems.length + 1) // +1 for better spacing

      // LAYER 1: Background rectangle (bottom)
      shapes.push({
        id: navBg,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: navbarWidth,
        height: 60,
        fill: '#1F2937',
        stroke: '#111827',
        strokeWidth: 1,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Rectangle)

      // LAYER 2: Menu text items (on top) - evenly spaced and centered
      menuItems.forEach((item, index) => {
        shapes.push({
          id: uuidv4(),
          type: 'text',
          x: startX + itemSpacing * (index + 1), // Center of each spacing section
          y: startY + 20,
          text: item,
          fontSize: 20,
          fontFamily: 'Arial',
          fontWeight: 700,
          fontStyle: 'normal',
          textDecoration: 'none',
          align: 'center', // Center-align text for proper centering
          lineHeight: 1.2,
          fill: '#FFFFFF',
          width: 120,
          height: 26,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
        } as Text)
      })

      break
    }

    case 'sidebar': {
      // Sidebar: background + 3 menu items
      const sidebarBg = uuidv4()
      const menuItems = ['Dashboard', 'Profile', 'Settings']

      // Background
      shapes.push({
        id: sidebarBg,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: 200,
        height: 400,
        fill: '#F3F4F6',
        stroke: '#E5E7EB',
        strokeWidth: 1,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Rectangle)

      // Menu items
      menuItems.forEach((item, index) => {
        shapes.push({
          id: uuidv4(),
          type: 'text',
          x: startX + 20,
          y: startY + 30 + (index * 60),
          text: item,
          fontSize: 18,
          fontFamily: 'Arial',
          fontWeight: 600,
          fontStyle: 'normal',
          textDecoration: 'none',
          align: 'left',
          lineHeight: 1.2,
          fill: '#374151',
          width: 160,
          height: 24,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
        } as Text)
      })

      break
    }

    default:
      throw new Error(`Unknown component type: ${componentType}`)
  }

  // Create all shapes in Firestore
  console.log(`[AI Helpers] Creating ${shapes.length} shapes for ${componentType}`)
  for (const shape of shapes) {
    await createShape(canvasId, shape)
  }

  console.log(`[AI Helpers] UI component '${componentType}' created successfully`)
}

/**
 * Execute create_flowchart tool call
 * Creates a flowchart with connected nodes and proper metadata for simulation
 */
export async function executeCreateFlowchart(
  canvasId: string,
  userId: string,
  input: {
    nodes: Array<{
      id: string
      label: string
      type: 'start' | 'process' | 'decision' | 'end'
    }>
    connections?: Array<{
      from: string
      to: string
      label?: string
    }>
    startX?: number
    startY?: number
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateFlowchart called with:', input, 'userId:', userId)

  const { nodes, connections = [], startX, startY } = input

  if (nodes.length === 0) {
    throw new Error('Flowchart must have at least one node')
  }

  // Determine starting position
  const viewportBounds = getViewportBounds(viewport)
  const existingShapes = await getShapes(canvasId)
  const estimatedHeight = nodes.length * 150
  const { x: defaultStartX, y: defaultStartY } = findEmptySpaceInViewport(
    viewportBounds,
    existingShapes,
    { width: 300, height: estimatedHeight }
  )

  const finalStartX = startX ?? defaultStartX
  const finalStartY = startY ?? defaultStartY

  // Node spacing
  const verticalSpacing = 150
  const nodeWidth = 180
  const nodeHeight = 80

  // Create node shapes with metadata
  const createdNodes = new Map<string, { shape: Shape; centerX: number; centerY: number }>()

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const nodeId = uuidv4()
    const textId = uuidv4()
    const y = finalStartY + (i * verticalSpacing)
    const centerX = finalStartX + nodeWidth / 2
    const centerY = y + nodeHeight / 2

    let nodeShape: Shape

    switch (node.type) {
      case 'start':
      case 'end': {
        // Ellipse for start/end
        nodeShape = {
          id: nodeId,
          type: 'ellipse',
          x: centerX,
          y: centerY,
          radiusX: nodeWidth / 2,
          radiusY: nodeHeight / 2,
          fill: node.type === 'start' ? '#10B981' : '#EF4444',
          stroke: '#1F2937',
          strokeWidth: 2,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
          metadata: {
            nodeType: node.type,
            flowchartId: `flowchart-${Date.now()}`,
            processTime: node.type === 'start' ? 0 : 0,
          },
        } as Ellipse
        break
      }

      case 'decision': {
        // Diamond for decision (using pentagon as approximation)
        nodeShape = {
          id: nodeId,
          type: 'pentagon',
          x: centerX,
          y: centerY,
          radiusX: nodeWidth / 2,
          radiusY: nodeHeight / 2,
          fill: '#F59E0B',
          stroke: '#1F2937',
          strokeWidth: 2,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
          metadata: {
            nodeType: 'decision',
            flowchartId: `flowchart-${Date.now()}`,
            successRate: 0.7, // Default 70% success rate
          },
        } as Pentagon
        break
      }

      case 'process':
      default: {
        // Rectangle for process - position by CENTER to match ellipse/pentagon positioning
        nodeShape = {
          id: nodeId,
          type: 'rectangle',
          x: centerX - nodeWidth / 2, // Convert center position to top-left corner
          y: centerY - nodeHeight / 2, // Convert center position to top-left corner
          width: nodeWidth,
          height: nodeHeight,
          fill: '#3B82F6',
          stroke: '#1F2937',
          strokeWidth: 2,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
          metadata: {
            nodeType: 'process',
            flowchartId: `flowchart-${Date.now()}`,
            processTime: 1000, // Default 1 second process time
            capacity: 10, // Default capacity of 10 concurrent tokens
          },
        } as Rectangle
        break
      }
    }

    // Create node shape
    await createShape(canvasId, nodeShape)
    createdNodes.set(node.id, { shape: nodeShape, centerX, centerY })

    // Create label text (black text for visibility on colored backgrounds)
    const labelText: Text = {
      id: textId,
      type: 'text',
      x: centerX,
      y: centerY - 12,
      text: node.label,
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 700,
      fontStyle: 'normal',
      textDecoration: 'none',
      align: 'center',
      lineHeight: 1.2,
      fill: '#000000',
      width: nodeWidth - 20,
      height: 24,
      rotation: 0,
      createdBy: userId,
      updatedAt: new Date().toISOString(),
    }
    await createShape(canvasId, labelText)
  }

  // Create connections (arrows) with metadata
  const createdConnections: Array<{ from: string; to: string; arrowId: string }> = []

  // Auto-generate connections if not provided
  const actualConnections: Array<{ from: string; to: string; label?: string }> = connections.length > 0
    ? connections
    : nodes.slice(0, -1).map((node, i) => ({
        from: node.id,
        to: nodes[i + 1].id,
      }))

  for (const conn of actualConnections) {
    const fromNode = createdNodes.get(conn.from)
    const toNode = createdNodes.get(conn.to)

    if (!fromNode || !toNode) {
      console.warn(`[AI Helpers] Skipping connection ${conn.from} → ${conn.to}: node not found`)
      continue
    }

    const arrowId = uuidv4()

    // Calculate arrow positions (bottom of from node to top of to node)
    const fromY = fromNode.centerY + (nodeHeight / 2)
    const toY = toNode.centerY - (nodeHeight / 2)

    const arrow: Arrow = {
      id: arrowId,
      type: 'arrow',
      x: fromNode.centerX,
      y: fromY,
      x2: toNode.centerX,
      y2: toY,
      stroke: '#1F2937',
      strokeWidth: 2,
      rotation: 0,
      createdBy: userId,
      updatedAt: new Date().toISOString(),
      connections: {
        fromShapeId: fromNode.shape.id,
        toShapeId: toNode.shape.id,
      },
    }

    await createShape(canvasId, arrow)
    createdConnections.push({ from: conn.from, to: conn.to, arrowId })

    // Create label if provided
    if (conn.label) {
      const labelId = uuidv4()
      const midX = (fromNode.centerX + toNode.centerX) / 2
      const midY = (fromY + toY) / 2

      const labelText: Text = {
        id: labelId,
        type: 'text',
        x: midX + 15,
        y: midY - 9,
        text: conn.label,
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 600,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.2,
        fill: '#000000', // Pure black for maximum visibility on white canvas
        width: 100,
        height: 22,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }
      await createShape(canvasId, labelText)
    }
  }

  console.log(`[AI Helpers] Flowchart created with ${nodes.length} nodes and ${createdConnections.length} connections`)
}

/**
 * Execute create_diagram tool call
 * Creates structured diagrams like org charts, trees, networks, etc.
 */
export async function executeCreateDiagram(
  canvasId: string,
  userId: string,
  input: {
    diagramType: 'tree' | 'orgchart' | 'network' | 'sequence'
    data: any
    x?: number
    y?: number
  },
  viewport: Viewport
): Promise<void> {
  console.log('[AI Helpers] executeCreateDiagram called with:', input, 'userId:', userId)

  const { diagramType, data, x, y } = input

  // Determine starting position
  const viewportBounds = getViewportBounds(viewport)
  const existingShapes = await getShapes(canvasId)
  const { x: defaultX, y: defaultY } = findEmptySpaceInViewport(
    viewportBounds,
    existingShapes,
    { width: 400, height: 400 }
  )

  const startX = x ?? defaultX
  const startY = y ?? defaultY

  switch (diagramType) {
    case 'orgchart': {
      // Simple 3-level org chart: CEO → 3 Managers → 2 Employees each
      const nodeWidth = 140
      const nodeHeight = 60
      const horizontalSpacing = 180
      const verticalSpacing = 120

      // CEO at top
      const ceoId = uuidv4()
      const ceoTextId = uuidv4()

      const ceo: Rectangle = {
        id: ceoId,
        type: 'rectangle',
        x: startX,
        y: startY,
        width: nodeWidth,
        height: nodeHeight,
        fill: '#8B5CF6',
        stroke: '#1F2937',
        strokeWidth: 2,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      }
      await createShape(canvasId, ceo)

      await createShape(canvasId, {
        id: ceoTextId,
        type: 'text',
        x: startX + nodeWidth / 2,
        y: startY + nodeHeight / 2 - 12,
        text: data.ceo || 'CEO',
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 700,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'center',
        lineHeight: 1.2,
        fill: '#000000',
        width: nodeWidth - 20,
        height: 24,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Text)

      // Managers (3)
      const managerCount = 3
      const managerIds: string[] = []
      const totalWidth = (managerCount - 1) * horizontalSpacing
      const managersStartX = startX - totalWidth / 2

      for (let i = 0; i < managerCount; i++) {
        const managerId = uuidv4()
        const managerTextId = uuidv4()
        const managerX = managersStartX + (i * horizontalSpacing)
        const managerY = startY + verticalSpacing

        const manager: Rectangle = {
          id: managerId,
          type: 'rectangle',
          x: managerX,
          y: managerY,
          width: nodeWidth,
          height: nodeHeight,
          fill: '#3B82F6',
          stroke: '#1F2937',
          strokeWidth: 2,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
        }
        await createShape(canvasId, manager)
        managerIds.push(managerId)

        await createShape(canvasId, {
          id: managerTextId,
          type: 'text',
          x: managerX + nodeWidth / 2,
          y: managerY + nodeHeight / 2 - 11,
          text: `Manager ${i + 1}`,
          fontSize: 16,
          fontFamily: 'Arial',
          fontWeight: 700,
          fontStyle: 'normal',
          textDecoration: 'none',
          align: 'center',
          lineHeight: 1.2,
          fill: '#000000',
          width: nodeWidth - 20,
          height: 22,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
        } as Text)

        // Arrow from CEO to Manager - connect from CEO bottom center to manager top center
        await createShape(canvasId, {
          id: uuidv4(),
          type: 'arrow',
          x: startX + nodeWidth / 2,  // CEO bottom center X
          y: startY + nodeHeight,      // CEO bottom Y
          x2: managerX + nodeWidth / 2, // Manager top center X
          y2: managerY,                  // Manager top Y
          stroke: '#6B7280',
          strokeWidth: 2,
          rotation: 0,
          createdBy: userId,
          updatedAt: new Date().toISOString(),
          connections: {
            fromShapeId: ceoId,
            toShapeId: managerId,
          },
        } as Arrow)
      }

      console.log(`[AI Helpers] Created org chart with ${1 + managerCount} nodes`)
      break
    }

    case 'tree':
    case 'network':
    case 'sequence': {
      // Simple placeholder implementation - can be enhanced later
      console.log(`[AI Helpers] Diagram type '${diagramType}' - creating basic structure`)

      // Create a simple 3-node structure
      const node1 = uuidv4()
      await createShape(canvasId, {
        id: node1,
        type: 'circle',
        x: startX,
        y: startY,
        radius: 40,
        fill: '#10B981',
        stroke: '#1F2937',
        strokeWidth: 2,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Circle)

      await createShape(canvasId, {
        id: uuidv4(),
        type: 'text',
        x: startX,
        y: startY - 6,
        text: 'Node 1',
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 700,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'center',
        lineHeight: 1.2,
        fill: '#000000',
        width: 80,
        height: 22,
        rotation: 0,
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      } as Text)

      console.log(`[AI Helpers] Created basic ${diagramType} diagram`)
      break
    }

    default:
      throw new Error(`Unknown diagram type: ${diagramType}`)
  }

  console.log(`[AI Helpers] Diagram '${diagramType}' created successfully`)
}
