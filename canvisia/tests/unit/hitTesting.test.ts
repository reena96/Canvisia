import { describe, it, expect } from 'vitest'
import { isPointInRectangle, isPointInCircle, isPointNearLine } from '@/utils/hitTesting'

describe('Hit Testing', () => {
  describe('isPointInRectangle', () => {
    it('should return true when point is inside rectangle', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 }
      expect(isPointInRectangle(50, 50, rect)).toBe(true)
    })

    it('should return false when point is outside rectangle', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 }
      expect(isPointInRectangle(150, 150, rect)).toBe(false)
    })

    it('should handle edge cases', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 }
      expect(isPointInRectangle(0, 0, rect)).toBe(true)
      expect(isPointInRectangle(100, 100, rect)).toBe(true)
      expect(isPointInRectangle(101, 101, rect)).toBe(false)
    })

    it('should handle rectangles at non-zero positions', () => {
      const rect = { x: 50, y: 50, width: 100, height: 100 }
      expect(isPointInRectangle(75, 75, rect)).toBe(true)
      expect(isPointInRectangle(150, 150, rect)).toBe(true)
      expect(isPointInRectangle(25, 25, rect)).toBe(false)
      expect(isPointInRectangle(151, 151, rect)).toBe(false)
    })

    it('should handle negative coordinates', () => {
      const rect = { x: -100, y: -100, width: 50, height: 50 }
      expect(isPointInRectangle(-75, -75, rect)).toBe(true)
      expect(isPointInRectangle(-101, -101, rect)).toBe(false)
    })
  })

  describe('isPointInCircle', () => {
    it('should return true when point is inside circle', () => {
      const circle = { x: 100, y: 100, radius: 50 }
      expect(isPointInCircle(110, 110, circle)).toBe(true)
    })

    it('should return false when point is outside circle', () => {
      const circle = { x: 100, y: 100, radius: 50 }
      expect(isPointInCircle(200, 200, circle)).toBe(false)
    })

    it('should return true when point is at center', () => {
      const circle = { x: 100, y: 100, radius: 50 }
      expect(isPointInCircle(100, 100, circle)).toBe(true)
    })

    it('should handle edge case - point on circle boundary', () => {
      const circle = { x: 100, y: 100, radius: 50 }
      // Point exactly on boundary (distance = radius)
      expect(isPointInCircle(150, 100, circle)).toBe(true)
    })

    it('should handle circles at origin', () => {
      const circle = { x: 0, y: 0, radius: 25 }
      expect(isPointInCircle(10, 10, circle)).toBe(true)
      expect(isPointInCircle(50, 50, circle)).toBe(false)
    })

    it('should handle negative coordinates', () => {
      const circle = { x: -100, y: -100, radius: 30 }
      expect(isPointInCircle(-90, -90, circle)).toBe(true)
      expect(isPointInCircle(-50, -50, circle)).toBe(false)
    })
  })

  describe('isPointNearLine', () => {
    it('should return true when point is near horizontal line', () => {
      const line = { x: 0, y: 0, x2: 100, y2: 0 }
      expect(isPointNearLine(50, 5, line, 10)).toBe(true)
    })

    it('should return false when point is far from horizontal line', () => {
      const line = { x: 0, y: 0, x2: 100, y2: 0 }
      expect(isPointNearLine(50, 50, line, 10)).toBe(false)
    })

    it('should return true when point is near vertical line', () => {
      const line = { x: 0, y: 0, x2: 0, y2: 100 }
      expect(isPointNearLine(5, 50, line, 10)).toBe(true)
    })

    it('should return false when point is far from vertical line', () => {
      const line = { x: 0, y: 0, x2: 0, y2: 100 }
      expect(isPointNearLine(50, 50, line, 10)).toBe(false)
    })

    it('should return true when point is near diagonal line', () => {
      const line = { x: 0, y: 0, x2: 100, y2: 100 }
      expect(isPointNearLine(50, 50, line, 10)).toBe(true)
    })

    it('should handle different threshold values', () => {
      const line = { x: 0, y: 0, x2: 100, y2: 0 }
      expect(isPointNearLine(50, 8, line, 10)).toBe(true)
      expect(isPointNearLine(50, 8, line, 5)).toBe(false)
    })

    it('should return false for point beyond line segment endpoints', () => {
      const line = { x: 0, y: 0, x2: 100, y2: 0 }
      // Point beyond x2 but within threshold of extended line
      expect(isPointNearLine(150, 0, line, 10)).toBe(false)
    })
  })
})
