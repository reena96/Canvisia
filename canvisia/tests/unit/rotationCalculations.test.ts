import { describe, it, expect } from 'vitest'
import {
  calculateAngle,
  calculateRotationDelta,
  normalizeAngle,
  snapAngle,
  getRotationHandlePosition,
  formatAngle,
  rotatePoint,
} from '@/utils/rotationCalculations'

describe('Rotation Calculations', () => {
  describe('calculateAngle', () => {
    it('should calculate 0 degrees for point directly to the right', () => {
      const angle = calculateAngle(0, 0, 10, 0)
      expect(angle).toBe(0)
    })

    it('should calculate 90 degrees for point directly below', () => {
      const angle = calculateAngle(0, 0, 0, 10)
      expect(angle).toBe(90)
    })

    it('should calculate 180 degrees for point directly to the left', () => {
      const angle = calculateAngle(0, 0, -10, 0)
      expect(angle).toBe(180)
    })

    it('should calculate 270 degrees for point directly above', () => {
      const angle = calculateAngle(0, 0, 0, -10)
      expect(angle).toBe(270)
    })

    it('should calculate 45 degrees for diagonal point', () => {
      const angle = calculateAngle(0, 0, 10, 10)
      expect(angle).toBeCloseTo(45, 1)
    })

    it('should handle non-origin centers', () => {
      const angle = calculateAngle(100, 100, 110, 100)
      expect(angle).toBe(0)
    })
  })

  describe('calculateRotationDelta', () => {
    it('should calculate rotation for rectangular shape', () => {
      const shape = { x: 100, y: 100, width: 100, height: 100 }
      const mouseX = 250 // To the right of center (150, 150)
      const mouseY = 150

      const rotation = calculateRotationDelta(shape, mouseX, mouseY, 0)
      expect(rotation).toBe(0) // Pointing right = 0 degrees
    })

    it('should calculate rotation for circular shape', () => {
      const shape = { x: 100, y: 100, radius: 50 }
      const mouseX = 100 // Directly below center
      const mouseY = 150

      const rotation = calculateRotationDelta(shape, mouseX, mouseY, 0)
      expect(rotation).toBe(90) // Pointing down = 90 degrees
    })

    it('should handle different mouse positions', () => {
      const shape = { x: 100, y: 100, width: 100, height: 100 }

      // Left of center
      const rotationLeft = calculateRotationDelta(shape, 50, 150, 0)
      expect(rotationLeft).toBe(180)

      // Above center
      const rotationUp = calculateRotationDelta(shape, 150, 50, 0)
      expect(rotationUp).toBe(270)
    })
  })

  describe('normalizeAngle', () => {
    it('should keep angles in range 0-360 unchanged', () => {
      expect(normalizeAngle(45)).toBe(45)
      expect(normalizeAngle(0)).toBe(0)
      expect(normalizeAngle(359)).toBe(359)
    })

    it('should normalize negative angles', () => {
      expect(normalizeAngle(-45)).toBe(315)
      expect(normalizeAngle(-90)).toBe(270)
      expect(normalizeAngle(-360)).toBe(0)
    })

    it('should normalize angles > 360', () => {
      expect(normalizeAngle(370)).toBe(10)
      expect(normalizeAngle(720)).toBe(0)
      expect(normalizeAngle(405)).toBe(45)
    })

    it('should handle very large angles', () => {
      expect(normalizeAngle(1080)).toBe(0)
      expect(normalizeAngle(-1080)).toBe(0)
    })
  })

  describe('snapAngle', () => {
    it('should snap to nearest 15-degree increment by default', () => {
      expect(snapAngle(7)).toBe(0)
      expect(snapAngle(8)).toBe(15)
      expect(snapAngle(22)).toBe(15)
      expect(snapAngle(23)).toBe(30)
      expect(snapAngle(37)).toBe(30)
    })

    it('should snap to custom increments', () => {
      expect(snapAngle(44, 45)).toBe(45)
      expect(snapAngle(23, 45)).toBe(45) // 23/45 = 0.51, rounds to 1 * 45 = 45
      expect(snapAngle(11, 45)).toBe(0)  // 11/45 = 0.24, rounds to 0 * 45 = 0
      expect(snapAngle(67, 45)).toBe(45) // 67/45 = 1.49, rounds to 1 * 45 = 45
      expect(snapAngle(68, 45)).toBe(90) // 68/45 = 1.51, rounds to 2 * 45 = 90
    })

    it('should handle 30-degree increments', () => {
      expect(snapAngle(14, 30)).toBe(0)
      expect(snapAngle(16, 30)).toBe(30)
      expect(snapAngle(44, 30)).toBe(30)
      expect(snapAngle(46, 30)).toBe(60)
    })
  })

  describe('getRotationHandlePosition', () => {
    const viewport = { x: 0, y: 0, zoom: 1 }

    it('should position handle above rectangular shape', () => {
      const shape = { x: 100, y: 100, width: 100, height: 100 }
      const position = getRotationHandlePosition(shape, viewport, 40)

      expect(position.x).toBe(150) // Center X
      expect(position.y).toBe(60)  // Above top edge (100 - 40)
    })

    it('should position handle above circular shape', () => {
      const shape = { x: 100, y: 100, radius: 50 }
      const position = getRotationHandlePosition(shape, viewport, 40)

      expect(position.x).toBe(100) // Center X
      expect(position.y).toBe(10)  // Above circle (100 - 50 - 40)
    })

    it('should account for viewport zoom', () => {
      const shape = { x: 100, y: 100, width: 100, height: 100 }
      const zoomedViewport = { x: 0, y: 0, zoom: 2 }
      const position = getRotationHandlePosition(shape, zoomedViewport, 40)

      expect(position.x).toBe(300) // (100 + 50) * 2
      expect(position.y).toBe(160) // (100 - 40/2) * 2 = (100 - 20) * 2 = 160
    })

    it('should account for viewport offset', () => {
      const shape = { x: 100, y: 100, width: 100, height: 100 }
      const offsetViewport = { x: 50, y: 50, zoom: 1 }
      const position = getRotationHandlePosition(shape, offsetViewport, 40)

      expect(position.x).toBe(200) // 150 + 50
      expect(position.y).toBe(110) // 60 + 50
    })
  })

  describe('formatAngle', () => {
    it('should format angles with degree symbol', () => {
      expect(formatAngle(45)).toBe('45°')
      expect(formatAngle(0)).toBe('0°')
      expect(formatAngle(359)).toBe('359°')
    })

    it('should round to nearest integer', () => {
      expect(formatAngle(45.4)).toBe('45°')
      expect(formatAngle(45.6)).toBe('46°')
    })

    it('should handle negative angles', () => {
      expect(formatAngle(-45)).toBe('-45°')
    })
  })

  describe('rotatePoint', () => {
    it('should rotate point 90 degrees around origin', () => {
      const result = rotatePoint(10, 0, 0, 0, 90)

      expect(result.x).toBeCloseTo(0, 5)
      expect(result.y).toBeCloseTo(10, 5)
    })

    it('should rotate point 180 degrees around origin', () => {
      const result = rotatePoint(10, 0, 0, 0, 180)

      expect(result.x).toBeCloseTo(-10, 5)
      expect(result.y).toBeCloseTo(0, 5)
    })

    it('should rotate point 270 degrees around origin', () => {
      const result = rotatePoint(10, 0, 0, 0, 270)

      expect(result.x).toBeCloseTo(0, 5)
      expect(result.y).toBeCloseTo(-10, 5)
    })

    it('should rotate point around non-origin center', () => {
      const result = rotatePoint(110, 100, 100, 100, 90)

      expect(result.x).toBeCloseTo(100, 5)
      expect(result.y).toBeCloseTo(110, 5)
    })

    it('should handle 45-degree rotation', () => {
      const result = rotatePoint(10, 0, 0, 0, 45)

      expect(result.x).toBeCloseTo(7.071, 2)
      expect(result.y).toBeCloseTo(7.071, 2)
    })

    it('should return original point for 0-degree rotation', () => {
      const result = rotatePoint(10, 5, 0, 0, 0)

      expect(result.x).toBeCloseTo(10, 5)
      expect(result.y).toBeCloseTo(5, 5)
    })

    it('should return original point for 360-degree rotation', () => {
      const result = rotatePoint(10, 5, 0, 0, 360)

      expect(result.x).toBeCloseTo(10, 5)
      expect(result.y).toBeCloseTo(5, 5)
    })
  })
})
