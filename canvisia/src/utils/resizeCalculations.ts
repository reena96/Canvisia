/**
 * Handle positions for resize interactions
 */
export type ResizeHandle =
  | 'nw' | 'n' | 'ne'
  | 'w' | 'e'
  | 'sw' | 's' | 'se'

/**
 * Result of a resize calculation
 */
export interface ResizeResult {
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  radiusX?: number
  radiusY?: number
}

/**
 * Calculate new dimensions when resizing a rectangular shape
 * Rectangles are now centered at (x, y) with offsetX/offsetY = width/2, height/2
 *
 * @param shape - The shape being resized (x, y is center position)
 * @param handle - Which resize handle is being dragged
 * @param deltaX - Change in X position (in shape's local coordinate system)
 * @param deltaY - Change in Y position (in shape's local coordinate system)
 * @param maintainAspectRatio - Whether to lock aspect ratio (shift key)
 * @returns New center position and dimensions
 */
export function calculateRectangleResize(
  shape: { x: number; y: number; width: number; height: number },
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  maintainAspectRatio: boolean = false
): ResizeResult {
  const aspectRatio = shape.width / shape.height
  let newWidth = shape.width
  let newHeight = shape.height
  let centerOffsetX = 0
  let centerOffsetY = 0

  switch (handle) {
    case 'nw': // Northwest - resize from top-left
      if (maintainAspectRatio) {
        const avgDelta = (deltaX + deltaY) / 2
        newWidth = shape.width - avgDelta * 2
        newHeight = newWidth / aspectRatio
        centerOffsetX = avgDelta
        centerOffsetY = avgDelta
      } else {
        newWidth = shape.width - deltaX * 2
        newHeight = shape.height - deltaY * 2
        centerOffsetX = deltaX
        centerOffsetY = deltaY
      }
      break

    case 'n': // North - resize from top
      newHeight = shape.height - deltaY * 2
      centerOffsetY = deltaY
      if (maintainAspectRatio) {
        newWidth = newHeight * aspectRatio
      }
      break

    case 'ne': // Northeast - resize from top-right
      if (maintainAspectRatio) {
        const avgDelta = (deltaX - deltaY) / 2
        newWidth = shape.width + avgDelta * 2
        newHeight = newWidth / aspectRatio
        centerOffsetX = avgDelta
        centerOffsetY = -avgDelta
      } else {
        newWidth = shape.width + deltaX * 2
        newHeight = shape.height - deltaY * 2
        centerOffsetX = deltaX
        centerOffsetY = deltaY
      }
      break

    case 'w': // West - resize from left
      newWidth = shape.width - deltaX * 2
      centerOffsetX = deltaX
      if (maintainAspectRatio) {
        newHeight = newWidth / aspectRatio
      }
      break

    case 'e': // East - resize from right
      newWidth = shape.width + deltaX * 2
      centerOffsetX = deltaX
      if (maintainAspectRatio) {
        newHeight = newWidth / aspectRatio
      }
      break

    case 'sw': // Southwest - resize from bottom-left
      if (maintainAspectRatio) {
        const avgDelta = (deltaX - deltaY) / 2
        newWidth = shape.width - avgDelta * 2
        newHeight = newWidth / aspectRatio
        centerOffsetX = avgDelta
        centerOffsetY = -avgDelta
      } else {
        newWidth = shape.width - deltaX * 2
        newHeight = shape.height + deltaY * 2
        centerOffsetX = deltaX
        centerOffsetY = deltaY
      }
      break

    case 's': // South - resize from bottom
      newHeight = shape.height + deltaY * 2
      centerOffsetY = deltaY
      if (maintainAspectRatio) {
        newWidth = newHeight * aspectRatio
      }
      break

    case 'se': // Southeast - resize from bottom-right
      if (maintainAspectRatio) {
        const avgDelta = (deltaX + deltaY) / 2
        newWidth = shape.width + avgDelta * 2
        newHeight = newWidth / aspectRatio
        centerOffsetX = avgDelta
        centerOffsetY = avgDelta
      } else {
        newWidth = shape.width + deltaX * 2
        newHeight = shape.height + deltaY * 2
        centerOffsetX = deltaX
        centerOffsetY = deltaY
      }
      break
  }

  // Prevent negative dimensions
  const MIN_SIZE = 10
  if (newWidth < MIN_SIZE) {
    newWidth = MIN_SIZE
  }
  if (newHeight < MIN_SIZE) {
    newHeight = MIN_SIZE
  }

  return {
    x: shape.x + centerOffsetX,
    y: shape.y + centerOffsetY,
    width: newWidth,
    height: newHeight
  }
}

/**
 * Calculate new radius when resizing a circular shape
 *
 * @param shape - The shape being resized
 * @param handle - Which resize handle is being dragged
 * @param deltaX - Change in X position
 * @param deltaY - Change in Y position
 * @returns New radius
 */
export function calculateCircleResize(
  shape: { x: number; y: number; radius: number },
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number
): ResizeResult {
  // For circles, determine the actual distance change based on handle and direction
  let radiusChange = 0

  // East/West handles: use deltaX
  if (handle.includes('e')) {
    radiusChange = deltaX // Dragging right increases radius
  } else if (handle.includes('w')) {
    radiusChange = -deltaX // Dragging left (negative deltaX) increases radius
  }
  // North/South handles: use deltaY
  else if (handle.includes('s')) {
    radiusChange = deltaY // Dragging down increases radius
  } else if (handle.includes('n')) {
    radiusChange = -deltaY // Dragging up (negative deltaY) increases radius
  }

  // For corner handles, use the average of both directions
  if ((handle.includes('e') || handle.includes('w')) && (handle.includes('n') || handle.includes('s'))) {
    const xChange = handle.includes('e') ? deltaX : -deltaX
    const yChange = handle.includes('s') ? deltaY : -deltaY
    radiusChange = (xChange + yChange) / 2
  }

  let newRadius = shape.radius + radiusChange

  // Prevent negative radius
  const MIN_RADIUS = 5
  if (newRadius < MIN_RADIUS) {
    newRadius = MIN_RADIUS
  }

  return { x: shape.x, y: shape.y, radius: newRadius }
}

/**
 * Calculate new radii when resizing an ellipse
 *
 * @param shape - The shape being resized
 * @param handle - Which resize handle is being dragged
 * @param deltaX - Change in X position
 * @param deltaY - Change in Y position
 * @param maintainAspectRatio - Whether to lock aspect ratio
 * @returns New radii
 */
export function calculateEllipseResize(
  shape: { x: number; y: number; radiusX: number; radiusY: number },
  handle: ResizeHandle,
  deltaX: number,
  deltaY: number,
  maintainAspectRatio: boolean = false
): ResizeResult {
  const aspectRatio = shape.radiusX / shape.radiusY
  let newRadiusX = shape.radiusX
  let newRadiusY = shape.radiusY

  if (maintainAspectRatio) {
    // For corner handles or shift key, maintain aspect ratio
    let radiusChange = 0

    if (handle.includes('e')) {
      radiusChange = deltaX
    } else if (handle.includes('w')) {
      radiusChange = -deltaX
    } else if (handle.includes('s')) {
      radiusChange = deltaY
    } else if (handle.includes('n')) {
      radiusChange = -deltaY
    }

    // For corner handles, use average
    if (handle.length === 2) {
      const xChange = handle.includes('e') ? deltaX : -deltaX
      const yChange = handle.includes('s') ? deltaY : -deltaY
      radiusChange = (xChange + yChange) / 2
    }

    newRadiusX = shape.radiusX + radiusChange
    newRadiusY = newRadiusX / aspectRatio
  } else {
    // Free resize - edges can change shape
    // Horizontal handles affect radiusX
    if (handle.includes('e')) {
      newRadiusX = shape.radiusX + deltaX
    } else if (handle.includes('w')) {
      newRadiusX = shape.radiusX - deltaX
    }

    // Vertical handles affect radiusY
    if (handle.includes('s')) {
      newRadiusY = shape.radiusY + deltaY
    } else if (handle.includes('n')) {
      newRadiusY = shape.radiusY - deltaY
    }
  }

  // Prevent negative radii
  const MIN_RADIUS = 5
  if (newRadiusX < MIN_RADIUS) newRadiusX = MIN_RADIUS
  if (newRadiusY < MIN_RADIUS) newRadiusY = MIN_RADIUS

  return { x: shape.x, y: shape.y, radiusX: newRadiusX, radiusY: newRadiusY }
}

/**
 * Get the positions of all 8 resize handles for a rectangular shape
 *
 * @param shape - The shape to get handle positions for
 * @param viewport - Current viewport for scaling
 * @returns Map of handle positions in screen coordinates
 */
export function getResizeHandlePositions(
  shape: { x: number; y: number; width: number; height: number },
  viewport: { x: number; y: number; zoom: number }
): Record<ResizeHandle, { x: number; y: number }> {
  const { x, y, width, height } = shape
  const { x: vx, y: vy, zoom } = viewport

  // Convert canvas coordinates to screen coordinates
  const toScreen = (cx: number, cy: number) => ({
    x: cx * zoom + vx,
    y: cy * zoom + vy,
  })

  return {
    nw: toScreen(x, y),
    n: toScreen(x + width / 2, y),
    ne: toScreen(x + width, y),
    w: toScreen(x, y + height / 2),
    e: toScreen(x + width, y + height / 2),
    sw: toScreen(x, y + height),
    s: toScreen(x + width / 2, y + height),
    se: toScreen(x + width, y + height),
  }
}

/**
 * Get the positions of all 8 resize handles for a circular shape
 *
 * @param shape - The shape to get handle positions for
 * @param viewport - Current viewport for scaling
 * @returns Map of handle positions in screen coordinates
 */
export function getCircleResizeHandlePositions(
  shape: { x: number; y: number; radius: number },
  viewport: { x: number; y: number; zoom: number }
): Record<ResizeHandle, { x: number; y: number }> {
  const { x, y, radius } = shape
  const { x: vx, y: vy, zoom } = viewport

  // Convert canvas coordinates to screen coordinates
  const toScreen = (cx: number, cy: number) => ({
    x: cx * zoom + vx,
    y: cy * zoom + vy,
  })

  return {
    nw: toScreen(x - radius, y - radius),
    n: toScreen(x, y - radius),
    ne: toScreen(x + radius, y - radius),
    w: toScreen(x - radius, y),
    e: toScreen(x + radius, y),
    sw: toScreen(x - radius, y + radius),
    s: toScreen(x, y + radius),
    se: toScreen(x + radius, y + radius),
  }
}
