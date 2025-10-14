import { describe, it, expect } from 'vitest'
import { screenToCanvas, canvasToScreen, clampZoom } from '@/utils/canvasUtils'
import type { Viewport } from '@/types/canvas'

describe('Canvas Utilities', () => {
  describe('screenToCanvas', () => {
    it('should convert screen coordinates to canvas coordinates with no transform', () => {
      const viewport: Viewport = { x: 0, y: 0, zoom: 1 }
      const result = screenToCanvas(100, 200, viewport)
      expect(result).toEqual({ x: 100, y: 200 })
    })

    it('should handle viewport offset', () => {
      const viewport: Viewport = { x: 50, y: 100, zoom: 1 }
      const result = screenToCanvas(100, 200, viewport)
      expect(result).toEqual({ x: 50, y: 100 })
    })

    it('should handle zoom scale', () => {
      const viewport: Viewport = { x: 0, y: 0, zoom: 2 }
      const result = screenToCanvas(100, 200, viewport)
      expect(result).toEqual({ x: 50, y: 100 })
    })

    it('should handle combined offset and zoom', () => {
      const viewport: Viewport = { x: 100, y: 50, zoom: 2 }
      const result = screenToCanvas(200, 300, viewport)
      expect(result).toEqual({ x: 50, y: 125 })
    })
  })

  describe('canvasToScreen', () => {
    it('should convert canvas coordinates to screen coordinates with no transform', () => {
      const viewport: Viewport = { x: 0, y: 0, zoom: 1 }
      const result = canvasToScreen(100, 200, viewport)
      expect(result).toEqual({ x: 100, y: 200 })
    })

    it('should handle viewport offset', () => {
      const viewport: Viewport = { x: 50, y: 100, zoom: 1 }
      const result = canvasToScreen(100, 200, viewport)
      expect(result).toEqual({ x: 150, y: 300 })
    })

    it('should handle zoom scale', () => {
      const viewport: Viewport = { x: 0, y: 0, zoom: 2 }
      const result = canvasToScreen(100, 200, viewport)
      expect(result).toEqual({ x: 200, y: 400 })
    })

    it('should handle combined offset and zoom', () => {
      const viewport: Viewport = { x: 100, y: 50, zoom: 2 }
      const result = canvasToScreen(50, 125, viewport)
      expect(result).toEqual({ x: 200, y: 300 })
    })
  })

  describe('clampZoom', () => {
    it('should clamp zoom to minimum value', () => {
      expect(clampZoom(0.05)).toBe(0.1)
      expect(clampZoom(0)).toBe(0.1)
      expect(clampZoom(-1)).toBe(0.1)
    })

    it('should clamp zoom to maximum value', () => {
      expect(clampZoom(10)).toBe(5)
      expect(clampZoom(100)).toBe(5)
    })

    it('should not clamp valid zoom values', () => {
      expect(clampZoom(0.1)).toBe(0.1)
      expect(clampZoom(1)).toBe(1)
      expect(clampZoom(2.5)).toBe(2.5)
      expect(clampZoom(5)).toBe(5)
    })
  })
})
