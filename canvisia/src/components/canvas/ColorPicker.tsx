import { useState, useEffect } from 'react'

interface ColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
  position?: { x: number; y: number }
}

const DEFAULT_PALETTE = [
  '#000000', '#FFFFFF', '#EF4444', '#F59E0B', '#FBBF24', '#10B981',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937', '#F3F4F6',
]

export function ColorPicker({ currentColor, onColorChange, position }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hexInput, setHexInput] = useState(currentColor)
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Load recent colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('canvisia-recent-colors')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentColors(parsed)
      } catch (e) {
        console.error('Failed to parse recent colors:', e)
      }
    }
  }, [])

  // Update hex input when current color changes
  useEffect(() => {
    setHexInput(currentColor)
  }, [currentColor])

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    addToRecentColors(color)
    setIsOpen(false)
  }

  const addToRecentColors = (color: string) => {
    const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, 12)
    setRecentColors(updated)
    localStorage.setItem('canvisia-recent-colors', JSON.stringify(updated))
  }

  const handleHexSubmit = () => {
    let color = hexInput.trim()
    // Add # if missing
    if (!color.startsWith('#')) {
      color = '#' + color
    }
    // Validate hex color
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      handleColorSelect(color)
    } else {
      alert('Invalid hex color. Please use format: #RRGGBB')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleHexSubmit()
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Color swatch button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Change color"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '4px',
          border: '2px solid #E5E7EB',
          backgroundColor: currentColor,
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2px #3B82F6' : 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = 'scale(1.1)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      />

      {/* Color picker popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
            }}
          />

          {/* Popover */}
          <div
            style={{
              position: 'absolute',
              left: position?.x || '0',
              top: position?.y || '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              padding: '12px',
              zIndex: 9999,
              width: '220px',
            }}
          >
            {/* Hex input */}
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Hex
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="#000000"
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                />
                <button
                  onClick={handleHexSubmit}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Default palette */}
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#6B7280',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Default Colors
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '6px',
                }}
              >
                {DEFAULT_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '4px',
                      border: currentColor === color ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Recent colors */}
            {recentColors.length > 0 && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6B7280',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Recent Colors
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '6px',
                  }}
                >
                  {recentColors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '4px',
                        border: currentColor === color ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                        backgroundColor: color,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
