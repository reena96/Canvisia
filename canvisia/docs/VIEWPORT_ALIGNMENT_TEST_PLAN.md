# Viewport-Aware Alignment & Smart Placement - Browser Validation Test Plan

**Feature Branch:** `feature/viewport-aware-alignment`
**Date:** 2025-10-18
**Tester:** _______________

## Overview

This test plan validates the new viewport-aware alignment and smart placement features. The system should now:
- Align shapes to viewport edges (not leftmost shape)
- Filter by category (shapes/text/arrows)
- Place new shapes intelligently in viewport without overlaps
- Adapt to different screen sizes and zoom levels

---

## Pre-Test Setup

### Environment
- ✅ Browser: Chrome/Firefox/Safari
- ✅ Screen sizes to test: Desktop (1920px), Tablet (768px), Mobile (375px)
- ✅ Feature branch deployed to: `https://canvisia-ab47b.web.app` (or local)

### Test Canvas
1. Open Canvisia
2. Create a new canvas or clear existing one
3. Keep browser console open to view debug logs

---

## Test Suite 1: Viewport-Aware Alignment

**Goal:** Verify alignment happens to viewport edges, not relative to shapes

### Test 1.1: Basic Alignment to Viewport Left
- **Setup:** Create 5 circles scattered across canvas
- **Command:** "align all shapes to the left"
- **Expected:**
  - ✅ All 5 circles move to LEFT EDGE of viewport
  - ✅ Circles stack vertically at same x coordinate
  - ✅ Console shows: `Aligning X shapes to viewport left`
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 1.2: Alignment After Panning
- **Setup:** With shapes from 1.1, pan canvas RIGHT using hand tool
- **Command:** "align all shapes to the left" (repeat)
- **Expected:**
  - ✅ Shapes move to NEW viewport left edge (not previous position)
  - ✅ Position changes reflect pan offset
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 1.3: Alignment After Zooming Out
- **Setup:** Zoom out to 50%
- **Command:** "align all shapes to the left" (repeat)
- **Expected:**
  - ✅ Shapes align to viewport left at current zoom level
  - ✅ Viewport bounds expand due to zoom
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 1.4: Other Alignment Directions
- **Commands to test:**
  - "align all shapes to the right"
  - "align all shapes to the top"
  - "align all shapes to the bottom"
  - "align all shapes center horizontally"
  - "align all shapes center vertically"
- **Expected:** Each aligns to corresponding viewport edge/center
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Test Suite 2: Category Filtering

**Goal:** Verify "shapes" excludes text, "text" excludes shapes

### Test 2.1: Filter Shapes Only
- **Setup:** Create mix - 3 circles, 3 rectangles, 2 text boxes
- **Command:** "align all shapes to the left"
- **Expected:**
  - ✅ Only 6 shapes move (circles + rectangles)
  - ✅ 2 text boxes stay in place (NOT affected)
  - ✅ Console shows: `Category filter "shapes": 8 → 6 elements`
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 2.2: Filter Text Only
- **Setup:** Use same canvas from 2.1
- **Command:** "align all text to the right"
- **Expected:**
  - ✅ Only 2 text boxes move
  - ✅ 6 shapes stay in place (NOT affected)
  - ✅ Console shows: `Category filter "text": 8 → 2 elements`
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 2.3: Color + Category Filter
- **Setup:** Add 1 red circle, 1 blue circle, 1 red text box
- **Command:** "align all red shapes to the center"
- **Expected:**
  - ✅ Only red circle moves (NOT red text)
  - ✅ Blue circle not affected
  - ✅ Console shows both category and color filters applied
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 2.4: Specific Type Filter
- **Setup:** Create 5 hexagons, 5 circles, 5 rectangles
- **Command:** "align all hexagons to the top"
- **Expected:**
  - ✅ Only 5 hexagons move
  - ✅ Circles and rectangles not affected
  - ✅ Console shows: `Type filter "hexagon": 15 → 5 elements`
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Test Suite 3: Smart Placement in Viewport

**Goal:** Verify new shapes placed intelligently without overlaps

### Test 3.1: Single Shape Placement
- **Setup:** Clear canvas
- **Command:** "create a circle"
- **Expected:**
  - ✅ Circle appears in CENTER of viewport
  - ✅ No x,y coordinates provided by AI (check console logs)
  - ✅ Console shows: `Smart placement in viewport: X, Y`
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 3.2: Multiple Shapes Without Overlaps
- **Setup:** Clear canvas
- **Command:** "create 10 circles"
- **Expected:**
  - ✅ All 10 circles visible in viewport
  - ✅ No overlaps (circles have 10px padding between them)
  - ✅ Spiral pattern from center outward
  - ✅ Console shows 10 separate placements
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 3.3: Smart Placement Avoids Existing Shapes
- **Setup:** Create 1 circle at viewport center manually
- **Command:** "create 5 more circles"
- **Expected:**
  - ✅ New circles placed around existing circle
  - ✅ No collisions with existing circle
  - ✅ Spiral search pattern visible
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 3.4: Placement with Zoom Out (More Space)
- **Setup:** Clear canvas, zoom out to 50%
- **Command:** "create 20 hexagons"
- **Expected:**
  - ✅ All 20 hexagons fit in expanded viewport
  - ✅ More space available due to zoom
  - ✅ No overlaps
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 3.5: Overflow Warning
- **Setup:** Fill viewport completely with ~30-50 shapes
- **Command:** "create 20 more circles"
- **Expected:**
  - ✅ Some circles placed outside viewport
  - ✅ Console warning: `Shape placed outside viewport. Zoom out to X% to see all elements.`
  - ✅ Zoom percentage makes sense
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Test Suite 4: Responsive Behavior

**Goal:** Verify behavior adapts to different screen sizes

### Test 4.1: Desktop (1920px width)
- **Setup:** Resize browser to ~1920px width
- **Command:** "create a circle"
- **Expected:**
  - ✅ Circle appears at center of large viewport
  - ✅ Viewport width ~1920px (check console)
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 4.2: Tablet (768px width)
- **Setup:** Resize browser to ~768px width
- **Command:** "create a circle"
- **Expected:**
  - ✅ Circle appears at center of medium viewport
  - ✅ Viewport width ~768px (check console)
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 4.3: Mobile (375px width)
- **Setup:** Resize browser to ~375px width or use device emulation
- **Command:** "create a circle"
- **Expected:**
  - ✅ Circle appears at center of small viewport
  - ✅ Viewport width ~375px (check console)
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 4.4: Alignment on Different Screens
- **Setup:** Create 3 shapes, test on different screen sizes
- **Command:** "align all shapes to the left" on each screen size
- **Expected:**
  - ✅ Desktop: Aligns to left of 1920px viewport
  - ✅ Tablet: Aligns to left of 768px viewport
  - ✅ Mobile: Aligns to left of 375px viewport
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Test Suite 5: Text Content Filtering

**Goal:** Verify text can be filtered by content

### Test 5.1: Text Content Match
- **Setup:** Create 3 text boxes: "Hello", "World", "Hello World"
- **Command:** "align text saying hello to the right"
- **Expected:**
  - ✅ Only "Hello" and "Hello World" move (contains "hello")
  - ✅ "World" text box not affected
  - ✅ Case-insensitive matching
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Test Suite 6: Canvas vs Viewport Alignment

**Goal:** Verify explicit "canvas" keyword uses canvas alignment

### Test 6.1: Default to Viewport
- **Setup:** Clear canvas
- **Command:** "align shapes to the left" (no "canvas" keyword)
- **Expected:**
  - ✅ Aligns to viewport left edge
  - ✅ Console shows: `alignTo: viewport`
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 6.2: Explicit Canvas Alignment
- **Setup:** Create 3 shapes
- **Command:** "align shapes to the canvas center"
- **Expected:**
  - ✅ Aligns to canvas center (x: 1000, y: 1000)
  - ✅ Console shows: `alignTo: canvas`
  - ✅ NOT aligned to viewport center
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Test Suite 7: Arrange Elements with Filters

**Goal:** Verify arrange command supports category filtering

### Test 7.1: Arrange Shapes Only (Grid)
- **Setup:** Create mix of 6 shapes + 3 text boxes
- **Command:** "arrange all shapes in a grid"
- **Expected:**
  - ✅ Only 6 shapes arranged in grid
  - ✅ 3 text boxes not affected
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

### Test 7.2: Arrange Text Only (Row)
- **Setup:** Use same canvas from 7.1
- **Command:** "arrange all text in a row"
- **Expected:**
  - ✅ Only 3 text boxes arranged in row
  - ✅ 6 shapes not affected
- **Result:** ☐ Pass / ☐ Fail
- **Notes:** _______________

---

## Regression Tests

**Goal:** Ensure existing functionality still works

### Regression 1: Specific Shape Selection
- **Command:** "align the red circle to the left" (not "all")
- **Expected:** Only specified shape moves
- **Result:** ☐ Pass / ☐ Fail

### Regression 2: Move Element Still Works
- **Command:** "move the blue rectangle to 500, 300"
- **Expected:** Rectangle moves to exact coordinates
- **Result:** ☐ Pass / ☐ Fail

### Regression 3: Explicit Coordinates Still Honored
- **Command:** "create a circle at 600, 400"
- **Expected:**
  - ✅ Circle created at exact coordinates
  - ✅ NOT smart-placed
- **Result:** ☐ Pass / ☐ Fail

---

## Summary

### Pass/Fail Statistics
- **Test Suite 1 (Alignment):** ___/4 passed
- **Test Suite 2 (Filtering):** ___/4 passed
- **Test Suite 3 (Smart Placement):** ___/5 passed
- **Test Suite 4 (Responsive):** ___/4 passed
- **Test Suite 5 (Text Content):** ___/1 passed
- **Test Suite 6 (Canvas vs Viewport):** ___/2 passed
- **Test Suite 7 (Arrange):** ___/2 passed
- **Regression Tests:** ___/3 passed

### Overall Result
- **Total Tests:** 25
- **Passed:** ___
- **Failed:** ___
- **Pass Rate:** ___%

### Critical Issues Found
1.
2.
3.

### Recommendations
- [ ] Ready for merge to main
- [ ] Needs fixes before merge
- [ ] Requires additional testing

---

## Notes

**Tester Comments:**

**Browser Console Errors:**

**Performance Issues:**

**Suggested Improvements:**
