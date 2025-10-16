# Task 13 - Keyboard Shortcuts Test Plan

## Implementation Details

**File Modified:** `/Users/reena/CollabCanvas/canvisia/src/components/canvas/Canvas.tsx`

**Changes Made:**
- Added new `useEffect` hook at lines 179-212 for text formatting keyboard shortcuts
- Implemented three keyboard shortcuts:
  1. **Cmd+B / Ctrl+B**: Toggle Bold (fontWeight: 400 ↔ 700)
  2. **Cmd+I / Ctrl+I**: Toggle Italic (fontStyle: 'normal' ↔ 'italic')
  3. **Cmd+U / Ctrl+U**: Toggle Underline (textDecoration: 'none' ↔ 'underline')

**Key Features:**
- Only active when `selectedTextId` is set AND `editingTextId` is null
- Prevents default browser behavior for these shortcuts
- Uses `updateShape()` to persist changes to Firestore
- Supports both Mac (Cmd) and Windows/Linux (Ctrl) modifiers

## Manual Test Checklist

### Setup
- [x] TypeScript compiles successfully (`npm run build`)
- [x] Development server starts (`npm run dev`)
- [ ] Open http://localhost:5173/ in browser
- [ ] Sign in to the application

### Test Cases

#### Test 1: Create and Select Text
1. [ ] Click the Text tool in toolbar
2. [ ] Drag on canvas to create a text box
3. [ ] Double-click to enter edit mode
4. [ ] Type some text (e.g., "Test Bold Italic Underline")
5. [ ] Press ESC or click outside to exit edit mode
6. [ ] Single-click the text to select it (should show FloatingTextToolbar)

#### Test 2: Bold Shortcut (Cmd+B / Ctrl+B)
1. [ ] With text selected (NOT in edit mode), press Cmd+B (Mac) or Ctrl+B (Windows/Linux)
2. [ ] Verify text becomes bold
3. [ ] Verify Bold button in FloatingTextToolbar shows active state (blue border/background)
4. [ ] Press Cmd+B / Ctrl+B again
5. [ ] Verify text returns to normal weight
6. [ ] Verify Bold button shows inactive state

#### Test 3: Italic Shortcut (Cmd+I / Ctrl+I)
1. [ ] With text selected (NOT in edit mode), press Cmd+I (Mac) or Ctrl+I (Windows/Linux)
2. [ ] Verify text becomes italic
3. [ ] Verify Italic button in FloatingTextToolbar shows active state
4. [ ] Press Cmd+I / Ctrl+I again
5. [ ] Verify text returns to normal style
6. [ ] Verify Italic button shows inactive state

#### Test 4: Underline Shortcut (Cmd+U / Ctrl+U)
1. [ ] With text selected (NOT in edit mode), press Cmd+U (Mac) or Ctrl+U (Windows/Linux)
2. [ ] Verify text becomes underlined
3. [ ] Verify Underline button in FloatingTextToolbar shows active state
4. [ ] Press Cmd+U / Ctrl+U again
5. [ ] Verify underline is removed
6. [ ] Verify Underline button shows inactive state

#### Test 5: Combination Formatting
1. [ ] With text selected, press Cmd+B (make bold)
2. [ ] Press Cmd+I (add italic)
3. [ ] Press Cmd+U (add underline)
4. [ ] Verify text is bold, italic, AND underlined
5. [ ] Verify all three buttons show active state
6. [ ] Toggle each off individually
7. [ ] Verify each toggles independently

#### Test 6: Shortcuts Don't Work in Edit Mode
1. [ ] Double-click text to enter edit mode (textarea appears)
2. [ ] Press Cmd+B / Ctrl+B
3. [ ] Verify nothing happens (shortcuts are disabled in edit mode)
4. [ ] Press ESC to exit edit mode
5. [ ] Text should remain selected
6. [ ] Now press Cmd+B / Ctrl+B
7. [ ] Verify shortcut now works

#### Test 7: Shortcuts Don't Work When No Text Selected
1. [ ] Click on empty canvas area (deselect text)
2. [ ] Press Cmd+B / Ctrl+B
3. [ ] Verify nothing happens (no errors in console)

#### Test 8: Browser Default Prevention
1. [ ] With text selected, press Cmd+B / Ctrl+B
2. [ ] Verify browser's default bold behavior does NOT occur
3. [ ] Verify only our custom formatting is applied

#### Test 9: Multiple Text Objects
1. [ ] Create two different text objects
2. [ ] Select first text, apply bold with Cmd+B
3. [ ] Select second text, verify it's not bold
4. [ ] Apply italic to second text with Cmd+I
5. [ ] Verify first text is still bold, second is italic

#### Test 10: Persistence
1. [ ] Create text, apply formatting with shortcuts
2. [ ] Refresh the page
3. [ ] Verify formatting persists (saved to Firestore)

## Expected Results

All tests should pass with:
- Immediate visual feedback when shortcuts are pressed
- Toolbar buttons reflect current state
- No browser default behavior interfering
- Shortcuts only work when appropriate (selected but not editing)
- Changes persist to Firestore

## Known Limitations

- Shortcuts only work when text is selected (not in edit mode)
- Shortcuts don't work for non-text shapes (expected)

## Completion Criteria

- [x] Code implemented
- [x] TypeScript compiles without errors
- [x] Dev server runs successfully
- [ ] Manual testing completed
- [ ] All test cases pass
- [ ] No console errors during testing
