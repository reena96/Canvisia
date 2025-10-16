# Text Editing Feature

## Overview
Figma-like text editing with drag-to-create, inline editing, and comprehensive formatting controls. This feature provides a professional text editing experience with a floating toolbar, Google Fonts integration, and keyboard shortcuts.

## User Workflow

### Creating Text
1. Click the Text tool in the toolbar
2. Drag on canvas to define text box width (minimum 50px)
3. Text box is created with "Double-click to edit" placeholder text
4. The text box automatically enters edit mode for immediate editing

### Editing Text
1. Double-click any text shape to enter edit mode
2. HTML textarea overlay appears with a blue border indicating edit mode
3. Type to edit the text content
4. Press ESC or click outside the text area to save and exit edit mode
5. If text is empty when exiting, the shape is automatically deleted

### Formatting Text
1. Single-click a text shape to select it
2. Floating toolbar appears above the text (or below if near top edge)
3. Available formatting controls:
   - **Font Family**: Dropdown with 12 fonts (6 Google Fonts + 6 system fonts)
   - **Font Size**: Dropdown with sizes from 8px to 96px
   - **Bold**: Toggle button (also Cmd/Ctrl+B)
   - **Italic**: Toggle button (also Cmd/Ctrl+I)
   - **Underline**: Toggle button (also Cmd/Ctrl+U)
   - **Alignment**: Left, Center, or Right alignment
   - **Text Color**: Color picker for text fill color
   - **Line Height**: Dropdown with values 1.0, 1.2, 1.5, 2.0

### Keyboard Shortcuts
- **Cmd/Ctrl+B**: Toggle bold
- **Cmd/Ctrl+I**: Toggle italic
- **Cmd/Ctrl+U**: Toggle underline
- **ESC**: Exit edit mode
- **Delete/Backspace**: Delete selected text shape

## Technical Details

### Architecture
The text editing system uses a dual-layer approach:
- **Canvas Layer**: Konva.Text renders the text on the canvas
- **Overlay Layer**: HTML textarea provides inline editing capabilities

This architecture ensures:
- High-performance rendering via Konva
- Native text editing UX via HTML textarea
- Perfect visual synchronization between layers

### Components

#### FloatingTextToolbar.tsx
- **Location**: `src/components/canvas/FloatingTextToolbar.tsx`
- **Purpose**: Provides comprehensive text formatting controls
- **Features**:
  - Dynamic positioning (stays on screen at edges)
  - Visual feedback for active states (blue border)
  - Prevents event bubbling to avoid closing on clicks
  - Integrated FontPicker component

#### TextEditOverlay.tsx
- **Location**: `src/components/canvas/TextEditOverlay.tsx`
- **Purpose**: Provides inline text editing with textarea overlay
- **Features**:
  - Auto-focus and text selection on mount
  - Auto-resize based on content
  - Matches all text styling (font, size, color, alignment, etc.)
  - Screen-space positioning that respects canvas zoom and pan
  - ESC key and blur handlers for exit

#### FontPicker.tsx
- **Location**: `src/components/canvas/FontPicker.tsx`
- **Purpose**: Dropdown selector for font families
- **Features**:
  - Click-outside detection to close dropdown
  - Preview of each font in its own typeface
  - Active state highlighting
  - Hover effects for better UX

#### ShapeRenderer.tsx (Text Case)
- **Location**: `src/components/canvas/ShapeRenderer.tsx` (lines 231-267)
- **Purpose**: Renders text shapes on Konva canvas
- **Features**:
  - Combines fontWeight and fontStyle into Konva's fontStyle prop
  - Double-click handler to enter edit mode
  - Blue fill color when selected
  - Full drag support

### State Management

#### Zustand Store (canvasStore.ts)
- `editingTextId: string | null` - ID of currently editing text (null if none)
- `setEditingTextId: (id: string | null) => void` - Updates editing state

#### Local State (Canvas.tsx)
- `selectedTextId: string | null` - ID of selected text for toolbar display
- `isCreatingText: boolean` - True during drag-to-create operation
- `textStartPos: { x, y } | null` - Starting position for drag creation
- `textPreviewWidth: number` - Current width during drag (not currently rendered)

### Font Loading

#### Google Fonts Integration
- **Location**: `index.html` (lines 8-10)
- **Fonts Loaded**: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins
- **Weights**: 400 (normal), 700 (bold)
- **Styles**: Normal and Italic variants
- **Loading Strategy**: Preconnect + link tag with `display=swap`

#### Font Loader Utility
- **Location**: `src/utils/fontLoader.ts`
- **Available Fonts**: 12 total
  - Google Fonts: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins
  - System Fonts: Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana
- **Default Font**: Inter
- **Functions**:
  - `isFontLoaded(fontFamily)`: Checks if font is loaded using FontFace API
  - `loadFont(fontFamily)`: Async loads font on demand

### Text Shape Type

#### Interface (types/shapes.ts)
```typescript
export interface Text extends BaseShape {
  type: 'text';
  text: string;                    // Text content
  fontSize: number;                // Font size in pixels
  fontFamily: string;              // Font family name (required)
  fill: string;                    // Text color
  fontWeight: number;              // 400 (normal), 700 (bold)
  fontStyle: 'normal' | 'italic';  // Font style
  textDecoration: 'none' | 'underline' | 'line-through';
  align: 'left' | 'center' | 'right'; // Text alignment
  lineHeight: number;              // Line height multiplier
  width: number;                   // Text box width (required)
}
```

#### Default Values (shapeDefaults.ts)
- Text: "Double-click to edit"
- Font Size: 16px
- Font Family: "Inter"
- Font Weight: 400 (normal)
- Font Style: "normal"
- Text Decoration: "none"
- Alignment: "left"
- Line Height: 1.2
- Width: 200px
- Fill: User color or #1F2937

### Event Handling

#### Text Creation (Canvas.tsx)
1. **Mouse Down**: Sets `isCreatingText=true` and captures start position
2. **Mouse Move**: Calculates preview width (currently not rendered)
3. **Mouse Up**: Creates text shape with calculated width (min 50px)

#### Text Selection (Canvas.tsx)
1. **Single Click**: Sets `selectedTextId` to show toolbar
2. **Stage Click**: Clears `selectedTextId` to hide toolbar

#### Text Editing (ShapeRenderer.tsx)
1. **Double Click**: Calls `setEditingTextId(shape.id)` to show overlay
2. **Overlay Exit**: Sets `editingTextId=null` and deletes if text is empty

### Toolbar Positioning

#### Algorithm (Canvas.tsx, calculateToolbarPosition)
```typescript
function calculateToolbarPosition(shape: Text): { x: number; y: number } {
  // Convert canvas coordinates to screen coordinates
  const screenX = shape.x * viewport.zoom + viewport.x
  const screenY = shape.y * viewport.zoom + viewport.y

  // Default: show above text
  let y = screenY - toolbarHeight - 12

  // If toolbar would go above screen, show below
  if (y < 0) {
    y = screenY + (shape.fontSize * shape.lineHeight * viewport.zoom) + 12
  }

  // Keep toolbar on screen horizontally
  const maxX = window.innerWidth - toolbarWidth
  x = Math.max(0, Math.min(x, maxX))

  return { x, y }
}
```

**Features**:
- Positions above text by default (12px gap)
- Flips below if near top edge
- Constrains to screen bounds horizontally
- Respects canvas zoom and pan transforms

### Known Limitations

1. **Line Height**: Limited to preset values (1.0, 1.2, 1.5, 2.0)
   - Could be enhanced with custom input

2. **Letter Spacing**: Not currently supported
   - Konva supports this via `letterSpacing` prop
   - Would require additional toolbar control

3. **Text Rotation**: Uses base shape rotation property
   - No text-specific rotation UI
   - Rotation tool would need to be added to toolbar

4. **Multi-line Selection**: No support for selecting portions of text
   - Edit mode is all-or-nothing
   - Advanced selection would require custom implementation

5. **Text Wrapping**: Controlled by width property only
   - No option for auto-width or fixed-height boxes
   - Could add width/height resize handles

6. **Font Loading Indicator**: No visual feedback during font load
   - Generally instant for Google Fonts
   - Could add loading state if needed

7. **Strike-through**: Type defined but not in toolbar
   - `textDecoration` supports 'line-through'
   - Would need button in FloatingTextToolbar

8. **Undo/Redo**: Not implemented for text editing
   - Would need to integrate with global undo system
   - Complex due to live text updates

## Testing Checklist

### Basic Text Creation
- [x] Drag to create text box
- [x] Text box has correct width based on drag distance
- [x] Minimum width enforced (50px)
- [x] Placeholder text appears ("Double-click to edit")

### Text Editing
- [x] Double-click enters edit mode
- [x] Textarea overlay appears with blue border
- [x] Can type and see changes in real-time
- [x] ESC key exits edit mode
- [x] Click outside exits edit mode
- [x] Empty text deletes shape automatically
- [x] Textarea auto-resizes based on content

### Text Formatting
- [x] Single-click shows floating toolbar
- [x] Font picker dropdown works
- [x] Font family changes applied correctly
- [x] Font size changes (8-96px range)
- [x] Bold toggle works (visual + state)
- [x] Italic toggle works (visual + state)
- [x] Underline toggle works (visual + state)
- [x] Text alignment changes (left/center/right)
- [x] Color picker changes text color
- [x] Line height changes (1.0-2.0)

### Keyboard Shortcuts
- [x] Cmd/Ctrl+B toggles bold
- [x] Cmd/Ctrl+I toggles italic
- [x] Cmd/Ctrl+U toggles underline
- [x] Shortcuts only work when text selected (not in edit mode)

### UI/UX Edge Cases
- [x] Toolbar positioned correctly at top edge (flips below)
- [x] Toolbar positioned correctly at right edge (stays on screen)
- [x] Toolbar hidden during edit mode
- [x] Clicking toolbar doesn't close it (stopPropagation)
- [x] Can edit multiple text boxes sequentially
- [x] Text persists after page refresh (Firestore sync)

### Canvas Integration
- [x] Text respects canvas zoom level
- [x] Text respects canvas pan position
- [x] Text draggable when not in edit mode
- [x] Text selection indicator (blue fill)
- [x] Text updates sync to Firestore
- [x] Font rendering matches between Konva and overlay

## Future Enhancements

### Potential Improvements
1. **Rich Text Editing**: Support for mixed formatting within single text box
2. **Text Effects**: Shadow, outline, gradient fills
3. **Auto-sizing**: Auto-width or auto-height text boxes
4. **Resize Handles**: Visual handles to resize text box width
5. **More Fonts**: Integration with full Google Fonts library
6. **Custom Fonts**: Upload and use custom font files
7. **Text Styles**: Saved text style presets
8. **Find and Replace**: Search within text content
9. **Text Lists**: Bulleted and numbered lists
10. **Vertical Alignment**: Top/middle/bottom alignment within box

## Implementation Notes

### Performance Considerations
- **Throttled Updates**: Shape position updates throttled to 20/sec (50ms)
- **Optimistic Updates**: Local state updates immediate, Firestore async
- **Font Loading**: Google Fonts loaded once on page load via CDN
- **Render Optimization**: Konva only re-renders changed shapes

### Accessibility
- **Focus Management**: Auto-focus textarea on edit mode entry
- **Keyboard Support**: Full keyboard shortcuts for formatting
- **Color Contrast**: Ensure text color has sufficient contrast
- **Screen Reader**: Limited support (canvas-based rendering)

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Font API**: Requires CSS Font Loading API (widely supported)
- **Color Input**: Native color picker (all modern browsers)
- **Konva**: WebGL fallback to canvas 2D if needed

## Related Documentation
- [Text/Image Shape Support PR #9](/docs/prs/pr-9-text-image-shapes.md)
- [Toolbar UI Documentation](/docs/features/toolbar.md) (if exists)
- [Canvas Architecture](/docs/architecture/canvas.md) (if exists)
