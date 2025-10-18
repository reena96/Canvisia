import { describe, it, expect } from 'vitest'
import { isPointInShape, getShapeCenter, findClosestShape, detectConnection, getConnectionPoint } from '@/utils/connectionUtils'
import type { Shape, Rectangle, Circle, Ellipse, Text, Arrow } from '@/types/shapes'

describe('Connection Utils', () => {
  describe('isPointInShape', () => {
    it('should detect point inside rectangle', () => {
      const rect: Rectangle = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        fill: '#FF0000',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      expect(isPointInShape({ x: 150, y: 125 }, rect)).toBe(true)
      expect(isPointInShape({ x: 50, y: 125 }, rect)).toBe(false)
      expect(isPointInShape({ x: 250, y: 125 }, rect)).toBe(false)
    })

    it('should detect point inside circle', () => {
      const circle: Circle = {
        id: '2',
        type: 'circle',
        x: 200,
        y: 200,
        radius: 50,
        fill: '#00FF00',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      expect(isPointInShape({ x: 200, y: 200 }, circle)).toBe(true) // Center
      expect(isPointInShape({ x: 220, y: 220 }, circle)).toBe(true) // Inside
      expect(isPointInShape({ x: 300, y: 200 }, circle)).toBe(false) // Outside
    })

    it('should detect point inside ellipse', () => {
      const ellipse: Ellipse = {
        id: '3',
        type: 'ellipse',
        x: 300,
        y: 300,
        radiusX: 100,
        radiusY: 50,
        fill: '#0000FF',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      expect(isPointInShape({ x: 300, y: 300 }, ellipse)).toBe(true) // Center
      expect(isPointInShape({ x: 350, y: 300 }, ellipse)).toBe(true) // Inside horizontal
      expect(isPointInShape({ x: 500, y: 300 }, ellipse)).toBe(false) // Outside
    })

    it('should detect point inside text bounding box', () => {
      const text: Text = {
        id: '4',
        type: 'text',
        text: 'Test',
        x: 100,
        y: 100,
        width: 100,
        height: 20,
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#000000',
        fontWeight: 400,
        fontStyle: 'normal',
        textDecoration: 'none',
        align: 'left',
        lineHeight: 1.2,
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      expect(isPointInShape({ x: 150, y: 110 }, text)).toBe(true)
      expect(isPointInShape({ x: 50, y: 110 }, text)).toBe(false)
    })
  })

  describe('getShapeCenter', () => {
    it('should get center of rectangle', () => {
      const rect: Rectangle = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        fill: '#FF0000',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      const center = getShapeCenter(rect)
      expect(center).toEqual({ x: 150, y: 125 })
    })

    it('should get center of circle (x, y is center)', () => {
      const circle: Circle = {
        id: '2',
        type: 'circle',
        x: 200,
        y: 200,
        radius: 50,
        fill: '#00FF00',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      const center = getShapeCenter(circle)
      expect(center).toEqual({ x: 200, y: 200 })
    })

    it('should get center of arrow (midpoint)', () => {
      const arrow: Arrow = {
        id: '3',
        type: 'arrow',
        x: 0,
        y: 0,
        x2: 100,
        y2: 100,
        stroke: '#000000',
        strokeWidth: 2,
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      const center = getShapeCenter(arrow)
      expect(center).toEqual({ x: 50, y: 50 })
    })
  })

  describe('findClosestShape', () => {
    const shapes: Shape[] = [
      {
        id: '1',
        type: 'circle',
        x: 100,
        y: 100,
        radius: 50,
        fill: '#FF0000',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      } as Circle,
      {
        id: '2',
        type: 'circle',
        x: 300,
        y: 300,
        radius: 50,
        fill: '#00FF00',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      } as Circle,
      {
        id: '3',
        type: 'circle',
        x: 500,
        y: 500,
        radius: 50,
        fill: '#0000FF',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      } as Circle
    ]

    it('should find closest shape within max distance', () => {
      const closest = findClosestShape({ x: 110, y: 110 }, shapes, 100)
      expect(closest?.id).toBe('1')
    })

    it('should return undefined if no shape within max distance', () => {
      const closest = findClosestShape({ x: 1000, y: 1000 }, shapes, 100)
      expect(closest).toBeUndefined()
    })

    it('should find second closest shape when first is too far', () => {
      const closest = findClosestShape({ x: 290, y: 290 }, shapes, 200)
      expect(closest?.id).toBe('2')
    })
  })

  describe('detectConnection', () => {
    const shapes: Shape[] = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#FF0000',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      } as Rectangle,
      {
        id: 'rect2',
        type: 'rectangle',
        x: 300,
        y: 300,
        width: 100,
        height: 100,
        fill: '#00FF00',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      } as Rectangle
    ]

    it('should detect connection between two shapes', () => {
      const arrow: Arrow = {
        id: 'arrow1',
        type: 'arrow',
        x: 150, // Inside rect1
        y: 150,
        x2: 350, // Inside rect2
        y2: 350,
        stroke: '#000000',
        strokeWidth: 2,
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      const connection = detectConnection(arrow, shapes)
      expect(connection.fromShapeId).toBe('rect1')
      expect(connection.toShapeId).toBe('rect2')
    })

    it('should return undefined for shapes when arrow does not connect', () => {
      const arrow: Arrow = {
        id: 'arrow1',
        type: 'arrow',
        x: 0, // Not inside any shape
        y: 0,
        x2: 50,
        y2: 50,
        stroke: '#000000',
        strokeWidth: 2,
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      const connection = detectConnection(arrow, shapes)
      expect(connection.fromShapeId).toBeUndefined()
      expect(connection.toShapeId).toBeUndefined()
    })
  })

  describe('getConnectionPoint', () => {
    it('should calculate connection point on circle edge', () => {
      const circle: Circle = {
        id: '1',
        type: 'circle',
        x: 200,
        y: 200,
        radius: 50,
        fill: '#FF0000',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      // Point to the right of circle
      const point = getConnectionPoint(circle, { x: 300, y: 200 })
      expect(point.x).toBeCloseTo(250, 0) // 200 + 50
      expect(point.y).toBeCloseTo(200, 0)
    })

    it('should calculate connection point on rectangle edge', () => {
      const rect: Rectangle = {
        id: '1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#FF0000',
        createdBy: 'test',
        updatedAt: new Date().toISOString(),
        rotation: 0
      }

      // Point to the right of rectangle
      const point = getConnectionPoint(rect, { x: 300, y: 150 })
      expect(point.x).toBe(200) // Right edge
      expect(point.y).toBeCloseTo(150, 0)
    })
  })
})
