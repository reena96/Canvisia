import { describe, it, expect } from 'vitest'
import { createDefaultRectangle } from '@/utils/shapeDefaults'

describe('Shape Defaults', () => {
  describe('createDefaultRectangle', () => {
    it('should create rectangle with correct position', () => {
      const rect = createDefaultRectangle(100, 200)
      expect(rect.x).toBe(100)
      expect(rect.y).toBe(200)
    })

    it('should create rectangle with default size', () => {
      const rect = createDefaultRectangle(0, 0)
      expect(rect.width).toBe(100)
      expect(rect.height).toBe(100)
    })

    it('should create rectangle with default color', () => {
      const rect = createDefaultRectangle(0, 0)
      expect(rect.fill).toBe('#3B82F6') // Blue
    })

    it('should generate unique IDs', () => {
      const rect1 = createDefaultRectangle(0, 0)
      const rect2 = createDefaultRectangle(0, 0)
      expect(rect1.id).not.toBe(rect2.id)
    })

    it('should set type to rectangle', () => {
      const rect = createDefaultRectangle(0, 0)
      expect(rect.type).toBe('rectangle')
    })

    it('should set createdBy and updatedAt fields', () => {
      const rect = createDefaultRectangle(0, 0)
      expect(rect.createdBy).toBeDefined()
      expect(rect.updatedAt).toBeDefined()
    })
  })
})
