import { Rect, Circle as KonvaCircle, Ellipse as KonvaEllipse, Line as KonvaLine, Text as KonvaText, Image as KonvaImage, RegularPolygon, Star as KonvaStar, Arrow as KonvaArrow, Group } from 'react-konva'
import { useState } from 'react'
import type { Shape } from '@/types/shapes'
import { useCanvasStore } from '@/stores/canvasStore'

interface ShapeRendererProps {
  shape: Shape
  isSelected?: boolean
  onSelect?: () => void
  onDragMove?: (x: number, y: number) => void
  onDragEnd?: (x: number, y: number) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function ShapeRenderer({
  shape,
  isSelected,
  onSelect,
  onDragMove,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
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
          offsetX={shape.width / 2}
          offsetY={shape.height / 2}
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'ellipse':
      return (
        <KonvaEllipse
          id={shape.id}
          x={shape.x}
          y={shape.y}
          radiusX={shape.radiusX}
          radiusY={shape.radiusY}
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'roundedRectangle':
      return (
        <Rect
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          offsetX={shape.width / 2}
          offsetY={shape.height / 2}
          cornerRadius={shape.cornerRadius}
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'cylinder':
      // Draw a cylinder using Group with ellipses and rectangle
      const topEllipseHeight = shape.width / 4
      return (
        <Group
          id={shape.id}
          x={shape.x}
          y={shape.y}
          offsetX={shape.width / 2}
          offsetY={shape.height / 2}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Cylinder body */}
          <Rect
            x={0}
            y={topEllipseHeight / 2}
            width={shape.width}
            height={shape.height - topEllipseHeight}
            fill={shape.fill}
            stroke={isSelected ? '#3B82F6' : shape.stroke}
            strokeWidth={isSelected ? 2 : shape.strokeWidth || 0}
          />
          {/* Top ellipse */}
          <KonvaEllipse
            x={shape.width / 2}
            y={topEllipseHeight / 2}
            radiusX={shape.width / 2}
            radiusY={topEllipseHeight / 2}
            fill={shape.fill}
            stroke={isSelected ? '#3B82F6' : shape.stroke}
            strokeWidth={isSelected ? 2 : shape.strokeWidth || 0}
          />
          {/* Bottom ellipse */}
          <KonvaEllipse
            x={shape.width / 2}
            y={shape.height - topEllipseHeight / 2}
            radiusX={shape.width / 2}
            radiusY={topEllipseHeight / 2}
            fill={shape.fill}
            stroke={isSelected ? '#3B82F6' : shape.stroke}
            strokeWidth={isSelected ? 2 : shape.strokeWidth || 0}
          />
        </Group>
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'text': {
      // Combine fontWeight and fontStyle for Konva
      const fontStyleValue = shape.fontWeight === 700
        ? (shape.fontStyle === 'italic' ? 'bold italic' : 'bold')
        : (shape.fontStyle === 'italic' ? 'italic' : 'normal')

      const handleDoubleClick = () => {
        useCanvasStore.getState().setEditingTextId(shape.id)
      }

      // Check if this text is currently being edited
      const isEditing = useCanvasStore.getState().editingTextId === shape.id

      // Fallback for height if not present (backward compatibility)
      const textHeight = shape.height || (shape.fontSize * shape.lineHeight * 3)

      return (
        <KonvaText
          id={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={textHeight}
          text={shape.text || 'Text'}
          fontSize={shape.fontSize}
          fontFamily={shape.fontFamily}
          fontStyle={fontStyleValue}
          textDecoration={shape.textDecoration}
          align={shape.align}
          lineHeight={shape.lineHeight}
          fill={shape.fill}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDblClick={handleDoubleClick}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          opacity={isEditing ? 0 : 1}
        />
      )
    }

    case 'image': {
      const [image] = useState(() => {
        const img = new window.Image()
        img.src = shape.src
        return img
      })

      return (
        <KonvaImage
          id={shape.id}
          x={shape.x}
          y={shape.y}
          image={image}
          width={shape.width}
          height={shape.height}
          opacity={shape.opacity !== undefined ? shape.opacity : 1}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          stroke={isSelected ? '#3B82F6' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      )
    }

    case 'triangle':
      return (
        <RegularPolygon
          id={shape.id}
          x={shape.x}
          y={shape.y}
          sides={3}
          radius={shape.radiusX} // Use radiusX as base radius
          scaleX={1}
          scaleY={shape.radiusY / shape.radiusX} // Scale Y to achieve radiusY
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'pentagon':
      return (
        <RegularPolygon
          id={shape.id}
          x={shape.x}
          y={shape.y}
          sides={5}
          radius={shape.radiusX} // Use radiusX as base radius
          scaleX={1}
          scaleY={shape.radiusY / shape.radiusX} // Scale Y to achieve radiusY
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'hexagon':
      return (
        <RegularPolygon
          id={shape.id}
          x={shape.x}
          y={shape.y}
          sides={6}
          radius={shape.radiusX} // Use radiusX as base radius
          scaleX={1}
          scaleY={shape.radiusY / shape.radiusX} // Scale Y to achieve radiusY
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'star':
      return (
        <KonvaStar
          id={shape.id}
          x={shape.x}
          y={shape.y}
          numPoints={shape.numPoints}
          innerRadius={shape.innerRadiusX} // Use innerRadiusX as base
          outerRadius={shape.outerRadiusX} // Use outerRadiusX as base
          scaleX={1}
          scaleY={shape.outerRadiusY / shape.outerRadiusX} // Scale Y to achieve outerRadiusY
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'arrow':
      return (
        <KonvaArrow
          id={shape.id}
          x={shape.x}
          y={shape.y}
          points={[0, 0, shape.x2 - shape.x, shape.y2 - shape.y]}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
          fill={isSelected ? '#3B82F6' : shape.stroke}
          pointerLength={shape.pointerLength}
          pointerWidth={shape.pointerWidth}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'bidirectionalArrow':
      return (
        <KonvaArrow
          id={shape.id}
          x={shape.x}
          y={shape.y}
          points={[0, 0, shape.x2 - shape.x, shape.y2 - shape.y]}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
          fill={isSelected ? '#3B82F6' : shape.stroke}
          pointerLength={shape.pointerLength}
          pointerWidth={shape.pointerWidth}
          pointerAtBeginning={true}
          pointerAtEnding={true}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    case 'bentConnector':
      return (
        <KonvaLine
          id={shape.id}
          x={shape.x}
          y={shape.y}
          points={[
            0,
            0,
            shape.bendX - shape.x,
            shape.bendY - shape.y,
            shape.x2 - shape.x,
            shape.y2 - shape.y,
          ]}
          stroke={isSelected ? '#3B82F6' : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 1 : shape.strokeWidth}
          rotation={shape.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )

    default:
      // Exhaustive type checking - should never reach here
      return null
  }
}
