import { describe, it, expect } from 'vitest'
import {
  createDefaultRectangle,
  createDefaultCircle,
  createDefaultLine,
  createDefaultText,
} from '@/utils/shapeDefaults'

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

  describe('createDefaultCircle', () => {
    it('should create circle with correct position', () => {
      const circle = createDefaultCircle(100, 200)
      expect(circle.x).toBe(100)
      expect(circle.y).toBe(200)
    })

    it('should create circle with correct radius', () => {
      const circle = createDefaultCircle(0, 0)
      expect(circle.radius).toBe(50)
    })

    it('should create circle with red color', () => {
      const circle = createDefaultCircle(0, 0)
      expect(circle.fill).toBe('#EF4444') // Red
    })

    it('should generate unique IDs', () => {
      const circle1 = createDefaultCircle(0, 0)
      const circle2 = createDefaultCircle(0, 0)
      expect(circle1.id).not.toBe(circle2.id)
    })

    it('should set type to circle', () => {
      const circle = createDefaultCircle(0, 0)
      expect(circle.type).toBe('circle')
    })

    it('should set createdBy and updatedAt fields', () => {
      const circle = createDefaultCircle(0, 0)
      expect(circle.createdBy).toBeDefined()
      expect(circle.updatedAt).toBeDefined()
    })
  })

  describe('createDefaultLine', () => {
    it('should create line with correct start position', () => {
      const line = createDefaultLine(100, 200)
      expect(line.x).toBe(100)
      expect(line.y).toBe(200)
    })

    it('should create horizontal line with 150px length', () => {
      const line = createDefaultLine(0, 0)
      expect(line.x2).toBe(150)
      expect(line.y2).toBe(0)
    })

    it('should create line with black stroke', () => {
      const line = createDefaultLine(0, 0)
      expect(line.stroke).toBe('#000000') // Black
    })

    it('should create line with default stroke width', () => {
      const line = createDefaultLine(0, 0)
      expect(line.strokeWidth).toBe(2)
    })

    it('should generate unique IDs', () => {
      const line1 = createDefaultLine(0, 0)
      const line2 = createDefaultLine(0, 0)
      expect(line1.id).not.toBe(line2.id)
    })

    it('should set type to line', () => {
      const line = createDefaultLine(0, 0)
      expect(line.type).toBe('line')
    })

    it('should set createdBy and updatedAt fields', () => {
      const line = createDefaultLine(0, 0)
      expect(line.createdBy).toBeDefined()
      expect(line.updatedAt).toBeDefined()
    })
  })

  describe('createDefaultText', () => {
    it('should create text with correct position', () => {
      const text = createDefaultText(100, 200)
      expect(text.x).toBe(100)
      expect(text.y).toBe(200)
    })

    it('should create text with default content', () => {
      const text = createDefaultText(0, 0)
      expect(text.text).toBe('Double-click to edit')
    })

    it('should create text with default font size', () => {
      const text = createDefaultText(0, 0)
      expect(text.fontSize).toBe(16)
    })

    it('should create text with black color', () => {
      const text = createDefaultText(0, 0)
      expect(text.fill).toBe('#000000') // Black
    })

    it('should generate unique IDs', () => {
      const text1 = createDefaultText(0, 0)
      const text2 = createDefaultText(0, 0)
      expect(text1.id).not.toBe(text2.id)
    })

    it('should set type to text', () => {
      const text = createDefaultText(0, 0)
      expect(text.type).toBe('text')
    })

    it('should set createdBy and updatedAt fields', () => {
      const text = createDefaultText(0, 0)
      expect(text.createdBy).toBeDefined()
      expect(text.updatedAt).toBeDefined()
    })
  })
})
