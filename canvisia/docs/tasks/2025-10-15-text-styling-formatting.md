# Text Styling and Formatting Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Add comprehensive Figma-like text editing with drag-to-create, inline editing, and a floating formatting toolbar with font picker, styling controls, and advanced typography options.

**Architecture:** HTML textarea overlay for editing synced with Konva.Text for rendering. Floating toolbar appears when text is selected. Google Fonts integration for font family picker. State managed via Zustand for text editing mode and selection.

**Tech Stack:** React, Konva, react-konva, Zustand, Google Fonts API, TypeScript

---

## Task 1: Update Text Shape Type and Defaults

**Files:**
- Modify: `src/types/shapes.ts:75-86`
- Modify: `src/utils/shapeDefaults.ts:96-113`

**Step 1: Update Text interface with new properties**

In `src/types/shapes.ts`, replace the Text interface:

```typescript
export interface Text extends BaseShape {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string; // Now required
  fill: string;
  fontWeight: number; // 400 (normal), 700 (bold)
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  align: 'left' | 'center' | 'right';
  lineHeight: number; // Multiplier: 1.0, 1.2, 1.5, etc.
  width: number; // Now required
}
```

**Step 2: Update createDefaultText function**

In `src/utils/shapeDefaults.ts`, replace the createDefaultText function:

```typescript
export function createDefaultText(
  x: number,
  y: number,
  userId: string = 'anonymous',
  color: string = '#1F2937'
): Text {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x,
    y,
    text: 'Double-click to edit',
    fontSize: 16,
    fontFamily: 'Inter',
    fill: color,
    fontWeight: 400,
    fontStyle: 'normal',
    textDecoration: 'none',
    align: 'left',
    lineHeight: 1.2,
    width: 200, // Default width
    createdBy: userId,
    updatedAt: new Date().toISOString(),
  }
}
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: No TypeScript errors related to Text type

**Step 4: Commit**

```bash
git add src/types/shapes.ts src/utils/shapeDefaults.ts
git commit -m "feat: update Text shape type with advanced typography properties"
```

---

## Task 2: Add Google Fonts to Project

**Files:**
- Create: `src/utils/fontLoader.ts`
- Modify: `index.html` (add Google Fonts link)

**Step 1: Add Google Fonts link to HTML**

In `index.html`, add in the `<head>` section:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Lato:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
```

**Step 2: Create font loader utility**

Create `src/utils/fontLoader.ts`:

```typescript
export const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
] as const

export type FontFamily = typeof AVAILABLE_FONTS[number]

export const DEFAULT_FONT: FontFamily = 'Inter'

export function isFontLoaded(fontFamily: string): boolean {
  return document.fonts.check(`16px "${fontFamily}"`)
}

export async function loadFont(fontFamily: string): Promise<void> {
  if (isFontLoaded(fontFamily)) {
    return
  }

  try {
    await document.fonts.load(`16px "${fontFamily}"`)
  } catch (error) {
    console.warn(`Failed to load font: ${fontFamily}`, error)
  }
}
```

**Step 3: Test font loading in browser console**

Run: `npm run dev`
Open browser console and test:
```javascript
document.fonts.check('16px "Inter"')
// Should return true
```

**Step 4: Commit**

```bash
git add index.html src/utils/fontLoader.ts
git commit -m "feat: add Google Fonts integration and font loader utility"
```

---

## Task 3: Create FontPicker Component

**Files:**
- Create: `src/components/canvas/FontPicker.tsx`

**Step 1: Create FontPicker component**

Create `src/components/canvas/FontPicker.tsx`:

```typescript
import { useState, useRef, useEffect } from 'react'
import { AVAILABLE_FONTS, type FontFamily } from '@/utils/fontLoader'

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
```

**Step 2: Test the component visually**

Add temporary test in `Canvas.tsx` to verify styling.

**Step 3: Commit**

```bash
git add src/components/canvas/FontPicker.tsx
git commit -m "feat: create FontPicker dropdown component"
```

---

## Task 4: Create FloatingTextToolbar Component

**Files:**
- Create: `src/components/canvas/FloatingTextToolbar.tsx`

**Step 1: Create FloatingTextToolbar component**

Create `src/components/canvas/FloatingTextToolbar.tsx`:

```typescript
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
```

**Step 2: Verify component compiles**

Run: `npm run build`
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/components/canvas/FloatingTextToolbar.tsx
git commit -m "feat: create FloatingTextToolbar with all formatting controls"
```

---

## Task 5: Create TextEditOverlay Component

**Files:**
- Create: `src/components/canvas/TextEditOverlay.tsx`

**Step 1: Create TextEditOverlay component**

Create `src/components/canvas/TextEditOverlay.tsx`:

```typescript
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onExitEdit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onExitEdit])

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
```

**Step 2: Test overlay positioning**

Temporarily add to Canvas to verify screen coordinate calculation works correctly.

**Step 3: Commit**

```bash
git add src/components/canvas/TextEditOverlay.tsx
git commit -m "feat: create TextEditOverlay for inline text editing"
```

---

## Task 6: Update Canvas Component for Text Creation

**Files:**
- Modify: `src/components/canvas/Canvas.tsx`

**Step 1: Add text creation state**

In `Canvas.tsx`, add state for text drag creation:

```typescript
const [isCreatingText, setIsCreatingText] = useState(false)
const [textStartPos, setTextStartPos] = useState<{ x: number; y: number } | null>(null)
const [textPreviewWidth, setTextPreviewWidth] = useState(0)
```

**Step 2: Update handleStageMouseDown for text tool**

Find the `handleStageMouseDown` function and update the text case:

```typescript
case 'text': {
  const canvasPos = getRelativePointerPosition()
  if (!canvasPos) break

  setIsCreatingText(true)
  setTextStartPos(canvasPos)
  setTextPreviewWidth(0)
  break
}
```

**Step 3: Add handleStageMouseMove for text preview**

Add mouse move handler:

```typescript
const handleStageMouseMove = () => {
  if (!isCreatingText || !textStartPos) return

  const canvasPos = getRelativePointerPosition()
  if (!canvasPos) return

  const width = Math.abs(canvasPos.x - textStartPos.x)
  setTextPreviewWidth(width)
}
```

**Step 4: Add handleStageMouseUp for text creation**

Add mouse up handler:

```typescript
const handleStageMouseUp = () => {
  if (isCreatingText && textStartPos) {
    const canvasPos = getRelativePointerPosition()
    if (!canvasPos) return

    const width = Math.max(Math.abs(canvasPos.x - textStartPos.x), 50) // Minimum 50px
    const newShape = createDefaultText(textStartPos.x, textStartPos.y, userId, userColor)
    newShape.width = width

    addShape(newShape)
    setIsCreatingText(false)
    setTextStartPos(null)
    setTextPreviewWidth(0)
  }
}
```

**Step 5: Attach event handlers to Stage**

Update Stage component:

```typescript
<Stage
  // ... existing props
  onMouseMove={handleStageMouseMove}
  onMouseUp={handleStageMouseUp}
>
```

**Step 6: Test text drag creation**

Run: `npm run dev`
Test: Click text tool, drag on canvas, verify text box is created with correct width

**Step 7: Commit**

```bash
git add src/components/canvas/Canvas.tsx
git commit -m "feat: add drag-to-create text box functionality"
```

---

## Task 7: Add Text Edit Mode State Management

**Files:**
- Modify: `src/stores/canvasStore.ts` (or wherever Zustand store is)
- Modify: `src/components/canvas/Canvas.tsx`

**Step 1: Add text editing state to store**

In your Zustand store, add:

```typescript
interface CanvasState {
  // ... existing state
  editingTextId: string | null
  setEditingTextId: (id: string | null) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  // ... existing state
  editingTextId: null,
  setEditingTextId: (id) => set({ editingTextId: id }),
}))
```

**Step 2: Add state to Canvas component**

In `Canvas.tsx`:

```typescript
const editingTextId = useCanvasStore((state) => state.editingTextId)
const setEditingTextId = useCanvasStore((state) => state.setEditingTextId)
const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
```

**Step 3: Commit**

```bash
git add src/stores/canvasStore.ts src/components/canvas/Canvas.tsx
git commit -m "feat: add text editing state management"
```

---

## Task 8: Integrate TextEditOverlay into Canvas

**Files:**
- Modify: `src/components/canvas/Canvas.tsx`

**Step 1: Import TextEditOverlay**

```typescript
import { TextEditOverlay } from './TextEditOverlay'
```

**Step 2: Add overlay rendering**

After the Stage component, add:

```typescript
{/* Text Edit Overlay */}
{editingTextId && (() => {
  const editingShape = shapes.find(s => s.id === editingTextId)
  if (!editingShape || editingShape.type !== 'text') return null

  return (
    <TextEditOverlay
      shape={editingShape}
      stagePosition={{ x: stageX, y: stageY }}
      stageScale={scale}
      onTextChange={(text) => {
        updateShape(editingTextId, { text })
      }}
      onExitEdit={() => {
        setEditingTextId(null)
        // If text is empty, delete the shape
        if (editingShape.text.trim() === '') {
          deleteShape(editingTextId)
        }
      }}
    />
  )
})()}
```

**Step 3: Test edit overlay appears**

Run: `npm run dev`
Test: Create text, verify overlay can be triggered (will add double-click next)

**Step 4: Commit**

```bash
git add src/components/canvas/Canvas.tsx
git commit -m "feat: integrate TextEditOverlay into Canvas"
```

---

## Task 9: Add Double-Click to Edit

**Files:**
- Modify: `src/components/canvas/ShapeRenderer.tsx`

**Step 1: Import store hook**

```typescript
import { useCanvasStore } from '@/stores/canvasStore'
```

**Step 2: Add double-click handler for text**

In the text case of ShapeRenderer, add:

```typescript
case 'text': {
  const setEditingTextId = useCanvasStore.getState().setEditingTextId

  const handleDoubleClick = () => {
    setEditingTextId(shape.id)
  }

  return (
    <KonvaText
      // ... existing props
      onDblClick={handleDoubleClick}
    />
  )
}
```

**Step 3: Test double-click editing**

Run: `npm run dev`
Test: Create text, double-click it, verify overlay appears and can edit

**Step 4: Commit**

```bash
git add src/components/canvas/ShapeRenderer.tsx
git commit -m "feat: add double-click to edit text functionality"
```

---

## Task 10: Integrate FloatingTextToolbar

**Files:**
- Modify: `src/components/canvas/Canvas.tsx`

**Step 1: Import FloatingTextToolbar**

```typescript
import { FloatingTextToolbar } from './FloatingTextToolbar'
```

**Step 2: Add toolbar position calculation helper**

```typescript
function calculateToolbarPosition(shape: Text): { x: number; y: number } {
  const screenX = shape.x * scale + stageX
  const screenY = shape.y * scale + stageY

  // Position above the text by default
  const toolbarY = screenY - 60

  return { x: screenX, y: toolbarY }
}
```

**Step 3: Add toolbar rendering**

After Stage and TextEditOverlay:

```typescript
{/* Floating Text Toolbar */}
{selectedTextId && (() => {
  const selectedShape = shapes.find(s => s.id === selectedTextId)
  if (!selectedShape || selectedShape.type !== 'text') return null

  const position = calculateToolbarPosition(selectedShape)

  return (
    <FloatingTextToolbar
      position={position}
      fontFamily={selectedShape.fontFamily}
      fontSize={selectedShape.fontSize}
      fontWeight={selectedShape.fontWeight}
      fontStyle={selectedShape.fontStyle}
      textDecoration={selectedShape.textDecoration}
      align={selectedShape.align}
      lineHeight={selectedShape.lineHeight}
      color={selectedShape.fill}
      onFontFamilyChange={(fontFamily) => {
        updateShape(selectedTextId, { fontFamily })
      }}
      onFontSizeChange={(fontSize) => {
        updateShape(selectedTextId, { fontSize })
      }}
      onToggleBold={() => {
        const newWeight = selectedShape.fontWeight === 700 ? 400 : 700
        updateShape(selectedTextId, { fontWeight: newWeight })
      }}
      onToggleItalic={() => {
        const newStyle = selectedShape.fontStyle === 'italic' ? 'normal' : 'italic'
        updateShape(selectedTextId, { fontStyle: newStyle })
      }}
      onToggleUnderline={() => {
        const newDecoration = selectedShape.textDecoration === 'underline' ? 'none' : 'underline'
        updateShape(selectedTextId, { textDecoration: newDecoration })
      }}
      onAlignChange={(align) => {
        updateShape(selectedTextId, { align })
      }}
      onLineHeightChange={(lineHeight) => {
        updateShape(selectedTextId, { lineHeight })
      }}
      onColorChange={(fill) => {
        updateShape(selectedTextId, { fill })
      }}
    />
  )
})()}
```

**Step 4: Update shape selection handler**

```typescript
const handleShapeSelect = (shapeId: string) => {
  const shape = shapes.find(s => s.id === shapeId)
  if (shape?.type === 'text') {
    setSelectedTextId(shapeId)
  } else {
    setSelectedTextId(null)
  }
  // ... existing selection logic
}
```

**Step 5: Clear selection on stage click**

```typescript
const handleStageClick = (e: any) => {
  if (e.target === e.target.getStage()) {
    setSelectedTextId(null)
    // ... existing logic
  }
}
```

**Step 6: Test toolbar appears and updates text**

Run: `npm run dev`
Test:
- Create text
- Click to select
- Verify toolbar appears
- Test all formatting buttons work

**Step 7: Commit**

```bash
git add src/components/canvas/Canvas.tsx
git commit -m "feat: integrate FloatingTextToolbar with text selection"
```

---

## Task 11: Update ShapeRenderer for New Text Properties

**Files:**
- Modify: `src/components/canvas/ShapeRenderer.tsx`

**Step 1: Update text rendering with all properties**

In the text case, update the KonvaText props:

```typescript
case 'text': {
  const setEditingTextId = useCanvasStore.getState().setEditingTextId

  const handleDoubleClick = () => {
    setEditingTextId(shape.id)
  }

  return (
    <KonvaText
      id={shape.id}
      x={shape.x}
      y={shape.y}
      text={shape.text}
      fontSize={shape.fontSize}
      fontFamily={shape.fontFamily}
      fill={shape.fill}
      fontStyle={shape.fontStyle}
      textDecoration={shape.textDecoration}
      align={shape.align}
      width={shape.width}
      lineHeight={shape.lineHeight}
      draggable={!isSelected}
      onDragMove={(e) => {
        const node = e.target
        onDragMove?.(node.x(), node.y())
      }}
      onDragEnd={(e) => {
        const node = e.target
        onDragEnd?.(node.x(), node.y())
      }}
      onClick={onSelect}
      onDblClick={handleDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      // Apply font weight separately
      {...(shape.fontWeight === 700 && { fontStyle: 'bold' + (shape.fontStyle === 'italic' ? ' italic' : '') })}
    />
  )
}
```

**Step 2: Fix font weight application**

Actually, Konva doesn't have fontWeight, we need to handle it differently:

```typescript
const fontStyleValue = shape.fontWeight === 700
  ? (shape.fontStyle === 'italic' ? 'bold italic' : 'bold')
  : (shape.fontStyle === 'italic' ? 'italic' : 'normal')

return (
  <KonvaText
    // ... other props
    fontStyle={fontStyleValue}
  />
)
```

**Step 3: Test all properties render correctly**

Run: `npm run dev`
Test each property:
- Font family changes
- Font size changes
- Bold works
- Italic works
- Underline works
- Alignment works
- Line height works
- Color works

**Step 4: Commit**

```bash
git add src/components/canvas/ShapeRenderer.tsx
git commit -m "feat: update text rendering with all typography properties"
```

---

## Task 12: Handle Edge Cases and Cleanup

**Files:**
- Modify: `src/components/canvas/Canvas.tsx`
- Modify: `src/components/canvas/TextEditOverlay.tsx`
- Modify: `src/components/canvas/FloatingTextToolbar.tsx`

**Step 1: Fix toolbar positioning for screen edges**

In `Canvas.tsx`, update `calculateToolbarPosition`:

```typescript
function calculateToolbarPosition(shape: Text): { x: number; y: number } {
  const screenX = shape.x * scale + stageX
  const screenY = shape.y * scale + stageY

  const toolbarHeight = 60
  const toolbarWidth = 700 // Approximate

  let x = screenX
  let y = screenY - toolbarHeight - 12

  // If toolbar would go above screen, show below
  if (y < 0) {
    y = screenY + (shape.fontSize * shape.lineHeight * scale) + 12
  }

  // Keep toolbar on screen horizontally
  const maxX = window.innerWidth - toolbarWidth
  if (x > maxX) {
    x = maxX
  }
  if (x < 0) {
    x = 0
  }

  return { x, y }
}
```

**Step 2: Auto-resize textarea height**

In `TextEditOverlay.tsx`, add auto-resize:

```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
  }
}, [shape.text])
```

**Step 3: Prevent toolbar from closing when clicking inside**

In `FloatingTextToolbar.tsx`, add stopPropagation:

```typescript
<div
  style={{ ... }}
  onMouseDown={(e) => e.stopPropagation()}
>
```

**Step 4: Hide toolbar when in edit mode**

In `Canvas.tsx`, update toolbar rendering condition:

```typescript
{selectedTextId && !editingTextId && (() => {
  // ... toolbar rendering
})()}
```

**Step 5: Test edge cases**

Run: `npm run dev`
Test:
- Create text near top edge (toolbar shows below)
- Create text near right edge (toolbar stays on screen)
- Edit mode hides toolbar
- Clicking toolbar doesn't close it
- Empty text deletes shape

**Step 6: Commit**

```bash
git add src/components/canvas/Canvas.tsx src/components/canvas/TextEditOverlay.tsx src/components/canvas/FloatingTextToolbar.tsx
git commit -m "fix: handle toolbar positioning edge cases and UX improvements"
```

---

## Task 13: Add Keyboard Shortcuts

**Files:**
- Modify: `src/components/canvas/Canvas.tsx`

**Step 1: Add keyboard shortcuts for formatting**

Add keyboard event handler:

```typescript
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Only apply shortcuts when text is selected but not editing
    if (!selectedTextId || editingTextId) return

    const selectedShape = shapes.find(s => s.id === selectedTextId)
    if (!selectedShape || selectedShape.type !== 'text') return

    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault()
      const newWeight = selectedShape.fontWeight === 700 ? 400 : 700
      updateShape(selectedTextId, { fontWeight: newWeight })
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault()
      const newStyle = selectedShape.fontStyle === 'italic' ? 'normal' : 'italic'
      updateShape(selectedTextId, { fontStyle: newStyle })
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
      e.preventDefault()
      const newDecoration = selectedShape.textDecoration === 'underline' ? 'none' : 'underline'
      updateShape(selectedTextId, { textDecoration: newDecoration })
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [selectedTextId, editingTextId, shapes, updateShape])
```

**Step 2: Test keyboard shortcuts**

Run: `npm run dev`
Test: Cmd+B (bold), Cmd+I (italic), Cmd+U (underline)

**Step 3: Commit**

```bash
git add src/components/canvas/Canvas.tsx
git commit -m "feat: add keyboard shortcuts for text formatting (Cmd+B/I/U)"
```

---

## Task 14: Final Testing and Documentation

**Files:**
- Create: `docs/features/text-editing.md`

**Step 1: Comprehensive manual testing**

Test checklist:
- [ ] Drag to create text box
- [ ] Text box has correct width
- [ ] Placeholder text appears
- [ ] Double-click enters edit mode
- [ ] Can type and see changes
- [ ] ESC exits edit mode
- [ ] Click outside exits edit mode
- [ ] Empty text deletes shape
- [ ] Single-click shows toolbar
- [ ] Font picker works
- [ ] Font size changes
- [ ] Bold/Italic/Underline toggle
- [ ] Text alignment changes
- [ ] Color picker works
- [ ] Line height changes
- [ ] Keyboard shortcuts work
- [ ] Toolbar positioned correctly at edges
- [ ] Can edit multiple text boxes
- [ ] Text persists after refresh (if using persistence)

**Step 2: Create documentation**

Create `docs/features/text-editing.md`:

```markdown
# Text Editing Feature

## Overview
Figma-like text editing with drag-to-create, inline editing, and comprehensive formatting controls.

## User Workflow

### Creating Text
1. Click Text tool in toolbar
2. Drag on canvas to define text box width (minimum 50px)
3. Text box created with "Double-click to edit" placeholder
4. Double-click to start editing

### Editing Text
1. Double-click text to enter edit mode
2. HTML textarea overlay appears
3. Type to edit
4. Press ESC or click outside to save

### Formatting Text
1. Single-click text to select
2. Floating toolbar appears above text
3. Use controls to format:
   - Font family (12 fonts available)
   - Font size (8-96px)
   - Bold (Cmd+B)
   - Italic (Cmd+I)
   - Underline (Cmd+U)
   - Alignment (left/center/right)
   - Text color
   - Line height (1.0-2.0)

## Technical Details

### Components
- `FloatingTextToolbar.tsx` - Formatting controls
- `TextEditOverlay.tsx` - Inline editing textarea
- `FontPicker.tsx` - Font family dropdown

### State Management
- `editingTextId` - Currently editing text (Zustand)
- `selectedTextId` - Currently selected text (local state)

### Font Loading
- Google Fonts loaded via CDN
- 12 fonts available (6 Google + 6 system)
- Fonts loaded on demand

### Known Limitations
- Line height limited to preset values
- No letter spacing control (could be added)
- No text rotation (uses shape rotation)
```

**Step 3: Final build test**

Run: `npm run build`
Expected: Clean build with no errors

**Step 4: Commit**

```bash
git add docs/features/text-editing.md
git commit -m "docs: add comprehensive text editing feature documentation"
```

---

## Summary

This plan implements a complete Figma-like text editing experience with:
- ✅ Drag-to-create text boxes
- ✅ Inline editing with HTML overlay
- ✅ Floating toolbar with all formatting controls
- ✅ Font family picker (12 fonts)
- ✅ Bold, italic, underline
- ✅ Text alignment
- ✅ Line height control
- ✅ Color picker
- ✅ Keyboard shortcuts
- ✅ Edge case handling

**Total estimated time:** 4-6 hours with focus

**Dependencies:**
- lucide-react (for icons - already installed)
- Google Fonts (via CDN)

**Testing approach:**
- Manual testing throughout each task
- Comprehensive checklist at end
- Visual verification of all features
