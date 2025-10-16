# Manual Test: Text Auto-Width Behavior

## Purpose
Validate that text boxes expand horizontally (auto-width) instead of wrapping vertically when text is added.

## Prerequisites
- Dev server running at http://localhost:5173 (or 5174)
- Signed into the application
- Access to Canvas page

## Test Steps

### Test 1: Text Box Expands Horizontally

1. **Create Text Box**
   - Click the "Text" tool in the toolbar
   - Click and drag on the canvas to create a text box
   - Release mouse

2. **Verify Auto-Width During Editing**
   - Text box should automatically enter edit mode (textarea appears with blue border)
   - Type a long line of text: `This is a very long line of text that should expand horizontally without wrapping`
   - **Expected**: Textarea should grow wider as you type
   - **Expected**: Text should remain on a single line (no wrapping)
   - **Expected**: Textarea height should remain roughly constant

3. **Exit Edit Mode**
   - Press `ESC` or click outside the text box
   - **Expected**: Textarea disappears
   - **Expected**: Text is now rendered on canvas

4. **Verify Selection Box**
   - Click on the text to select it
   - **Expected**: Blue bounding box appears around the text
   - **Expected**: Bounding box width matches the text width
   - **Expected**: Bounding box height matches the single line height
   - **Expected**: Text color remains unchanged (not blue)

5. **Re-enter Edit Mode**
   - Double-click the text
   - **Expected**: Textarea reappears with blue border
   - **Expected**: Textarea dimensions match the text content
   - **Expected**: Bounding box is hidden during edit mode

### Test 2: No Double Boxes During Editing

1. **Create and Edit Text**
   - Create a new text box
   - Type some text
   - While in edit mode:
     - **Expected**: Only the textarea with blue border is visible
     - **Expected**: NO blue bounding box visible behind/around textarea
     - **Expected**: NO duplicate text visible

2. **Exit and Re-select**
   - Press `ESC` to exit edit mode
   - Click to select the text
     - **Expected**: Blue bounding box appears
     - **Expected**: No textarea visible
     - **Expected**: Only one instance of the text

### Test 3: WhiteSpace: No

wrap Property

1. **Inspect Textarea (using Browser DevTools)**
   - Create text box and enter edit mode
   - Open Browser DevTools (F12 or Cmd+Option+I)
   - Inspect the textarea element
   - Check computed styles:
     - **Expected**: `white-space: nowrap`
     - **Expected**: `overflow: hidden`
     - **Expected**: `minWidth` is set (not fixed width)

### Test 4: Konva Text Rendering

1. **Check Text on Canvas**
   - Create text with varying content lengths
   - Exit edit mode for each
   - **Expected**: Each text box width matches its content
   - **Expected**: No fixed width constraint visible
   - **Expected**: Text does not wrap to multiple lines

## Success Criteria

✅ Text extends horizontally as characters are added
✅ No vertical wrapping occurs during typing
✅ Selection box matches actual text dimensions
✅ No double boxes during edit mode
✅ Textarea has `whiteSpace: nowrap`
✅ Text color stays original when selected
✅ Clean visual transition between edit and select modes

## Known Issues to Watch For

❌ Text wrapping to multiple lines (FAIL)
❌ Fixed width causing text to wrap (FAIL)
❌ Double boxes during edit mode (FAIL)
❌ Selection box with wrong dimensions (FAIL)
❌ Text color changing to blue when selected (FAIL)

## Test Results

Date: _____________
Tester: _____________
Result: ☐ PASS  ☐ FAIL
Notes:

