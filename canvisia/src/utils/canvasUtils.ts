import type { Viewport } from '@/types/canvas'
import { CANVAS_CONFIG } from '@/config/canvas.config'

/**
 * Convert screen coordinates to canvas coordinates
 * Takes into account viewport offset and zoom level
 *
 * @param screenX - Screen X coordinate
 * @param screenY - Screen Y coordinate
 * @param viewport - Current viewport state
 * @returns Canvas coordinates
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  }
}

/**
 * Convert canvas coordinates to screen coordinates
 * Takes into account viewport offset and zoom level
 *
 * @param canvasX - Canvas X coordinate
 * @param canvasY - Canvas Y coordinate
 * @param viewport - Current viewport state
 * @returns Screen coordinates
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: canvasX * viewport.zoom + viewport.x,
    y: canvasY * viewport.zoom + viewport.y,
  }
}

/**
 * Clamp zoom value to min/max bounds
 *
 * @param zoom - Zoom value to clamp
 * @returns Clamped zoom value
 */
export function clampZoom(zoom: number): number {
  return Math.max(CANVAS_CONFIG.MIN_ZOOM, Math.min(CANVAS_CONFIG.MAX_ZOOM, zoom))
}

/**
 * Calculate new zoom level centered on a point
 *
 * @param currentZoom - Current zoom level
 * @param zoomDelta - Change in zoom (positive = zoom in, negative = zoom out)
 * @param pointerX - Screen X coordinate of zoom center
 * @param pointerY - Screen Y coordinate of zoom center
 * @param viewport - Current viewport state
 * @returns New viewport with updated zoom and position
 */
export function calculateZoom(
  currentZoom: number,
  zoomDelta: number,
  pointerX: number,
  pointerY: number,
  viewport: Viewport
): Viewport {
  // Calculate new zoom level
  const newZoom = clampZoom(currentZoom * (1 + zoomDelta))

  // Don't update if zoom didn't change (hit limits)
  if (newZoom === currentZoom) {
    return viewport
  }

  // Get pointer position in canvas coordinates (before zoom)
  const canvasPoint = screenToCanvas(pointerX, pointerY, viewport)

  // Calculate new viewport position to keep pointer at same canvas point
  const newViewport: Viewport = {
    x: pointerX - canvasPoint.x * newZoom,
    y: pointerY - canvasPoint.y * newZoom,
    zoom: newZoom,
  }

  return newViewport
}
