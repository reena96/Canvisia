import { useEffect, useRef, useState } from 'react'
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
  const [initialWidth, setInitialWidth] = useState<number | null>(null)

  // Calculate screen position to match selection box (with padding offset)
  const screenX = shape.x * stageScale + stagePosition.x - 4
  const screenY = shape.y * stageScale + stagePosition.y - 2

  // Auto-focus, select text, and measure initial width on mount
  useEffect(() => {
    if (textareaRef.current) {
      // Measure the initial text width with padding to match selection box
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        const fontWeight = shape.fontWeight === 700 ? 'bold' : 'normal'
        const fontStyle = shape.fontStyle
        context.font = `${fontStyle} ${fontWeight} ${shape.fontSize * stageScale}px ${shape.fontFamily}`
        // Measure placeholder text if shape text is empty
        const metrics = context.measureText(shape.text || 'Add text')
        // Add 16px for horizontal padding (8px on each side to account for borders and spacing)
        setInitialWidth(metrics.width + 16)
      }

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

  // Auto-resize textarea both width and height
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to minimum to get accurate scrollHeight
      textareaRef.current.style.height = '0px'

      // Set height based on content (scrollHeight includes padding)
      const newHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${newHeight}px`

      // Temporarily set width to auto to measure content
      textareaRef.current.style.width = 'auto'

      // Get the scroll width and add 16px for padding (8px each side to fully cover text)
      const newWidth = textareaRef.current.scrollWidth + 16
      textareaRef.current.style.width = `${newWidth}px`
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
      placeholder="Add text"
      style={{
        position: 'fixed',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: initialWidth ? `${initialWidth}px` : `${shape.fontSize * stageScale * 2}px`,
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
        padding: '4px 8px',
        boxSizing: 'border-box',
        zIndex: 9999,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    />
  )
}
