import { FontPicker } from './FontPicker'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

interface FloatingTextToolbarProps {
  position: { x: number; y: number }
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline' | 'line-through'
  align: 'left' | 'center' | 'right'
  lineHeight: number
  color: string
  onFontFamilyChange: (font: string) => void
  onFontSizeChange: (size: number) => void
  onToggleBold: () => void
  onToggleItalic: () => void
  onToggleUnderline: () => void
  onAlignChange: (align: 'left' | 'center' | 'right') => void
  onLineHeightChange: (lineHeight: number) => void
  onColorChange: (color: string) => void
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 24, 32, 48, 64, 96]
const LINE_HEIGHTS = [1.0, 1.2, 1.5, 2.0]

export function FloatingTextToolbar({
  position,
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
  textDecoration,
  align,
  lineHeight,
  color,
  onFontFamilyChange,
  onFontSizeChange,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onAlignChange,
  onLineHeightChange,
  onColorChange,
}: FloatingTextToolbarProps) {
  const isBold = fontWeight === 700
  const isItalic = fontStyle === 'italic'
  const isUnderline = textDecoration === 'underline'

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10000,
        transform: 'translateY(-100%) translateY(-12px)',
      }}
    >
      {/* Font Family */}
      <FontPicker currentFont={fontFamily} onFontChange={onFontFamilyChange} />

      {/* Font Size */}
      <select
        value={fontSize}
        onChange={(e) => onFontSizeChange(Number(e.target.value))}
        style={{
          padding: '6px 8px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: 'white',
        }}
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }} />

      {/* Bold */}
      <button
        onClick={onToggleBold}
        title="Bold"
        style={{
          width: '32px',
          height: '32px',
          border: isBold ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: isBold ? '#EFF6FF' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bold size={16} />
      </button>

      {/* Italic */}
      <button
        onClick={onToggleItalic}
        title="Italic"
        style={{
          width: '32px',
          height: '32px',
          border: isItalic ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: isItalic ? '#EFF6FF' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Italic size={16} />
      </button>

      {/* Underline */}
      <button
        onClick={onToggleUnderline}
        title="Underline"
        style={{
          width: '32px',
          height: '32px',
          border: isUnderline ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: isUnderline ? '#EFF6FF' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Underline size={16} />
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }} />

      {/* Align Left */}
      <button
        onClick={() => onAlignChange('left')}
        title="Align Left"
        style={{
          width: '32px',
          height: '32px',
          border: align === 'left' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: align === 'left' ? '#EFF6FF' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlignLeft size={16} />
      </button>

      {/* Align Center */}
      <button
        onClick={() => onAlignChange('center')}
        title="Align Center"
        style={{
          width: '32px',
          height: '32px',
          border: align === 'center' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: align === 'center' ? '#EFF6FF' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlignCenter size={16} />
      </button>

      {/* Align Right */}
      <button
        onClick={() => onAlignChange('right')}
        title="Align Right"
        style={{
          width: '32px',
          height: '32px',
          border: align === 'right' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: align === 'right' ? '#EFF6FF' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlignRight size={16} />
      </button>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }} />

      {/* Color Picker */}
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        title="Text Color"
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      />

      {/* Line Height */}
      <select
        value={lineHeight}
        onChange={(e) => onLineHeightChange(Number(e.target.value))}
        title="Line Height"
        style={{
          padding: '6px 8px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          backgroundColor: 'white',
          width: '70px',
        }}
      >
        {LINE_HEIGHTS.map((lh) => (
          <option key={lh} value={lh}>
            ↕ {lh}
          </option>
        ))}
      </select>
    </div>
  )
}
