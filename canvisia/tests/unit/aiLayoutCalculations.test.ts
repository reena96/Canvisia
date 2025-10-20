import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  executeArrangeElements,
  executeAlignElements,
  arrangeInGrid,
  arrangeInRow,
  arrangeInColumn,
  alignShapes,
} from '@/utils/aiHelpers'
import * as firestoreModule from '@/services/firestore'
import type { Shape, Rectangle, Circle } from '@/types/shapes'

// Mock the firestore module
vi.mock('@/services/firestore', () => ({
  getShapes: vi.fn(),
  updateShape: vi.fn(),
}))

describe('AI Layout Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('arrangeInGrid', () => {
    it('should arrange 4 shapes in a 2x2 grid', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '3', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '4', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const spacing = 20
      const result = arrangeInGrid(shapes, spacing)

      // First row
      expect(result[0].x).toBe(0)
      expect(result[0].y).toBe(0)

      expect(result[1].x).toBe(120) // 100 + 20 spacing
      expect(result[1].y).toBe(0)

      // Second row
      expect(result[2].x).toBe(0)
      expect(result[2].y).toBe(120) // 100 + 20 spacing

      expect(result[3].x).toBe(120)
      expect(result[3].y).toBe(120)
    })

    it('should arrange 9 shapes in a 3x3 grid', () => {
      const shapes: Circle[] = Array.from({ length: 9 }, (_, i) => ({
        id: `${i + 1}`,
        type: 'circle' as const,
        x: 0,
        y: 0,
        radius: 50,
        fill: '#000',
        stroke: '#000',
        strokeWidth: 2,
        rotation: 0,
        createdBy: 'user',
        updatedAt: '',
      }))

      const spacing = 10
      const result = arrangeInGrid(shapes, spacing)

      // Check grid is 3x3
      // Row 1
      expect(result[0].x).toBe(0)
      expect(result[1].x).toBe(110) // 100 (2*radius) + 10
      expect(result[2].x).toBe(220)

      // Row 2
      expect(result[3].x).toBe(0)
      expect(result[3].y).toBe(110)
    })

    it('should handle shapes with different sizes', () => {
      const shapes: Shape[] = [
        { id: '1', type: 'rectangle', x: 0, y: 0, width: 100, height: 50, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' } as Rectangle,
        { id: '2', type: 'circle', x: 0, y: 0, radius: 30, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' } as Circle,
      ]

      const result = arrangeInGrid(shapes, 20)

      // Should calculate based on largest dimensions in each row/column
      expect(result[0].x).toBe(0)
      expect(result[1].x).toBeGreaterThan(0)
    })
  })

  describe('arrangeInRow', () => {
    it('should arrange shapes horizontally with even spacing', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '3', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const spacing = 50
      const result = arrangeInRow(shapes, spacing)

      expect(result[0].x).toBe(0)
      expect(result[1].x).toBe(150) // 100 + 50
      expect(result[2].x).toBe(300) // 200 + 100

      // All y positions should be the same
      expect(result[0].y).toBe(result[1].y)
      expect(result[1].y).toBe(result[2].y)
    })

    it('should handle circles correctly', () => {
      const shapes: Circle[] = [
        { id: '1', type: 'circle', x: 0, y: 0, radius: 50, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'circle', x: 0, y: 0, radius: 50, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const spacing = 20
      const result = arrangeInRow(shapes, spacing)

      expect(result[0].x).toBe(0)
      expect(result[1].x).toBe(120) // (2*50) + 20
    })
  })

  describe('arrangeInColumn', () => {
    it('should arrange shapes vertically with even spacing', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 0, y: 0, width: 100, height: 80, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 0, y: 0, width: 100, height: 80, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '3', type: 'rectangle', x: 0, y: 0, width: 100, height: 80, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const spacing = 30
      const result = arrangeInColumn(shapes, spacing)

      expect(result[0].y).toBe(0)
      expect(result[1].y).toBe(110) // 80 + 30
      expect(result[2].y).toBe(220) // 160 + 60

      // All x positions should be the same
      expect(result[0].x).toBe(result[1].x)
      expect(result[1].x).toBe(result[2].x)
    })
  })

  describe('alignShapes', () => {
    it('should align shapes to left (maintaining relative positioning)', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 100, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 200, y: 100, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '3', type: 'rectangle', x: 300, y: 200, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const result = alignShapes(shapes, 'left')

      // Leftmost is already at x=100, so no change
      // Maintains relative positioning (100px apart)
      expect(result[0].x).toBe(100)
      expect(result[1].x).toBe(200)
      expect(result[2].x).toBe(300)

      // Y positions should remain unchanged
      expect(result[0].y).toBe(0)
      expect(result[1].y).toBe(100)
      expect(result[2].y).toBe(200)
    })

    it('should align shapes to right (maintaining relative positioning)', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 100, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 200, y: 100, width: 80, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const result = alignShapes(shapes, 'right')

      // Right edge of shape 2: 200 + 80 = 280 (rightmost)
      // Shape 2 is at x=200, shape 1 is at x=100 (delta = 100)
      // Move both shapes by delta=100 to align to rightmost shape
      expect(result[0].x).toBe(200) // 100 + 100
      expect(result[1].x).toBe(300) // 200 + 100
    })

    it('should align shapes to top (maintaining relative positioning)', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 0, y: 100, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 150, y: 200, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const result = alignShapes(shapes, 'top')

      // Topmost is already at y=100, so no change
      // Maintains relative positioning (100px apart)
      expect(result[0].y).toBe(100)
      expect(result[1].y).toBe(200)
    })

    it('should align shapes to bottom (maintaining relative positioning)', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 0, y: 100, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 150, y: 200, width: 100, height: 80, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const result = alignShapes(shapes, 'bottom')

      // Bottom of shape 2: 200 + 80 = 280 (bottommost)
      // Shape 2 is at y=200, shape 1 is at y=100 (delta = 100)
      // Move both shapes by delta=100 to align to bottommost shape
      expect(result[0].y).toBe(200) // 100 + 100
      expect(result[1].y).toBe(300) // 200 + 100
    })

    it('should align shapes to center horizontally (maintaining relative positioning)', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 100, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 200, y: 100, width: 80, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const result = alignShapes(shapes, 'center-horizontal')

      // Group bounds: minX=100, maxX=280 (200+80)
      // Group center: (100 + 280) / 2 = 190
      // Average of individual centers: (150 + 240) / 2 = 195
      // Delta: 195 - 190 = 5
      expect(result[0].x).toBe(105) // 100 + 5
      expect(result[1].x).toBe(205) // 200 + 5
    })

    it('should align shapes to center vertically (maintaining relative positioning)', () => {
      const shapes: Rectangle[] = [
        { id: '1', type: 'rectangle', x: 0, y: 100, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: '2', type: 'rectangle', x: 150, y: 200, width: 100, height: 80, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      const result = alignShapes(shapes, 'center-vertical')

      // Group bounds: minY=100, maxY=280 (200+80)
      // Group center: (100 + 280) / 2 = 190
      // Average of individual centers: (150 + 240) / 2 = 195
      // Delta: 195 - 190 = 5
      expect(result[0].y).toBe(105) // 100 + 5
      expect(result[1].y).toBe(205) // 200 + 5
    })
  })

  describe('executeArrangeElements', () => {
    it('should arrange elements in a row pattern', async () => {
      const mockShapes: Rectangle[] = [
        { id: 'shape1', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: 'shape2', type: 'rectangle', x: 0, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      vi.mocked(firestoreModule.getShapes).mockResolvedValue(mockShapes)

      await executeArrangeElements('test-canvas', 'user1', {
        elementIds: ['shape1', 'shape2'],
        pattern: 'row',
        spacing: 50,
      })

      expect(firestoreModule.updateShape).toHaveBeenCalledTimes(2)
      expect(firestoreModule.updateShape).toHaveBeenCalledWith(
        'test-canvas',
        'shape1',
        expect.objectContaining({ x: 0 })
      )
      expect(firestoreModule.updateShape).toHaveBeenCalledWith(
        'test-canvas',
        'shape2',
        expect.objectContaining({ x: 150 }) // 100 + 50
      )
    })

    it('should arrange elements in a grid pattern', async () => {
      const mockShapes: Rectangle[] = Array.from({ length: 4 }, (_, i) => ({
        id: `shape${i + 1}`,
        type: 'rectangle' as const,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#000',
        stroke: '#000',
        strokeWidth: 2,
        rotation: 0,
        createdBy: 'user',
        updatedAt: '',
      }))

      vi.mocked(firestoreModule.getShapes).mockResolvedValue(mockShapes)

      await executeArrangeElements('test-canvas', 'user1', {
        elementIds: ['shape1', 'shape2', 'shape3', 'shape4'],
        pattern: 'grid',
        spacing: 20,
      })

      expect(firestoreModule.updateShape).toHaveBeenCalledTimes(4)
    })

    it('should throw error if no shapes found', async () => {
      vi.mocked(firestoreModule.getShapes).mockResolvedValue([])

      await expect(
        executeArrangeElements('test-canvas', 'user1', {
          elementIds: ['nonexistent'],
          pattern: 'row',
        })
      ).rejects.toThrow('No matching shapes found')
    })
  })

  describe('executeAlignElements', () => {
    it('should align elements to center horizontally', async () => {
      const mockShapes: Rectangle[] = [
        { id: 'shape1', type: 'rectangle', x: 100, y: 0, width: 100, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
        { id: 'shape2', type: 'rectangle', x: 200, y: 100, width: 80, height: 100, fill: '#000', stroke: '#000', strokeWidth: 2, rotation: 0, createdBy: 'user', updatedAt: '' },
      ]

      vi.mocked(firestoreModule.getShapes).mockResolvedValue(mockShapes)

      await executeAlignElements('test-canvas', 'user1', {
        elementIds: ['shape1', 'shape2'],
        alignment: 'center-horizontal',
      })

      expect(firestoreModule.updateShape).toHaveBeenCalledTimes(2)
    })

    it('should throw error if no shapes found', async () => {
      vi.mocked(firestoreModule.getShapes).mockResolvedValue([])

      await expect(
        executeAlignElements('test-canvas', 'user1', {
          elementIds: ['nonexistent'],
          alignment: 'left',
        })
      ).rejects.toThrow('No matching shapes found')
    })
  })
})
