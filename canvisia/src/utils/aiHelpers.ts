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

/**
 * Helper: Get width of a shape (handles different shape types)
 */
function getShapeWidth(shape: Shape): number {
  if ('width' in shape && shape.width !== undefined) {
    return shape.width
  }
  if ('radius' in shape && shape.radius !== undefined) {
    return shape.radius * 2
  }
  if ('radiusX' in shape && shape.radiusX !== undefined) {
    return shape.radiusX * 2
  }
  if ('outerRadiusX' in shape && shape.outerRadiusX !== undefined) {
    return shape.outerRadiusX * 2
  }
  return 100 // Default width
}

/**
 * Helper: Get height of a shape (handles different shape types)
 */
function getShapeHeight(shape: Shape): number {
  if ('height' in shape && shape.height !== undefined) {
    return shape.height
  }
  if ('radius' in shape && shape.radius !== undefined) {
    return shape.radius * 2
  }
  if ('radiusY' in shape && shape.radiusY !== undefined) {
    return shape.radiusY * 2
  }
  if ('outerRadiusY' in shape && shape.outerRadiusY !== undefined) {
    return shape.outerRadiusY * 2
  }
  return 100 // Default height
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

  console.log(`[AI Helpers] Aligning ${shapes.length} shapes to ${alignment}`)

  // Create new array to avoid mutation
  const aligned: Shape[] = []

  switch (alignment) {
    case 'left': {
      // Find leftmost x
      const minX = Math.min(...shapes.map(s => s.x))
      for (const shape of shapes) {
        aligned.push({ ...shape, x: minX })
      }
      break
    }

    case 'right': {
      // Find rightmost edge
      const maxRight = Math.max(...shapes.map(s => s.x + getShapeWidth(s)))
      for (const shape of shapes) {
        const shapeWidth = getShapeWidth(shape)
        aligned.push({ ...shape, x: maxRight - shapeWidth })
      }
      break
    }

    case 'top': {
      // Find topmost y
      const minY = Math.min(...shapes.map(s => s.y))
      for (const shape of shapes) {
        aligned.push({ ...shape, y: minY })
      }
      break
    }

    case 'bottom': {
      // Find bottommost edge
      const maxBottom = Math.max(...shapes.map(s => s.y + getShapeHeight(s)))
      for (const shape of shapes) {
        const shapeHeight = getShapeHeight(shape)
        aligned.push({ ...shape, y: maxBottom - shapeHeight })
      }
      break
    }

    case 'center-horizontal': {
      // Calculate average center x
      const centerXs = shapes.map(s => s.x + getShapeWidth(s) / 2)
      const avgCenterX = centerXs.reduce((sum, x) => sum + x, 0) / centerXs.length

      for (const shape of shapes) {
        const shapeWidth = getShapeWidth(shape)
        aligned.push({ ...shape, x: avgCenterX - shapeWidth / 2 })
      }
      break
    }

    case 'center-vertical': {
      // Calculate average center y
      const centerYs = shapes.map(s => s.y + getShapeHeight(s) / 2)
      const avgCenterY = centerYs.reduce((sum, y) => sum + y, 0) / centerYs.length

      for (const shape of shapes) {
        const shapeHeight = getShapeHeight(shape)
        aligned.push({ ...shape, y: avgCenterY - shapeHeight / 2 })
      }
      break
    }

    default:
      console.warn(`[AI Helpers] Unknown alignment: ${alignment}`)
      return shapes
  }

  return aligned
}

/**
 * Execute arrange_elements tool call
 */
export async function executeArrangeElements(
  canvasId: string,
  _userId: string,
  input: {
    elementIds: string[]
    pattern: 'grid' | 'row' | 'column' | 'circle'
    spacing?: number
  }
): Promise<void> {
  console.log('[AI Helpers] executeArrangeElements called with:', input)

  const { elementIds, pattern, spacing = 20 } = input

  // Get all shapes
  const allShapes = await getShapes(canvasId)

  // Handle "all" keyword - arrange all shapes on canvas
  const shouldArrangeAll = elementIds?.includes('all') || elementIds?.length === 1 && elementIds[0] === 'all'

  const shapesToArrange = shouldArrangeAll
    ? allShapes  // Use all shapes
    : allShapes.filter(s => elementIds?.includes(s.id))  // Filter to requested shapes

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

  // Update all shapes in Firestore (batch update)
  console.log('[AI Helpers] Updating shape positions in Firestore')
  for (const shape of arrangedShapes) {
    await updateShape(canvasId, shape.id, {
      x: shape.x,
      y: shape.y,
    })
  }

  console.log('[AI Helpers] Arrangement complete')
}

/**
 * Execute align_elements tool call
 */
export async function executeAlignElements(
  canvasId: string,
  _userId: string,
  input: {
    elementIds: string[]
    alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical'
  }
): Promise<void> {
  console.log('[AI Helpers] executeAlignElements called with:', input)

  const { elementIds, alignment } = input

  // Get all shapes
  const allShapes = await getShapes(canvasId)

  // Handle "all" keyword - align all shapes on canvas
  const shouldAlignAll = elementIds?.includes('all') || elementIds?.length === 1 && elementIds[0] === 'all'

  const shapesToAlign = shouldAlignAll
    ? allShapes  // Use all shapes
    : allShapes.filter(s => elementIds?.includes(s.id))  // Filter to requested shapes

  if (shapesToAlign.length === 0) {
    throw new Error('No matching shapes found to align')
  }

  console.log(`[AI Helpers] Aligning ${shouldAlignAll ? 'ALL' : shapesToAlign.length} shapes`)

  console.log(`[AI Helpers] Found ${shapesToAlign.length} shapes to align to ${alignment}`)

  // Align shapes
  const alignedShapes = alignShapes(shapesToAlign, alignment)

  // Update all shapes in Firestore (batch update)
  console.log('[AI Helpers] Updating shape positions in Firestore')
  for (const alignedShape of alignedShapes) {
    await updateShape(canvasId, alignedShape.id, {
      x: alignedShape.x,
      y: alignedShape.y,
    })
  }

  console.log('[AI Helpers] Alignment complete')
}
