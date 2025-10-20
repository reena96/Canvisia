import type { Shape } from '@/types/shapes'

export function buildContext(shapes: Shape[], selectedShapeIds: string[] = []): string {
  if (shapes.length === 0) {
    return 'Canvas is empty. No shapes present.'
  }

  // Get selected shapes details
  const selectedShapes = selectedShapeIds.length > 0
    ? shapes.filter(s => selectedShapeIds.includes(s.id))
    : []

  // Summarize canvas state
  const summary = {
    totalShapes: shapes.length,
    shapesByType: {} as Record<string, number>,
    selectedShapes: selectedShapes.length > 0 ? {
      count: selectedShapes.length,
      shapes: selectedShapes.map(s => ({
        id: s.id,
        type: s.type,
        x: s.x,
        y: s.y,
        fill: 'fill' in s ? (s as any).fill : undefined,
        stroke: 'stroke' in s ? (s as any).stroke : undefined,
      }))
    } : null,
    recentShapes: shapes.slice(-5).map(s => ({
      id: s.id,
      type: s.type,
      x: s.x,
      y: s.y
    }))
  }

  shapes.forEach(shape => {
    summary.shapesByType[shape.type] = (summary.shapesByType[shape.type] || 0) + 1
  })

  return JSON.stringify(summary, null, 2)
}
