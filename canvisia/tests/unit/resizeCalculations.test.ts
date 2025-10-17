import { describe, it, expect } from 'vitest'
import {
  calculateRectangleResize,
  calculateCircleResize,
  calculateEllipseResize,
  getResizeHandlePositions,
  getCircleResizeHandlePositions,
} from '@/utils/resizeCalculations'

describe('Resize Calculations', () => {
  describe('calculateRectangleResize', () => {
    const baseShape = { x: 100, y: 100, width: 100, height: 100 }

    it('should resize from southeast handle correctly (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 'se', 50, 30, false)

      // Center-based: changes affect both sides, so delta is doubled
      // Width: 100 + (50 * 2) = 200
      // Height: 100 + (30 * 2) = 160
      // Center shifts by the delta
      expect(result.x).toBe(150) // 100 + 50
      expect(result.y).toBe(130) // 100 + 30
      expect(result.width).toBe(200)
      expect(result.height).toBe(160)
    })

    it('should resize from northwest handle correctly (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 'nw', 20, 10, false)

      // Center-based: changes affect both sides
      // Width: 100 - (20 * 2) = 60
      // Height: 100 - (10 * 2) = 80
      // Center shifts by the delta in the direction of the drag
      expect(result.x).toBe(120) // 100 + 20
      expect(result.y).toBe(110) // 100 + 10
      expect(result.width).toBe(60)
      expect(result.height).toBe(80)
    })

    it('should resize from north handle correctly (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 'n', 0, 20, false)

      // Center-based: height changes affect both sides
      // Height: 100 - (20 * 2) = 60
      // Center Y shifts by deltaY
      expect(result.x).toBe(100)
      expect(result.y).toBe(120) // 100 + 20
      expect(result.width).toBe(100)
      expect(result.height).toBe(60)
    })

    it('should resize from east handle correctly (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 'e', 40, 0, false)

      // Center-based: width changes affect both sides
      // Width: 100 + (40 * 2) = 180
      // Center X shifts by deltaX
      expect(result.x).toBe(140) // 100 + 40
      expect(result.y).toBe(100)
      expect(result.width).toBe(180)
      expect(result.height).toBe(100)
    })

    it('should maintain aspect ratio when shift-dragging southeast (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 'se', 50, 50, true)

      // Center-based with aspect ratio
      // Uses the larger change, doubled: 50 * 2 = 100
      expect(result.width).toBe(200) // 100 + 100
      expect(result.height).toBe(200) // Maintains 1:1 aspect ratio
    })

    it('should prevent negative dimensions', () => {
      const result = calculateRectangleResize(baseShape, 'se', -200, -200, false)

      expect(result.width).toBeGreaterThanOrEqual(10)
      expect(result.height).toBeGreaterThanOrEqual(10)
    })

    it('should handle west handle resize (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 'w', 30, 0, false)

      // Center-based: width decreases on both sides
      // Width: 100 - (30 * 2) = 40
      // Center X shifts by deltaX
      expect(result.x).toBe(130) // 100 + 30
      expect(result.width).toBe(40)
      expect(result.height).toBe(100)
    })

    it('should handle south handle resize (center-based)', () => {
      const result = calculateRectangleResize(baseShape, 's', 0, 25, false)

      // Center-based: height increases on both sides
      // Height: 100 + (25 * 2) = 150
      // Center Y shifts by deltaY
      expect(result.y).toBe(125) // 100 + 25
      expect(result.width).toBe(100)
      expect(result.height).toBe(150)
    })
  })

  describe('calculateCircleResize', () => {
    const baseCircle = { x: 100, y: 100, radius: 50 }

    it('should increase radius when dragging east handle outward', () => {
      const result = calculateCircleResize(baseCircle, 'e', 20, 0)

      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
      expect(result.radius).toBe(70) // 50 + 20 = 70
    })

    it('should increase radius when dragging west handle outward', () => {
      const result = calculateCircleResize(baseCircle, 'w', -20, 0)

      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
      expect(result.radius).toBe(70) // -(-20) = 20, so 50 + 20 = 70
    })

    it('should decrease radius when dragging east handle inward', () => {
      const result = calculateCircleResize(baseCircle, 'e', -20, 0)

      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
      expect(result.radius).toBe(30) // 50 + (-20) = 30
    })

    it('should decrease radius when dragging west handle inward', () => {
      const result = calculateCircleResize(baseCircle, 'w', 20, 0)

      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
      expect(result.radius).toBe(30) // 50 - 20 = 30
    })

    it('should prevent radius from going below minimum', () => {
      const result = calculateCircleResize(baseCircle, 'w', -100, 0)

      expect(result.radius).toBeGreaterThanOrEqual(5)
    })

    it('should use average of both deltas for corner handle', () => {
      const result = calculateCircleResize(baseCircle, 'se', 10, 30)

      // For SE corner: (10 + 30) / 2 = 20
      expect(result.radius).toBe(70) // 50 + 20 = 70
    })
  })

  describe('calculateEllipseResize', () => {
    const baseEllipse = { x: 100, y: 100, radiusX: 50, radiusY: 75 }

    it('should resize radiusX when dragging east handle', () => {
      const result = calculateEllipseResize(baseEllipse, 'e', 20, 0)

      expect(result.radiusX).toBe(70)
      expect(result.radiusY).toBe(75) // unchanged
    })

    it('should resize radiusY when dragging south handle', () => {
      const result = calculateEllipseResize(baseEllipse, 's', 0, 25)

      expect(result.radiusX).toBe(50) // unchanged
      expect(result.radiusY).toBe(100)
    })

    it('should resize both radii when dragging corner handle', () => {
      const result = calculateEllipseResize(baseEllipse, 'se', 20, 25)

      expect(result.radiusX).toBe(70)
      expect(result.radiusY).toBe(100)
    })

    it('should prevent radii from going below minimum', () => {
      const result = calculateEllipseResize(baseEllipse, 'nw', -100, -100)

      expect(result.radiusX).toBeGreaterThanOrEqual(5)
      expect(result.radiusY).toBeGreaterThanOrEqual(5)
    })
  })

  describe('getResizeHandlePositions', () => {
    const shape = { x: 100, y: 100, width: 100, height: 100 }
    const viewport = { x: 0, y: 0, zoom: 1 }

    it('should calculate handle positions correctly', () => {
      const positions = getResizeHandlePositions(shape, viewport)

      expect(positions.nw).toEqual({ x: 100, y: 100 })
      expect(positions.n).toEqual({ x: 150, y: 100 })
      expect(positions.ne).toEqual({ x: 200, y: 100 })
      expect(positions.w).toEqual({ x: 100, y: 150 })
      expect(positions.e).toEqual({ x: 200, y: 150 })
      expect(positions.sw).toEqual({ x: 100, y: 200 })
      expect(positions.s).toEqual({ x: 150, y: 200 })
      expect(positions.se).toEqual({ x: 200, y: 200 })
    })

    it('should account for viewport zoom', () => {
      const zoomedViewport = { x: 0, y: 0, zoom: 2 }
      const positions = getResizeHandlePositions(shape, zoomedViewport)

      expect(positions.nw).toEqual({ x: 200, y: 200 })
      expect(positions.se).toEqual({ x: 400, y: 400 })
    })

    it('should account for viewport offset', () => {
      const offsetViewport = { x: 50, y: 50, zoom: 1 }
      const positions = getResizeHandlePositions(shape, offsetViewport)

      expect(positions.nw).toEqual({ x: 150, y: 150 })
      expect(positions.se).toEqual({ x: 250, y: 250 })
    })
  })

  describe('getCircleResizeHandlePositions', () => {
    const circle = { x: 100, y: 100, radius: 50 }
    const viewport = { x: 0, y: 0, zoom: 1 }

    it('should calculate circular handle positions correctly', () => {
      const positions = getCircleResizeHandlePositions(circle, viewport)

      expect(positions.nw).toEqual({ x: 50, y: 50 })
      expect(positions.n).toEqual({ x: 100, y: 50 })
      expect(positions.ne).toEqual({ x: 150, y: 50 })
      expect(positions.e).toEqual({ x: 150, y: 100 })
      expect(positions.se).toEqual({ x: 150, y: 150 })
      expect(positions.s).toEqual({ x: 100, y: 150 })
      expect(positions.sw).toEqual({ x: 50, y: 150 })
      expect(positions.w).toEqual({ x: 50, y: 100 })
    })

    it('should account for viewport transformations', () => {
      const zoomedViewport = { x: 10, y: 10, zoom: 2 }
      const positions = getCircleResizeHandlePositions(circle, zoomedViewport)

      expect(positions.nw).toEqual({ x: 110, y: 110 })
      expect(positions.se).toEqual({ x: 310, y: 310 })
    })
  })
})
