import type { Shape } from '@/types/shapes'

/**
 * Get the display name for a shape type
 * @param shape - The shape object
 * @returns User-friendly display name
 */
export function getShapeName(shape: Shape): string {
  switch (shape.type) {
    case 'rectangle':
      return 'Rectangle'
    case 'circle':
      return 'Circle'
    case 'line':
      return 'Line'
    case 'text':
      return 'Text'
    case 'triangle':
      return 'Triangle'
    case 'pentagon':
      return 'Pentagon'
    case 'hexagon':
      return 'Hexagon'
    case 'star':
      return 'Star'
    case 'arrow':
      return 'Arrow'
    case 'bidirectionalArrow':
      return 'Bidirectional Arrow'
    case 'bentConnector':
      return 'Bent Connector'
    default:
      // Exhaustive type check
      const _exhaustive: never = shape
      return 'Unknown'
  }
}
