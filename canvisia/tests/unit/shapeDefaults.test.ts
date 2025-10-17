import { describe, it, expect } from 'vitest'
import {
  createDefaultRectangle,
  createDefaultCircle,
  createDefaultLine,
  createDefaultText,
  createDefaultTriangle,
  createDefaultPentagon,
  createDefaultHexagon,
  createDefaultStar,
  createDefaultArrow,
  createDefaultBidirectionalArrow,
  createDefaultBentConnector,
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

    it('should create rectangle with white fill and dark stroke', () => {
      const rect = createDefaultRectangle(0, 0)
      expect(rect.fill).toBe('#FFFFFF') // White fill
      expect(rect.stroke).toBe('#1F2937') // Dark gray stroke
      expect(rect.strokeWidth).toBe(3)
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

    it('should create circle with white fill and dark stroke', () => {
      const circle = createDefaultCircle(0, 0)
      expect(circle.fill).toBe('#FFFFFF') // White fill
      expect(circle.stroke).toBe('#1F2937') // Dark gray stroke
      expect(circle.strokeWidth).toBe(3)
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

    it('should create line with dark stroke', () => {
      const line = createDefaultLine(0, 0)
      expect(line.stroke).toBe('#1F2937') // Dark gray
      expect(line.strokeWidth).toBe(3)
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
      expect(text.text).toBe('')
    })

    it('should create text with default font size', () => {
      const text = createDefaultText(0, 0)
      expect(text.fontSize).toBe(16)
    })

    it('should create text with dark gray color', () => {
      const text = createDefaultText(0, 0)
      expect(text.fill).toBe('#1F2937') // Dark gray
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

  describe('createDefaultTriangle', () => {
    it('should create triangle with correct position', () => {
      const triangle = createDefaultTriangle(100, 200)
      expect(triangle.x).toBe(100)
      expect(triangle.y).toBe(200)
    })

    it('should create triangle with default radius', () => {
      const triangle = createDefaultTriangle(0, 0)
      expect(triangle.radiusX).toBe(50)
      expect(triangle.radiusY).toBe(50)
    })

    it('should create triangle with white fill and dark stroke', () => {
      const triangle = createDefaultTriangle(0, 0)
      expect(triangle.fill).toBe('#FFFFFF') // White fill
      expect(triangle.stroke).toBe('#1F2937') // Dark gray stroke
      expect(triangle.strokeWidth).toBe(3)
    })

    it('should set type to triangle', () => {
      const triangle = createDefaultTriangle(0, 0)
      expect(triangle.type).toBe('triangle')
    })
  })

  describe('createDefaultPentagon', () => {
    it('should create pentagon with correct position', () => {
      const pentagon = createDefaultPentagon(100, 200)
      expect(pentagon.x).toBe(100)
      expect(pentagon.y).toBe(200)
    })

    it('should create pentagon with default radius', () => {
      const pentagon = createDefaultPentagon(0, 0)
      expect(pentagon.radiusX).toBe(50)
      expect(pentagon.radiusY).toBe(50)
    })

    it('should create pentagon with white fill and dark stroke', () => {
      const pentagon = createDefaultPentagon(0, 0)
      expect(pentagon.fill).toBe('#FFFFFF') // White fill
      expect(pentagon.stroke).toBe('#1F2937') // Dark gray stroke
      expect(pentagon.strokeWidth).toBe(3)
    })

    it('should set type to pentagon', () => {
      const pentagon = createDefaultPentagon(0, 0)
      expect(pentagon.type).toBe('pentagon')
    })
  })

  describe('createDefaultHexagon', () => {
    it('should create hexagon with correct position', () => {
      const hexagon = createDefaultHexagon(100, 200)
      expect(hexagon.x).toBe(100)
      expect(hexagon.y).toBe(200)
    })

    it('should create hexagon with default radius', () => {
      const hexagon = createDefaultHexagon(0, 0)
      expect(hexagon.radiusX).toBe(50)
      expect(hexagon.radiusY).toBe(50)
    })

    it('should create hexagon with white fill and dark stroke', () => {
      const hexagon = createDefaultHexagon(0, 0)
      expect(hexagon.fill).toBe('#FFFFFF') // White fill
      expect(hexagon.stroke).toBe('#1F2937') // Dark gray stroke
      expect(hexagon.strokeWidth).toBe(3)
    })

    it('should set type to hexagon', () => {
      const hexagon = createDefaultHexagon(0, 0)
      expect(hexagon.type).toBe('hexagon')
    })
  })

  describe('createDefaultStar', () => {
    it('should create star with correct position', () => {
      const star = createDefaultStar(100, 200)
      expect(star.x).toBe(100)
      expect(star.y).toBe(200)
    })

    it('should create star with default outer radius', () => {
      const star = createDefaultStar(0, 0)
      expect(star.outerRadiusX).toBe(50)
      expect(star.outerRadiusY).toBe(50)
    })

    it('should create star with default inner radius', () => {
      const star = createDefaultStar(0, 0)
      expect(star.innerRadiusX).toBe(25)
      expect(star.innerRadiusY).toBe(25)
    })

    it('should create 5-pointed star', () => {
      const star = createDefaultStar(0, 0)
      expect(star.numPoints).toBe(5)
    })

    it('should create star with white fill and dark stroke', () => {
      const star = createDefaultStar(0, 0)
      expect(star.fill).toBe('#FFFFFF') // White fill
      expect(star.stroke).toBe('#1F2937') // Dark gray stroke
      expect(star.strokeWidth).toBe(3)
    })

    it('should set type to star', () => {
      const star = createDefaultStar(0, 0)
      expect(star.type).toBe('star')
    })
  })

  describe('createDefaultArrow', () => {
    it('should create arrow with correct start position', () => {
      const arrow = createDefaultArrow(100, 200)
      expect(arrow.x).toBe(100)
      expect(arrow.y).toBe(200)
    })

    it('should create horizontal arrow with 150px length', () => {
      const arrow = createDefaultArrow(0, 0)
      expect(arrow.x2).toBe(150)
      expect(arrow.y2).toBe(0)
    })

    it('should create arrow with dark stroke', () => {
      const arrow = createDefaultArrow(0, 0)
      expect(arrow.stroke).toBe('#1F2937') // Dark gray
      expect(arrow.strokeWidth).toBe(3)
    })

    it('should create arrow with default pointer dimensions', () => {
      const arrow = createDefaultArrow(0, 0)
      expect(arrow.pointerLength).toBe(10)
      expect(arrow.pointerWidth).toBe(10)
    })

    it('should set type to arrow', () => {
      const arrow = createDefaultArrow(0, 0)
      expect(arrow.type).toBe('arrow')
    })
  })

  describe('createDefaultBentConnector', () => {
    it('should create bent connector with correct start position', () => {
      const bent = createDefaultBentConnector(100, 200)
      expect(bent.x).toBe(100)
      expect(bent.y).toBe(200)
    })

    it('should create bent connector with end point', () => {
      const bent = createDefaultBentConnector(0, 0)
      expect(bent.x2).toBe(150)
      expect(bent.y2).toBe(100)
    })

    it('should create bent connector with midpoint bend', () => {
      const bent = createDefaultBentConnector(0, 0)
      // Bend should be at midpoint horizontally, at start Y
      expect(bent.bendX).toBe(75) // (0 + 150) / 2
      expect(bent.bendY).toBe(0)
    })

    it('should create bent connector with gray stroke', () => {
      const bent = createDefaultBentConnector(0, 0)
      expect(bent.stroke).toBe('#6B7280')
    })

    it('should set type to bentConnector', () => {
      const bent = createDefaultBentConnector(0, 0)
      expect(bent.type).toBe('bentConnector')
    })
  })

  describe('createDefaultBidirectionalArrow', () => {
    it('should create bidirectional arrow with correct start position', () => {
      const arrow = createDefaultBidirectionalArrow(100, 200)
      expect(arrow.x).toBe(100)
      expect(arrow.y).toBe(200)
    })

    it('should create horizontal bidirectional arrow with 150px length', () => {
      const arrow = createDefaultBidirectionalArrow(0, 0)
      expect(arrow.x2).toBe(150)
      expect(arrow.y2).toBe(0)
    })

    it('should create bidirectional arrow with dark stroke', () => {
      const arrow = createDefaultBidirectionalArrow(0, 0)
      expect(arrow.stroke).toBe('#1F2937') // Dark gray
      expect(arrow.strokeWidth).toBe(3)
    })

    it('should create bidirectional arrow with default pointer dimensions', () => {
      const arrow = createDefaultBidirectionalArrow(0, 0)
      expect(arrow.pointerLength).toBe(10)
      expect(arrow.pointerWidth).toBe(10)
    })

    it('should set type to bidirectionalArrow', () => {
      const arrow = createDefaultBidirectionalArrow(0, 0)
      expect(arrow.type).toBe('bidirectionalArrow')
    })
  })
})
