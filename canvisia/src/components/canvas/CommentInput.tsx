import { useState, useRef, useEffect } from 'react'
import { X as CloseIcon, Check } from 'lucide-react'

interface CommentInputProps {
  position: { x: number; y: number }
  onSubmit: (comment: string) => void
  onCancel: () => void
}

export function CommentInput({ position, onSubmit, onCancel }: CommentInputProps) {
  const [comment, setComment] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [comment])

  const handleSubmit = () => {
    const trimmedComment = comment.trim()
    if (trimmedComment) {
      onSubmit(trimmedComment)
    } else {
      onCancel()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 10001,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '12px',
        width: '320px',
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1F2937',
          }}
        >
          Add Comment
        </span>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#6B7280',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type your comment..."
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '8px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          resize: 'vertical',
          outline: 'none',
          color: '#1F2937',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#8B5CF6'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB'
        }}
      />

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
          }}
        >
          Press Esc to cancel • Cmd/Ctrl+Enter to submit
        </span>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          style={{
            padding: '6px 12px',
            backgroundColor: comment.trim() ? '#8B5CF6' : '#E5E7EB',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: comment.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (comment.trim()) {
              e.currentTarget.style.backgroundColor = '#7C3AED'
            }
          }}
          onMouseLeave={(e) => {
            if (comment.trim()) {
              e.currentTarget.style.backgroundColor = '#8B5CF6'
            }
          }}
        >
          <Check size={16} />
          Submit
        </button>
      </div>
    </div>
  )
}
