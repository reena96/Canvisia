import type { Shape } from '@/types/shapes'

export function buildContext(shapes: Shape[], selectedShapeIds: string[] = []): string {
  if (shapes.length === 0) {
    return 'Canvas is empty. No shapes present.'
  }

  // Get selected shapes details
  const selectedShapes = selectedShapeIds.length > 0
    ? shapes.filter(s => selectedShapeIds.includes(s.id))
    : []

  // Build groups information
  const groupsMap = new Map<string, { groupId: string, groupName: string, groupType: string, count: number }>()
  shapes.forEach(shape => {
    if (shape.groupId && shape.groupName) {
      const existing = groupsMap.get(shape.groupId)
      if (existing) {
        existing.count++
      } else {
        groupsMap.set(shape.groupId, {
          groupId: shape.groupId,
          groupName: shape.groupName,
          groupType: shape.groupType || 'custom',
          count: 1
        })
      }
    }
  })

  // Summarize canvas state
  const summary = {
    totalShapes: shapes.length,
    shapesByType: {} as Record<string, number>,
    groups: groupsMap.size > 0 ? Array.from(groupsMap.values()).map(g => ({
      name: g.groupName,
      type: g.groupType,
      shapeCount: g.count
    })) : null,
    selectedShapes: selectedShapes.length > 0 ? {
      count: selectedShapes.length,
      shapes: selectedShapes.map(s => ({
        id: s.id,
        type: s.type,
        x: s.x,
        y: s.y,
        fill: 'fill' in s ? (s as any).fill : undefined,
        stroke: 'stroke' in s ? (s as any).stroke : undefined,
        groupName: s.groupName || null,
      }))
    } : null,
    recentShapes: shapes.slice(-5).map(s => ({
      id: s.id,
      type: s.type,
      x: s.x,
      y: s.y,
      groupName: s.groupName || null,
    }))
  }

  shapes.forEach(shape => {
    summary.shapesByType[shape.type] = (summary.shapesByType[shape.type] || 0) + 1
  })

  return JSON.stringify(summary, null, 2)
}
