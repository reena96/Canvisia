import type { Shape } from '@/types/shapes'

export function buildContext(shapes: Shape[]): string {
  if (shapes.length === 0) {
    return 'Canvas is empty. No shapes present.'
  }

  // Summarize canvas state
  const summary = {
    totalShapes: shapes.length,
    shapesByType: {} as Record<string, number>,
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
