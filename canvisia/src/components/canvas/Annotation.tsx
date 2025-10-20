import { Group, Rect, Text, Line } from 'react-konva'
import type { Annotation as AnnotationType } from '@/types/shapes'

interface AnnotationProps {
  annotation: AnnotationType
  shapeX: number
  shapeY: number
  viewport: { zoom: number }
}

/**
 * Annotation component - displays a comment bubble attached to a shape
 * Shows user avatar, name, timestamp, and comment text
 */
export function Annotation({ annotation, shapeX, shapeY, viewport }: AnnotationProps) {
  // Position annotation above and to the right of the shape
  const offsetX = annotation.offsetX || 50
  const offsetY = annotation.offsetY || -80
  const annotationX = shapeX + offsetX
  const annotationY = shapeY + offsetY

  // Dimensions
  const padding = 12
  const avatarSize = 32
  const maxWidth = 250
  const fontSize = 14
  const lineHeight = 1.4

  // Extract first initial from user name
  const initial = annotation.userName.charAt(0).toUpperCase()

  // Format timestamp
  const getTimeAgo = (timestamp: Date | number): string => {
    const now = Date.now()
    const time = typeof timestamp === 'number' ? timestamp : timestamp.getTime()
    const diff = now - time

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const timeAgo = getTimeAgo(annotation.createdAt)

  // Calculate text dimensions (approximate)
  const headerHeight = avatarSize + padding
  const commentLines = Math.ceil(annotation.comment.length / 30) // Rough estimate
  const commentHeight = commentLines * fontSize * lineHeight
  const totalHeight = headerHeight + commentHeight + padding * 2

  return (
    <Group>
      {/* Connector line from annotation to shape */}
      <Line
        points={[shapeX, shapeY, annotationX + padding, annotationY + totalHeight]}
        stroke="#E5E7EB"
        strokeWidth={2 / viewport.zoom}
        listening={false}
      />

      {/* Annotation bubble background */}
      <Rect
        x={annotationX}
        y={annotationY}
        width={maxWidth}
        height={totalHeight}
        fill="white"
        cornerRadius={8 / viewport.zoom}
        shadowColor="rgba(0, 0, 0, 0.15)"
        shadowBlur={12 / viewport.zoom}
        shadowOffset={{ x: 0, y: 4 / viewport.zoom }}
        shadowOpacity={1}
        stroke="#E5E7EB"
        strokeWidth={1 / viewport.zoom}
      />

      {/* User avatar circle */}
      <Rect
        x={annotationX + padding}
        y={annotationY + padding}
        width={avatarSize}
        height={avatarSize}
        fill={annotation.userColor}
        cornerRadius={avatarSize / 2}
      />

      {/* User initial */}
      <Text
        x={annotationX + padding}
        y={annotationY + padding}
        width={avatarSize}
        height={avatarSize}
        text={initial}
        fontSize={16}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill="white"
        align="center"
        verticalAlign="middle"
      />

      {/* User name */}
      <Text
        x={annotationX + padding + avatarSize + 8}
        y={annotationY + padding}
        text={annotation.userName}
        fontSize={14}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill="#1F2937"
      />

      {/* Timestamp */}
      <Text
        x={annotationX + padding + avatarSize + 8}
        y={annotationY + padding + 18}
        text={timeAgo}
        fontSize={12}
        fontFamily="Inter, sans-serif"
        fill="#6B7280"
      />

      {/* Comment text */}
      <Text
        x={annotationX + padding}
        y={annotationY + headerHeight + padding}
        width={maxWidth - padding * 2}
        text={annotation.comment}
        fontSize={fontSize}
        fontFamily="Inter, sans-serif"
        fill="#1F2937"
        lineHeight={lineHeight}
        wrap="word"
      />
    </Group>
  )
}
