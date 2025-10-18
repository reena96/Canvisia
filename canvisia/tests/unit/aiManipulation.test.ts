import { describe, it, expect, beforeEach, vi } from 'vitest'
import { findShape, calculateSmartPosition } from '@/utils/aiHelpers'
import type { Shape, Rectangle, Circle, Text } from '@/types/shapes'

describe('Shape Identification', () => {
  let shapes: Shape[]

  beforeEach(() => {
    // Create test shapes
    shapes = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        fill: '#3B82F6', // blue
        stroke: '#1F2937',
        strokeWidth: 2,
        rotation: 0,
        createdBy: 'user1',
        updatedAt: '2025-01-01T00:00:00.000Z',
      } as Rectangle,
      {
        id: 'rect2',
        type: 'rectangle',
        x: 300,
        y: 300,
        width: 150,
        height: 150,
        fill: '#EF4444', // red
        stroke: '#1F2937',
        strokeWidth: 2,
        rotation: 0,
        createdBy: 'user1',
        updatedAt: '2025-01-01T00:01:00.000Z',
      } as Rectangle,
      {
        id: 'circle1',
        type: 'circle',
        x: 500,
        y: 500,
        radius: 50,
        fill: '#3B82F6', // blue
        stroke: '#1F2937',
        strokeWidth: 2,
        rotation: 0,
        createdBy: 'user1',
        updatedAt: '2025-01-01T00:02:00.000Z',
      } as Circle,
      {
        id: 'text1',
        type: 'text',
        text: 'Hello',
        x: 700,
        y: 700,
        width: 200,
        height: 20,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 400,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.2,
        rotation: 0,
        createdBy: 'user1',
        updatedAt: '2025-01-01T00:03:00.000Z',
      } as Text,
    ]
  })

  describe('findShape by ID', () => {
    it('should find shape by exact ID', () => {
      const result = findShape(shapes, { id: 'circle1' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('circle1')
      expect(result?.type).toBe('circle')
    })

    it('should return undefined for non-existent ID', () => {
      const result = findShape(shapes, { id: 'nonexistent' })
      expect(result).toBeUndefined()
    })
  })

  describe('findShape by type', () => {
    it('should find most recent shape by type', () => {
      const result = findShape(shapes, { type: 'rectangle' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('rect2') // Most recent rectangle
      expect(result?.type).toBe('rectangle')
    })

    it('should find circle by type', () => {
      const result = findShape(shapes, { type: 'circle' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('circle1')
    })

    it('should find text by type', () => {
      const result = findShape(shapes, { type: 'text' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('text1')
    })

    it('should return undefined for non-existent type', () => {
      const result = findShape(shapes, { type: 'triangle' })
      expect(result).toBeUndefined()
    })
  })

  describe('findShape by color', () => {
    it('should find most recent shape by color name', () => {
      const result = findShape(shapes, { color: 'blue' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('circle1') // Most recent blue shape
    })

    it('should find shape by red color', () => {
      const result = findShape(shapes, { color: 'red' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('rect2')
    })

    it('should find shape by hex color', () => {
      const result = findShape(shapes, { color: '#3B82F6' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('circle1') // Most recent with this hex
    })

    it('should be case-insensitive for hex colors', () => {
      const result = findShape(shapes, { color: '#3b82f6' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('circle1')
    })

    it('should return undefined for non-existent color', () => {
      const result = findShape(shapes, { color: 'purple' })
      expect(result).toBeUndefined()
    })
  })

  describe('findShape by color + type', () => {
    it('should find shape matching both color and type', () => {
      const result = findShape(shapes, { color: 'blue', type: 'rectangle' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('rect1')
      expect(result?.type).toBe('rectangle')
    })

    it('should find most recent when multiple matches exist', () => {
      // Both rect1 and circle1 are blue
      const result = findShape(shapes, { color: 'blue', type: 'circle' })
      expect(result).toBeDefined()
      expect(result?.id).toBe('circle1')
    })

    it('should return undefined when color matches but type does not', () => {
      const result = findShape(shapes, { color: 'blue', type: 'text' })
      expect(result).toBeUndefined()
    })

    it('should return undefined when type matches but color does not', () => {
      const result = findShape(shapes, { color: 'green', type: 'rectangle' })
      expect(result).toBeUndefined()
    })
  })

  describe('findShape priority', () => {
    it('should prioritize ID over other descriptors', () => {
      // Even though we specify type and color, ID should win
      const result = findShape(shapes, {
        id: 'rect1',
        type: 'circle', // Wrong type
        color: 'red', // Wrong color
      })
      expect(result).toBeDefined()
      expect(result?.id).toBe('rect1')
      expect(result?.type).toBe('rectangle') // Correct type despite descriptor
    })

    it('should use color+type if no ID specified', () => {
      const result = findShape(shapes, {
        color: 'blue',
        type: 'rectangle',
      })
      expect(result?.id).toBe('rect1')
    })

    it('should use type if only type specified', () => {
      const result = findShape(shapes, { type: 'text' })
      expect(result?.id).toBe('text1')
    })

    it('should use color if only color specified', () => {
      const result = findShape(shapes, { color: 'red' })
      expect(result?.id).toBe('rect2')
    })
  })

  describe('findShape with empty shapes array', () => {
    it('should return undefined when shapes array is empty', () => {
      const result = findShape([], { type: 'rectangle' })
      expect(result).toBeUndefined()
    })
  })
})

describe('Smart Positioning', () => {
  const defaultCanvasSize = { width: 2000, height: 2000 }
  const margin = 200

  describe('calculateSmartPosition with default canvas size', () => {
    it('should position at center', () => {
      const pos = calculateSmartPosition('center')
      expect(pos).toEqual({ x: 1000, y: 1000 })
    })

    it('should position at top left', () => {
      const pos = calculateSmartPosition('top left')
      expect(pos).toEqual({ x: margin, y: margin })
    })

    it('should position at top center', () => {
      const pos = calculateSmartPosition('top')
      expect(pos).toEqual({ x: 1000, y: margin })
    })

    it('should position at top right', () => {
      const pos = calculateSmartPosition('top right')
      expect(pos).toEqual({ x: 1800, y: margin })
    })

    it('should position at left center', () => {
      const pos = calculateSmartPosition('left')
      expect(pos).toEqual({ x: margin, y: 1000 })
    })

    it('should position at right center', () => {
      const pos = calculateSmartPosition('right')
      expect(pos).toEqual({ x: 1800, y: 1000 })
    })

    it('should position at bottom left', () => {
      const pos = calculateSmartPosition('bottom left')
      expect(pos).toEqual({ x: margin, y: 1800 })
    })

    it('should position at bottom center', () => {
      const pos = calculateSmartPosition('bottom')
      expect(pos).toEqual({ x: 1000, y: 1800 })
    })

    it('should position at bottom right', () => {
      const pos = calculateSmartPosition('bottom right')
      expect(pos).toEqual({ x: 1800, y: 1800 })
    })
  })

  describe('calculateSmartPosition with custom canvas size', () => {
    const customSize = { width: 1000, height: 1000 }

    it('should position at center with custom size', () => {
      const pos = calculateSmartPosition('center', customSize)
      expect(pos).toEqual({ x: 500, y: 500 })
    })

    it('should position at top left with custom size', () => {
      const pos = calculateSmartPosition('top left', customSize)
      expect(pos).toEqual({ x: margin, y: margin })
    })

    it('should position at bottom right with custom size', () => {
      const pos = calculateSmartPosition('bottom right', customSize)
      expect(pos).toEqual({ x: 800, y: 800 })
    })
  })

  describe('calculateSmartPosition case insensitivity', () => {
    it('should handle uppercase', () => {
      const pos = calculateSmartPosition('CENTER')
      expect(pos).toEqual({ x: 1000, y: 1000 })
    })

    it('should handle mixed case', () => {
      const pos = calculateSmartPosition('Top Left')
      expect(pos).toEqual({ x: margin, y: margin })
    })

    it('should handle lowercase', () => {
      const pos = calculateSmartPosition('bottom right')
      expect(pos).toEqual({ x: 1800, y: 1800 })
    })
  })

  describe('calculateSmartPosition aliases', () => {
    it('should handle "top center" alias', () => {
      const pos1 = calculateSmartPosition('top')
      const pos2 = calculateSmartPosition('top center')
      expect(pos1).toEqual(pos2)
    })

    it('should handle "center left" alias', () => {
      const pos1 = calculateSmartPosition('left')
      const pos2 = calculateSmartPosition('center left')
      expect(pos1).toEqual(pos2)
    })

    it('should handle "center right" alias', () => {
      const pos1 = calculateSmartPosition('right')
      const pos2 = calculateSmartPosition('center right')
      expect(pos1).toEqual(pos2)
    })

    it('should handle "bottom center" alias', () => {
      const pos1 = calculateSmartPosition('bottom')
      const pos2 = calculateSmartPosition('bottom center')
      expect(pos1).toEqual(pos2)
    })
  })

  describe('calculateSmartPosition with unknown position', () => {
    it('should default to center for unknown position', () => {
      const pos = calculateSmartPosition('unknown position')
      expect(pos).toEqual({ x: 1000, y: 1000 })
    })

    it('should default to center for empty string', () => {
      const pos = calculateSmartPosition('')
      expect(pos).toEqual({ x: 1000, y: 1000 })
    })
  })
})
