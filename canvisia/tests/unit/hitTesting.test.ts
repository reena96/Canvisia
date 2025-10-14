import { describe, it, expect } from 'vitest'
import { isPointInRectangle } from '@/utils/hitTesting'

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
})
