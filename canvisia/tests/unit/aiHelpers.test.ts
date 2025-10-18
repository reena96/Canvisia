import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeCreateShape, executeCreateText, executeCreateArrow, calculateSmartPosition } from '@/utils/aiHelpers'
import * as firestoreModule from '@/services/firestore'

// Mock the firestore module
vi.mock('@/services/firestore', () => ({
  createShape: vi.fn()
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}))

describe('AI Helpers - Creation Commands', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('executeCreateShape', () => {
    it('should create a rectangle with correct properties', async () => {
      const canvasId = 'test-canvas'
      const input = {
        shapeType: 'rectangle',
        x: 100,
        y: 200,
        width: 150,
        height: 100,
        color: '#FF0000'
      }

      await executeCreateShape(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'rectangle',
          x: 100,
          y: 200,
          width: 150,
          height: 100,
          fill: '#FF0000',
          stroke: '#1F2937',
          strokeWidth: 2
        })
      )
    })

    it('should create a circle with default radius', async () => {
      const canvasId = 'test-canvas'
      const input = {
        shapeType: 'circle',
        x: 500,
        y: 500
      }

      await executeCreateShape(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'circle',
          x: 500,
          y: 500,
          radius: 50, // Default radius
          fill: '#3B82F6' // Default blue
        })
      )
    })

    it('should resolve color names to hex codes', async () => {
      const canvasId = 'test-canvas'
      const input = {
        shapeType: 'rectangle',
        x: 0,
        y: 0,
        color: 'red'
      }

      await executeCreateShape(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          fill: '#EF4444' // Red hex code
        })
      )
    })

    it('should create an ellipse with radiusX and radiusY', async () => {
      const canvasId = 'test-canvas'
      const input = {
        shapeType: 'ellipse',
        x: 300,
        y: 300,
        radiusX: 100,
        radiusY: 50,
        color: 'blue'
      }

      await executeCreateShape(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'ellipse',
          radiusX: 100,
          radiusY: 50,
          fill: '#3B82F6'
        })
      )
    })

    it('should create a star with correct radii', async () => {
      const canvasId = 'test-canvas'
      const input = {
        shapeType: 'star',
        x: 400,
        y: 400,
        radiusX: 60,
        radiusY: 60,
        color: '#FFFF00'
      }

      await executeCreateShape(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'star',
          outerRadiusX: 60,
          outerRadiusY: 60,
          innerRadiusX: 30, // Half of outer
          innerRadiusY: 30,
          numPoints: 5
        })
      )
    })

    it('should throw error for unsupported shape type', async () => {
      const canvasId = 'test-canvas'
      const input = {
        shapeType: 'invalid-shape',
        x: 0,
        y: 0
      }

      await expect(executeCreateShape(canvasId, input)).rejects.toThrow('Unsupported shape type: invalid-shape')
    })
  })

  describe('executeCreateText', () => {
    it('should create text with default properties', async () => {
      const canvasId = 'test-canvas'
      const input = {
        text: 'Hello World',
        x: 100,
        y: 100,
        color: '#000000' // Explicitly set black color
      }

      await executeCreateText(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'text',
          text: 'Hello World',
          x: 100,
          y: 100,
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#000000'
        })
      )
    })

    it('should create text with custom font size and color', async () => {
      const canvasId = 'test-canvas'
      const input = {
        text: 'Custom Text',
        x: 200,
        y: 200,
        fontSize: 24,
        color: 'red',
        fontFamily: 'Helvetica'
      }

      await executeCreateText(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          text: 'Custom Text',
          fontSize: 24,
          fontFamily: 'Helvetica',
          fill: '#EF4444' // Red
        })
      )
    })

    it('should calculate text height based on font size', async () => {
      const canvasId = 'test-canvas'
      const input = {
        text: 'Test',
        x: 0,
        y: 0,
        fontSize: 20
      }

      await executeCreateText(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          height: 24 // fontSize (20) * lineHeight (1.2)
        })
      )
    })
  })

  describe('executeCreateArrow', () => {
    it('should create arrow with default properties', async () => {
      const canvasId = 'test-canvas'
      const input = {
        x1: 100,
        y1: 100,
        x2: 500,
        y2: 500,
        color: '#000000' // Explicitly set black color
      }

      await executeCreateArrow(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'arrow',
          x: 100,
          y: 100,
          x2: 500,
          y2: 500,
          stroke: '#000000',
          strokeWidth: 2
        })
      )
    })

    it('should create bidirectional arrow when specified', async () => {
      const canvasId = 'test-canvas'
      const input = {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 100,
        arrowType: 'bidirectionalArrow'
      }

      await executeCreateArrow(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          type: 'bidirectionalArrow'
        })
      )
    })

    it('should create arrow with custom color', async () => {
      const canvasId = 'test-canvas'
      const input = {
        x1: 0,
        y1: 0,
        x2: 200,
        y2: 200,
        color: 'blue'
      }

      await executeCreateArrow(canvasId, input)

      expect(firestoreModule.createShape).toHaveBeenCalledWith(
        canvasId,
        expect.objectContaining({
          stroke: '#3B82F6' // Blue
        })
      )
    })
  })

  describe('calculateSmartPosition', () => {
    it('should return center position', () => {
      const pos = calculateSmartPosition('center')
      expect(pos).toEqual({ x: 1000, y: 1000 })
    })

    it('should return top left position', () => {
      const pos = calculateSmartPosition('top left')
      expect(pos).toEqual({ x: 200, y: 200 })
    })

    it('should return top center position', () => {
      const pos = calculateSmartPosition('top')
      expect(pos).toEqual({ x: 1000, y: 200 })
    })

    it('should return top right position', () => {
      const pos = calculateSmartPosition('top right')
      expect(pos).toEqual({ x: 1800, y: 200 })
    })

    it('should return left center position', () => {
      const pos = calculateSmartPosition('left')
      expect(pos).toEqual({ x: 200, y: 1000 })
    })

    it('should return right center position', () => {
      const pos = calculateSmartPosition('right')
      expect(pos).toEqual({ x: 1800, y: 1000 })
    })

    it('should return bottom left position', () => {
      const pos = calculateSmartPosition('bottom left')
      expect(pos).toEqual({ x: 200, y: 1800 })
    })

    it('should return bottom center position', () => {
      const pos = calculateSmartPosition('bottom')
      expect(pos).toEqual({ x: 1000, y: 1800 })
    })

    it('should return bottom right position', () => {
      const pos = calculateSmartPosition('bottom right')
      expect(pos).toEqual({ x: 1800, y: 1800 })
    })

    it('should return default center for unknown position', () => {
      const pos = calculateSmartPosition('unknown')
      expect(pos).toEqual({ x: 1000, y: 1000 })
    })

    it('should use custom canvas size', () => {
      const pos = calculateSmartPosition('center', { width: 4000, height: 4000 })
      expect(pos).toEqual({ x: 2000, y: 2000 })
    })
  })
})
