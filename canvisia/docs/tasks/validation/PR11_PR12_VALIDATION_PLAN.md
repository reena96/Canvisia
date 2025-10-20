# Browser Validation Plan: PR #11 & PR #12

**Feature Branch:** `feature/pr-11-12-multi-select-performance`
**Date:** 2025-10-19
**PRs Implemented:**
- PR #11: Multi-Select & Layer Management
- PR #12: Performance Optimization

---

## Pre-Test Setup

### Environment
- ✅ Browser: Chrome/Firefox/Safari
- ✅ Device: Desktop (recommended for full testing)
- ✅ Branch: `feature/pr-11-12-multi-select-performance`
- ✅ Build: Run `npm run dev` for local testing
- ✅ Console: Keep browser dev tools open to monitor performance metrics

### Initial Setup
1. Start the dev server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Login to the app
4. Open browser console (F12) to view performance logs
5. Clear the canvas if needed

---

## Test Suite 1: Multi-Select (PR #11)

### Test 1.1: Shift-Click Multi-Select
**Setup:** Create 5 circles on the canvas

**Steps:**
1. Click on circle 1 (should select it with blue border)
2. Hold Shift and click on circle 2 (both should be selected)
3. Hold Shift and click on circle 3 (all three should be selected)
4. Hold Shift and click on circle 2 again (circle 2 should deselect)

**Expected Results:**
- ✅ All selected shapes show blue selection border
- ✅ Shift-clicking toggles selection
- ✅ Non-shift click replaces selection with single shape

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.2: Drag-to-Select Box
**Setup:** Create 10 shapes scattered across canvas

**Steps:**
1. Click and drag on empty canvas area
2. Draw selection box over 3-4 shapes
3. Release mouse

**Expected Results:**
- ✅ Blue dashed selection box appears while dragging
- ✅ All shapes inside box are selected when released
- ✅ Selection box disappears after release

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.3: Shift + Drag-to-Select (Additive Selection)
**Setup:** Use canvas from Test 1.2 with some shapes already selected

**Steps:**
1. Select 2 shapes with shift-click
2. Hold Shift and drag selection box over 3 different shapes
3. Release mouse

**Expected Results:**
- ✅ Original 2 shapes remain selected
- ✅ 3 new shapes are added to selection
- ✅ Total of 5 shapes are selected

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.4: Multi-Drag Functionality
**Setup:** Create 5 shapes, select 3 of them

**Steps:**
1. Select 3 shapes using shift-click
2. Drag one of the selected shapes
3. Observe all selected shapes move together

**Expected Results:**
- ✅ All 3 selected shapes move together
- ✅ Relative positions between shapes are maintained
- ✅ Non-selected shapes don't move

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.5: Delete Multiple Shapes
**Setup:** Create 6 shapes, select 4 of them

**Steps:**
1. Select 4 shapes using any selection method
2. Press Delete or Backspace key
3. Observe selected shapes are removed

**Expected Results:**
- ✅ All 4 selected shapes are deleted
- ✅ Remaining 2 shapes are untouched
- ✅ Selection is cleared after deletion

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.6: Deselect with Escape
**Setup:** Select multiple shapes

**Steps:**
1. Select 3-4 shapes using any method
2. Press Escape key

**Expected Results:**
- ✅ All shapes are deselected
- ✅ Blue selection borders disappear

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.7: Deselect by Clicking Empty Area
**Setup:** Select multiple shapes

**Steps:**
1. Select 3-4 shapes
2. Click on empty canvas area (not holding Shift)

**Expected Results:**
- ✅ All shapes are deselected
- ✅ No shapes have selection border

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 2: Layer Ordering (PR #11)

### Test 2.1: Bring Forward (Cmd/Ctrl + ])
**Setup:** Create 2 overlapping rectangles - red (back), blue (front)

**Steps:**
1. Click on red rectangle (it's behind blue)
2. Press Cmd+] (Mac) or Ctrl+] (Windows)
3. Observe layer order changes

**Expected Results:**
- ✅ Red rectangle moves one layer forward
- ✅ Red rectangle now appears in front of blue

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 2.2: Send Backward (Cmd/Ctrl + [)
**Setup:** Use the canvas from Test 2.1 with red in front

**Steps:**
1. With red rectangle selected
2. Press Cmd+[ (Mac) or Ctrl+[ (Windows)

**Expected Results:**
- ✅ Red rectangle moves one layer backward
- ✅ Red rectangle is now behind blue again

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 2.3: Bring to Front (Cmd/Ctrl + Shift + ])
**Setup:** Create 5 overlapping shapes with different colors

**Steps:**
1. Select the bottom-most shape
2. Press Cmd+Shift+] (Mac) or Ctrl+Shift+] (Windows)

**Expected Results:**
- ✅ Selected shape jumps to the very top layer
- ✅ Selected shape is now visible above all others

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 2.4: Send to Back (Cmd/Ctrl + Shift + [)
**Setup:** Use canvas from Test 2.3

**Steps:**
1. Select the top-most shape
2. Press Cmd+Shift+[ (Mac) or Ctrl+Shift+[ (Windows)

**Expected Results:**
- ✅ Selected shape moves to bottom layer
- ✅ Other shapes appear in front of it

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 2.5: Multi-Select Layer Ordering
**Setup:** Create 3 overlapping shapes, select 2 of them

**Steps:**
1. Select 2 shapes (non-adjacent layers)
2. Press Cmd+] to bring both forward

**Expected Results:**
- ✅ Both selected shapes move forward one layer
- ✅ Layer order is maintained between selected shapes

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 3: Performance Optimization (PR #12)

### Test 3.1: Performance with 100 Shapes
**Setup:** Use AI or manual creation to add 100 shapes

**Steps:**
1. Create 100 shapes (circles, rectangles, etc.)
2. Pan around the canvas
3. Zoom in and out
4. Check console for performance metrics

**Expected Results:**
- ✅ FPS stays above 50 (check console logs every 5 sec)
- ✅ Panning is smooth
- ✅ Zooming is responsive
- ✅ Console shows "Culling Ratio" percentage

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.2: Performance with 500+ Shapes
**Setup:** Create 500+ shapes (target for performance requirements)

**Steps:**
1. Add 500-600 shapes to canvas
2. Pan to different areas
3. Zoom out to view all shapes
4. Monitor console performance metrics

**Expected Results:**
- ✅ FPS stays above 30 (target: 60 FPS)
- ✅ Console shows high "Culling Ratio" (70%+ when zoomed in)
- ✅ Console shows "Visible Shapes" much less than "Total Shapes"
- ✅ No console warnings about low FPS

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.3: Viewport Culling Effectiveness
**Setup:** Create 200 shapes spread across large canvas area

**Steps:**
1. Zoom in to a small area with ~10 shapes visible
2. Check console metrics
3. Pan to different areas

**Expected Results:**
- ✅ "Visible Shapes" in console is ~10-20 (not 200)
- ✅ "Culling Ratio" is 90%+
- ✅ Performance remains smooth despite 200 total shapes

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.4: React.memo Optimization (Visual Check)
**Setup:** Create 50 shapes

**Steps:**
1. Select one shape
2. Drag it around
3. Observe other shapes (they should NOT re-render)

**Expected Results:**
- ✅ Only the selected/dragged shape updates visually
- ✅ Other shapes remain static (no flickering)
- ✅ Performance remains smooth

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.5: Multi-User Performance (5+ Concurrent Users)
**Setup:** Open app in 5 different browser tabs/windows

**Steps:**
1. Login with different test accounts in each tab
2. Create shapes from each user
3. Move shapes simultaneously from multiple tabs
4. Monitor FPS and performance

**Expected Results:**
- ✅ FPS stays above 30 in all tabs
- ✅ Shape updates sync smoothly across tabs
- ✅ No significant lag or freezing

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 4: Regression Testing

### Test 4.1: Single Shape Selection Still Works
**Setup:** Create 3 shapes

**Steps:**
1. Click on shape 1 (no shift)
2. Click on shape 2 (no shift)

**Expected Results:**
- ✅ Only one shape selected at a time
- ✅ Clicking new shape replaces previous selection

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 4.2: Shape Creation Still Works
**Setup:** Clear canvas

**Steps:**
1. Select rectangle tool from toolbar
2. Click on canvas to create rectangle
3. Try other shape tools

**Expected Results:**
- ✅ Shapes are created at click position
- ✅ All shape tools work correctly
- ✅ Tool switches back to select after creation

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 4.3: Text Editing Still Works
**Setup:** Create a text box

**Steps:**
1. Double-click text to edit
2. Type some text
3. Click outside to finish editing

**Expected Results:**
- ✅ Text edit overlay appears on double-click
- ✅ Text can be edited
- ✅ Changes are saved

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 4.4: AI Commands Still Work
**Setup:** Open Vega AI chat

**Steps:**
1. Command: "create 5 circles"
2. Command: "align all shapes to the left"

**Expected Results:**
- ✅ AI creates 5 circles
- ✅ AI aligns shapes to viewport left edge
- ✅ Commands execute successfully

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 5: Edge Cases

### Test 5.1: Select All Shapes on Canvas
**Setup:** Create 20 shapes

**Steps:**
1. Drag selection box over entire canvas
2. Try to move all shapes together

**Expected Results:**
- ✅ All 20 shapes are selected
- ✅ All shapes move together when dragging
- ✅ Performance remains acceptable

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 5.2: Very Large Selection Box
**Setup:** Create a few shapes

**Steps:**
1. Drag selection box from top-left to far bottom-right of viewport
2. Make selection box extremely large

**Expected Results:**
- ✅ Selection box renders correctly
- ✅ Shapes are selected properly
- ✅ No visual glitches

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 5.3: Mixed Shape Types in Selection
**Setup:** Create circles, rectangles, text, lines, arrows

**Steps:**
1. Select all different shape types together
2. Drag them as a group
3. Delete them

**Expected Results:**
- ✅ All shape types can be selected together
- ✅ Multi-drag works with mixed types
- ✅ Delete works with mixed types

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 5.4: Layer Ordering with Text
**Setup:** Create overlapping text and shapes

**Steps:**
1. Create rectangle
2. Create text on top of rectangle
3. Use layer ordering commands

**Expected Results:**
- ✅ Text can be sent behind rectangle
- ✅ Rectangle can be brought in front of text
- ✅ Layer ordering works for all element types

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Summary

### Pass/Fail Statistics
- **Multi-Select Tests:** ___/7 passed
- **Layer Ordering Tests:** ___/5 passed
- **Performance Tests:** ___/5 passed
- **Regression Tests:** ___/4 passed
- **Edge Case Tests:** ___/4 passed

### Overall Result
- **Total Tests:** 25
- **Passed:** ___
- **Failed:** ___
- **Pass Rate:** ___%

### Performance Metrics (from Console)
- **Average FPS with 100 shapes:** ___ FPS
- **Average FPS with 500 shapes:** ___ FPS
- **Culling Ratio at 2x zoom:** ___%
- **Visible shapes (500 total, zoomed in):** ___

### Critical Issues Found
1.
2.
3.

### Recommendations
- [ ] Ready to merge to main
- [ ] Needs fixes before merge
- [ ] Requires additional testing
- [ ] Performance optimization needed

---

## Browser Compatibility

### Chrome
- Version tested: ___
- All tests: ☐ Pass / ☐ Fail
- Notes: _______________

### Firefox
- Version tested: ___
- All tests: ☐ Pass / ☐ Fail
- Notes: _______________

### Safari
- Version tested: ___
- All tests: ☐ Pass / ☐ Fail
- Notes: _______________

---

## Notes

**Tester Comments:**


**Performance Issues Observed:**


**Suggested Improvements:**


**Additional Features Tested:**

