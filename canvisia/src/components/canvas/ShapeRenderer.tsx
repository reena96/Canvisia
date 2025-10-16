import { Rect, Circle as KonvaCircle, Ellipse as KonvaEllipse, Line as KonvaLine, Text as KonvaText, Image as KonvaImage, RegularPolygon, Star as KonvaStar, Arrow as KonvaArrow, Group } from 'react-konva'
import { useState, useRef, useEffect } from 'react'
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

    case 'diamond':
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
          rotation={45}
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

      const textRef = useRef<any>(null)
      const [textWidth, setTextWidth] = useState(shape.fontSize * 10)

      // Get actual text width after render (height is fixed)
      useEffect(() => {
        if (textRef.current) {
          const actualWidth = textRef.current.width()
          if (actualWidth > 0) {
            setTextWidth(actualWidth)
          }
        }
      }, [shape.text, shape.fontSize, shape.fontFamily, shape.lineHeight])

      // Fixed height based on single line
      const textHeight = shape.fontSize * shape.lineHeight

      return (
        <Group
          id={shape.id}
          x={shape.x}
          y={shape.y}
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
        >
          {/* Selection box - hide during editing */}
          {isSelected && !isEditing && (
            <Rect
              x={-4}
              y={-2}
              width={textWidth + 8}
              height={textHeight + 4}
              stroke="#3B82F6"
              strokeWidth={1}
              fill="transparent"
            />
          )}
          {/* Text */}
          <KonvaText
            ref={textRef}
            x={0}
            y={0}
            text={shape.text}
            fontSize={shape.fontSize}
            fontFamily={shape.fontFamily}
            fontStyle={fontStyleValue}
            textDecoration={shape.textDecoration}
            align={shape.align}
            lineHeight={shape.lineHeight}
            fill={shape.fill}
            opacity={isEditing ? 0 : 1}
          />
        </Group>
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

    case 'pentagon':
      return (
        <RegularPolygon
          id={shape.id}
          x={shape.x}
          y={shape.y}
          sides={5}
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

    case 'hexagon':
      return (
        <RegularPolygon
          id={shape.id}
          x={shape.x}
          y={shape.y}
          sides={6}
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

    case 'star':
      return (
        <KonvaStar
          id={shape.id}
          x={shape.x}
          y={shape.y}
          numPoints={shape.numPoints}
          innerRadius={shape.innerRadius}
          outerRadius={shape.outerRadius}
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
