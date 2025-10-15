import { useState, useRef, useEffect } from 'react'
import { AVAILABLE_FONTS } from '@/utils/fontLoader'

interface FontPickerProps {
  currentFont: string
  onFontChange: (font: string) => void
}

export function FontPicker({ currentFont, onFontChange }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '140px',
          fontFamily: currentFont,
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{currentFont}</span>
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 10000,
            minWidth: '140px',
          }}
        >
          {AVAILABLE_FONTS.map((font) => (
            <button
              key={font}
              onClick={() => {
                onFontChange(font)
                setIsOpen(false)
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: currentFont === font ? '#EFF6FF' : 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: font,
              }}
              onMouseEnter={(e) => {
                if (currentFont !== font) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB'
                }
              }}
              onMouseLeave={(e) => {
                if (currentFont !== font) {
                  e.currentTarget.style.backgroundColor = 'white'
                }
              }}
            >
              {font}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
