import { useEffect, useRef } from 'react'
import type { Text } from '@/types/shapes'

interface TextEditOverlayProps {
  shape: Text
  stagePosition: { x: number; y: number }
  stageScale: number
  onTextChange: (text: string) => void
  onExitEdit: () => void
}

export function TextEditOverlay({
  shape,
  stagePosition,
  stageScale,
  onTextChange,
  onExitEdit,
}: TextEditOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate screen position
  const screenX = shape.x * stageScale + stagePosition.x
  const screenY = shape.y * stageScale + stagePosition.y

  // Auto-focus and select text on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  // Handle ESC key to exit edit mode
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onExitEdit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExitEdit])

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [shape.text])

  // Match text styling exactly from shape properties
  const fontWeight = shape.fontWeight === 700 ? 'bold' : 'normal'
  const fontStyle = shape.fontStyle

  return (
    <textarea
      ref={textareaRef}
      value={shape.text}
      onChange={(e) => onTextChange(e.target.value)}
      onBlur={onExitEdit}
      style={{
        position: 'fixed',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${shape.width * stageScale}px`,
        minHeight: `${shape.fontSize * shape.lineHeight * stageScale}px`,
        fontFamily: shape.fontFamily,
        fontSize: `${shape.fontSize * stageScale}px`,
        fontWeight,
        fontStyle,
        textDecoration: shape.textDecoration,
        color: shape.fill,
        textAlign: shape.align,
        lineHeight: shape.lineHeight,
        backgroundColor: 'transparent',
        border: '2px solid #3B82F6',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        padding: '2px',
        zIndex: 9999,
      }}
    />
  )
}
