/**
 * Calculate the angle in degrees between a point and a center point
 *
 * @param centerX - X coordinate of the center point
 * @param centerY - Y coordinate of the center point
 * @param pointX - X coordinate of the point
 * @param pointY - Y coordinate of the point
 * @returns Angle in degrees (0-360)
 */
export function calculateAngle(
  centerX: number,
  centerY: number,
  pointX: number,
  pointY: number
): number {
  const deltaX = pointX - centerX
  const deltaY = pointY - centerY

  // atan2 returns radians from -PI to PI
  const radians = Math.atan2(deltaY, deltaX)

  // Convert to degrees
  let degrees = radians * (180 / Math.PI)

  // Normalize to 0-360 range
  if (degrees < 0) {
    degrees += 360
  }

  return degrees
}

/**
 * Calculate the rotation delta when dragging a rotation handle
 *
 * @param shape - The shape being rotated (must have x, y, and current rotation)
 * @param currentMouseX - Current mouse X position
 * @param currentMouseY - Current mouse Y position
 * @param initialRotation - Initial rotation when drag started
 * @returns New rotation angle in degrees (0-360)
 */
export function calculateRotationDelta(
  shape: { x: number; y: number; width?: number; height?: number; radius?: number },
  currentMouseX: number,
  currentMouseY: number
): number {
  // Calculate the center of the shape
  let centerX = shape.x
  let centerY = shape.y

  // For rectangular shapes, center is offset by half width/height
  if ('width' in shape && 'height' in shape && shape.width && shape.height) {
    centerX = shape.x + shape.width / 2
    centerY = shape.y + shape.height / 2
  }
  // For circular shapes, x/y is already the center

  // Calculate angle from center to current mouse position
  const currentAngle = calculateAngle(centerX, centerY, currentMouseX, currentMouseY)

  return normalizeAngle(currentAngle)
}

/**
 * Normalize an angle to 0-360 degree range
 *
 * @param angle - Angle in degrees (can be negative or > 360)
 * @returns Normalized angle (0-360)
 */
export function normalizeAngle(angle: number): number {
  // Handle negative angles
  while (angle < 0) {
    angle += 360
  }

  // Handle angles > 360
  while (angle >= 360) {
    angle -= 360
  }

  return angle
}

/**
 * Snap angle to nearest increment (e.g., 15, 30, 45 degrees)
 *
 * @param angle - Angle in degrees
 * @param snapIncrement - Snap increment in degrees (default: 15)
 * @returns Snapped angle
 */
export function snapAngle(angle: number, snapIncrement: number = 15): number {
  return Math.round(angle / snapIncrement) * snapIncrement
}

/**
 * Get the position for the rotation handle (above the shape)
 *
 * @param shape - The shape to get rotation handle position for
 * @param viewport - Current viewport for scaling
 * @param offset - Distance above shape in pixels (default: 40)
 * @returns Screen coordinates for rotation handle
 */
export function getRotationHandlePosition(
  shape: { x: number; y: number; width?: number; height?: number; radius?: number },
  viewport: { x: number; y: number; zoom: number },
  offset: number = 40
): { x: number; y: number } {
  let centerX = shape.x
  let centerY = shape.y

  // Calculate center and top of shape
  if ('width' in shape && 'height' in shape && shape.width && shape.height) {
    centerX = shape.x + shape.width / 2
    centerY = shape.y - offset / viewport.zoom // Above the top edge
  } else if ('radius' in shape && shape.radius) {
    centerY = shape.y - shape.radius - offset / viewport.zoom // Above the circle
  }

  // Convert to screen coordinates
  return {
    x: centerX * viewport.zoom + viewport.x,
    y: centerY * viewport.zoom + viewport.y,
  }
}

/**
 * Format rotation angle for display
 *
 * @param angle - Angle in degrees
 * @returns Formatted string (e.g., "45°")
 */
export function formatAngle(angle: number): string {
  return `${Math.round(angle)}°`
}

/**
 * Rotate a point around a center point
 *
 * @param pointX - X coordinate of point to rotate
 * @param pointY - Y coordinate of point to rotate
 * @param centerX - X coordinate of rotation center
 * @param centerY - Y coordinate of rotation center
 * @param angleDegrees - Rotation angle in degrees
 * @returns Rotated point coordinates
 */
export function rotatePoint(
  pointX: number,
  pointY: number,
  centerX: number,
  centerY: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRadians = (angleDegrees * Math.PI) / 180

  // Translate point to origin
  const translatedX = pointX - centerX
  const translatedY = pointY - centerY

  // Rotate
  const rotatedX = translatedX * Math.cos(angleRadians) - translatedY * Math.sin(angleRadians)
  const rotatedY = translatedX * Math.sin(angleRadians) + translatedY * Math.cos(angleRadians)

  // Translate back
  return {
    x: rotatedX + centerX,
    y: rotatedY + centerY,
  }
}
