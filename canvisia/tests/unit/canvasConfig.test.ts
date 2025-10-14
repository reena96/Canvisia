import { describe, it, expect } from 'vitest'
import { CANVAS_CONFIG, SHAPE_DEFAULTS } from '@/config/canvas.config'

describe('Canvas Config', () => {
  describe('Canvas dimensions', () => {
    it('should have correct canvas dimensions', () => {
      expect(CANVAS_CONFIG.WIDTH).toBe(5000)
      expect(CANVAS_CONFIG.HEIGHT).toBe(5000)
    })
  })

  describe('Zoom configuration', () => {
    it('should have valid zoom limits', () => {
      expect(CANVAS_CONFIG.MIN_ZOOM).toBe(0.1)
      expect(CANVAS_CONFIG.MAX_ZOOM).toBe(5.0)
      expect(CANVAS_CONFIG.MIN_ZOOM).toBeLessThan(CANVAS_CONFIG.MAX_ZOOM)
    })

    it('should have default zoom within limits', () => {
      expect(CANVAS_CONFIG.DEFAULT_ZOOM).toBeGreaterThanOrEqual(CANVAS_CONFIG.MIN_ZOOM)
      expect(CANVAS_CONFIG.DEFAULT_ZOOM).toBeLessThanOrEqual(CANVAS_CONFIG.MAX_ZOOM)
    })

    it('should have valid zoom controls', () => {
      expect(CANVAS_CONFIG.ZOOM_STEP).toBeGreaterThan(0)
      expect(CANVAS_CONFIG.ZOOM_SENSITIVITY).toBeGreaterThan(0)
    })
  })

  describe('Performance settings', () => {
    it('should have valid throttle values', () => {
      expect(CANVAS_CONFIG.CURSOR_THROTTLE_MS).toBeGreaterThan(0)
      expect(CANVAS_CONFIG.POSITION_THROTTLE_MS).toBeGreaterThan(0)
    })
  })

  describe('Shape defaults', () => {
    it('should have rectangle defaults', () => {
      expect(SHAPE_DEFAULTS.rectangle.width).toBe(100)
      expect(SHAPE_DEFAULTS.rectangle.height).toBe(100)
      expect(SHAPE_DEFAULTS.rectangle.fill).toBeDefined()
      expect(SHAPE_DEFAULTS.rectangle.stroke).toBeDefined()
    })

    it('should have circle defaults', () => {
      expect(SHAPE_DEFAULTS.circle.radius).toBe(50)
      expect(SHAPE_DEFAULTS.circle.fill).toBeDefined()
      expect(SHAPE_DEFAULTS.circle.stroke).toBeDefined()
    })

    it('should have line defaults', () => {
      expect(SHAPE_DEFAULTS.line.length).toBeGreaterThan(0)
      expect(SHAPE_DEFAULTS.line.stroke).toBeDefined()
      expect(SHAPE_DEFAULTS.line.strokeWidth).toBeGreaterThan(0)
    })

    it('should have text defaults', () => {
      expect(SHAPE_DEFAULTS.text.text).toBeDefined()
      expect(SHAPE_DEFAULTS.text.fontSize).toBeGreaterThan(0)
      expect(SHAPE_DEFAULTS.text.fontFamily).toBeDefined()
    })
  })
})
