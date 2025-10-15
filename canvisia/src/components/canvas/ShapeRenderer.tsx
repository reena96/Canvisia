import { Rect, Circle as KonvaCircle, Line as KonvaLine, Text as KonvaText } from 'react-konva'
import type { Shape } from '@/types/shapes'

interface ShapeRendererProps {
  shape: Shape
  isSelected?: boolean
  onSelect?: () => void
  onDragMove?: (x: number, y: number) => void
  onDragEnd?: (x: number, y: number) => void
}

export function ShapeRenderer({
  shape,
  isSelected,
  onSelect,
  onDragMove,
  onDragEnd,
}: ShapeRendererProps) {
  const handleDragStart = (e: any) => {
    e.cancelBubble = true // Prevent Stage from dragging while shape is being dragged
  }

  const handleDragMove = (e: any) => {
    e.cancelBubble = true // Prevent Stage from dragging during shape drag
    const node = e.target
    onDragMove?.(node.x(), node.y())
  }

  const handleDragEnd = (e: any) => {
    e.cancelBubble = true // Prevent event from bubbling to Stage
    const node = e.target
    onDragEnd?.(node.x(), node.y())
  }

  switch (shape.type) {
    case 'rectangle':
      return (
        <Rect
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          fill={shape.fill}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? 2 : shape.strokeWidth || 0}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      )

    case 'circle':
      return (
        <KonvaCircle
          id={shape.id}
          x={shape.x}
          y={shape.y}
          radius={shape.radius}
          fill={shape.fill}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? 2 : shape.strokeWidth || 0}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      )

    case 'line':
      return (
        <KonvaLine
          id={shape.id}
          x={shape.x}
          y={shape.y}
          points={[0, 0, shape.x2 - shape.x, shape.y2 - shape.y]}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      )

    case 'text':
      return (
        <KonvaText
          id={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          fontFamily={shape.fontFamily || 'Arial'}
          fill={isSelected ? '#3B82F6' : shape.fill}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />
      )

    default:
      // Exhaustive type checking - should never reach here
      return null
  }
}
