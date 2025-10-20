# Browser Validation Plan: Purple Theming & UI Improvements

**Feature Branch:** `feature/multiple-canvas-projects`
**Date:** 2025-10-20
**Changes Implemented:**
- Purple color theme across all UI elements
- Custom tooltip component with bottom positioning
- Toolbar shape reorganization (Conics vs Polygons)

---

## Pre-Test Setup

### Environment
- ✅ Browser: Chrome/Firefox/Safari
- ✅ Device: Desktop (recommended for full testing)
- ✅ Branch: `feature/multiple-canvas-projects`
- ✅ Build: Run `npm run dev -- --port 5174`
- ✅ Console: Keep browser dev tools open to check for errors

### Initial Setup
1. Start the dev server: `npm run dev -- --port 5174`
2. Open browser to `http://localhost:5174`
3. Login to the app
4. Open browser console (F12) to view any errors
5. Navigate to Projects page

---

## Test Suite 1: Purple Color Theme - Projects Page

### Test 1.1: New Project Button
**Setup:** Navigate to `/projects` page

**Steps:**
1. Locate the "New Project" button in the header
2. Observe the default button color
3. Hover over the button
4. Click to create a new project

**Expected Results:**
- ✅ Button background is purple (#8B5CF6)
- ✅ Hover state shows darker purple (#7C3AED)
- ✅ Button text is white and clearly readable

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.2: Tab Navigation Active State
**Setup:** Projects page with tabs visible

**Steps:**
1. Click on "Recently viewed" tab
2. Click on "Shared with me" tab
3. Click on "Owned by me" tab
4. Observe the active tab styling

**Expected Results:**
- ✅ Active tab text is purple (#8B5CF6)
- ✅ Active tab has purple bottom border
- ✅ Inactive tabs are gray
- ✅ Tab transitions are smooth

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.3: Project Card Hover & Focus States
**Setup:** Projects page with at least one project card

**Steps:**
1. Hover over a project card
2. Observe the border color change
3. Hover over the share button (if visible)
4. Hover over the rename button

**Expected Results:**
- ✅ Card border changes to purple (#8B5CF6) on hover
- ✅ Share button changes to purple on hover
- ✅ Rename button changes to purple on hover
- ✅ No blue colors visible anywhere

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 1.4: Project Name Input Focus
**Setup:** Create or rename a project

**Steps:**
1. Double-click on a project name to edit
2. Observe the input field border color
3. Type some text
4. Click outside to save

**Expected Results:**
- ✅ Input field has purple border (#8B5CF6) when focused
- ✅ No blue colors visible
- ✅ Border returns to normal when unfocused

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 2: Purple Color Theme - Canvas Sidebar

### Test 2.1: Create Canvas Button
**Setup:** Open a project to view canvas sidebar

**Steps:**
1. Locate the "Create Canvas" or "+ New Page" button
2. Observe button color
3. Hover over the button
4. Click to create a new canvas

**Expected Results:**
- ✅ Button background is purple (#8B5CF6)
- ✅ Hover state shows darker purple (#7C3AED)
- ✅ Button creates a new canvas successfully

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 2.2: Active Canvas Highlight
**Setup:** Project with multiple canvases

**Steps:**
1. Click on "Canvas 1" in the sidebar
2. Observe the background color of the active canvas
3. Click on "Canvas 2"
4. Observe the highlight moves to Canvas 2
5. Hover over inactive canvas items

**Expected Results:**
- ✅ Active canvas has light purple background (#EDE9FE)
- ✅ Active canvas hover state uses lighter purple (#DDD6FE)
- ✅ No blue backgrounds visible
- ✅ Text remains readable on purple background

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 2.3: Canvas Name Input Focus
**Setup:** Canvas sidebar visible

**Steps:**
1. Double-click on a canvas name to rename
2. Observe the input field border
3. Type some text
4. Press Enter or click outside to save

**Expected Results:**
- ✅ Input border is purple (#8B5CF6) when focused
- ✅ No blue colors visible
- ✅ Name saves successfully

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 3: Purple Color Theme - Header

### Test 3.1: Canvisia Logo Text Color
**Setup:** Navigate to Projects page (no project open)

**Steps:**
1. Observe the "Canvisia" text in the header
2. Navigate to a specific project
3. Observe the header text changes to project name

**Expected Results:**
- ✅ "Canvisia" text is purple (#8B5CF6) on Projects page
- ✅ Project name is dark gray (#1F2937) when viewing a project
- ✅ Color transition is smooth

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.2: Sign Out Button
**Setup:** Header visible with user logged in

**Steps:**
1. Locate the "Sign Out" button
2. Observe button color
3. Hover over the button
4. Click to trigger sign out (or cancel)

**Expected Results:**
- ✅ Button background is purple (#8B5CF6)
- ✅ Hover state shows darker purple (#7C3AED)
- ✅ Button text is white
- ✅ No blue colors visible

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.3: Back to Projects Button Hover
**Setup:** Viewing a specific project

**Steps:**
1. Locate "Back to projects" button in header
2. Hover over the button
3. Observe the background color change
4. Click to navigate back

**Expected Results:**
- ✅ Hover background is light purple (#EDE9FE)
- ✅ No blue or gray hover state
- ✅ Navigation works correctly

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 3.4: Share Button Hover
**Setup:** Viewing a project with share button visible

**Steps:**
1. Locate the share button (Share2 icon)
2. Hover over the button
3. Observe color changes

**Expected Results:**
- ✅ Hover text/icon color changes to purple (#8B5CF6)
- ✅ Hover background is light gray (#F3F4F6)
- ✅ No blue colors visible

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 4: Purple Color Theme - Share Dialog

### Test 4.1: Share Link Input Focus
**Setup:** Open share dialog from a project

**Steps:**
1. Click the share button to open dialog
2. Click on the link input field
3. Observe the border color
4. Click outside the field

**Expected Results:**
- ✅ Input border is purple (#8B5CF6) when focused
- ✅ No blue colors visible
- ✅ Border returns to normal when unfocused

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 4.2: Copy Link Button
**Setup:** Share dialog open

**Steps:**
1. Locate the "Copy Link" button
2. Observe button color
3. Hover over the button
4. Click to copy link

**Expected Results:**
- ✅ Button background is purple (#8B5CF6)
- ✅ Hover state shows darker purple (#7C3AED)
- ✅ "Copied!" state visible briefly
- ✅ No blue colors visible

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 4.3: Invite Button
**Setup:** Share dialog open

**Steps:**
1. Enter an email address
2. Observe the "Invite" button
3. Hover over the button
4. Button should be enabled when email is valid

**Expected Results:**
- ✅ Button background is purple (#8B5CF6)
- ✅ Hover state shows darker purple (#7C3AED)
- ✅ Disabled state is properly styled (if empty email)

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 5: Purple Color Theme - Drawing Toolbar

### Test 5.1: Selected Tool Border
**Setup:** Open a canvas with drawing toolbar visible

**Steps:**
1. Select the "Select" tool (should be default)
2. Click on "Rectangle" tool
3. Click on "Circle" tool
4. Click on "Text" tool
5. Observe the border color of each selected tool

**Expected Results:**
- ✅ Selected tool has purple border (#8B5CF6)
- ✅ Selected tool has light purple background (#EDE9FE)
- ✅ No blue borders or backgrounds visible
- ✅ Unselected tools have white/transparent background

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 5.2: Expanded Tool Section - Polygons
**Setup:** Drawing toolbar visible

**Steps:**
1. Click on "Polygons" section to expand
2. Observe all tools in expanded view
3. Click on "Rectangle"
4. Click on "Rounded Rectangle" (should be second in list)
5. Click on "Triangle"

**Expected Results:**
- ✅ Selected tool in expanded view has purple border (#8B5CF6)
- ✅ Selected tool has light purple background (#EDE9FE)
- ✅ No blue colors visible anywhere
- ✅ Rounded Rectangle appears in Polygons section (not in Conics)

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 5.3: Expanded Tool Section - Conics
**Setup:** Drawing toolbar visible

**Steps:**
1. Click on "Conics" section to expand
2. Verify the section label says "Conics" not "Circles"
3. Observe the tools available: Circle, Ellipse, Cylinder
4. Verify Rounded Rectangle is NOT in this section
5. Select each tool and verify purple styling

**Expected Results:**
- ✅ Section is labeled "Conics"
- ✅ Contains only: Circle, Ellipse, Cylinder
- ✅ Rounded Rectangle is NOT in this section
- ✅ Selected tool has purple styling (#8B5CF6 border, #EDE9FE background)

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 6: Custom Tooltips

### Test 6.1: Tooltip Position - Header Buttons
**Setup:** Viewing a project with header visible

**Steps:**
1. Hover over the "Share" button in header
2. Wait 500ms for tooltip to appear
3. Observe tooltip position (should be BELOW the button)
4. Verify tooltip is not hidden by header

**Expected Results:**
- ✅ Tooltip appears below the button after 500ms delay
- ✅ Tooltip says "Share project"
- ✅ Tooltip is fully visible (not cut off by header)
- ✅ Tooltip has dark background (#1F2937) with white text
- ✅ Tooltip has arrow pointer pointing up to the button

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 6.2: Tooltip Position - AI Chat Controls
**Setup:** Open AI chat panel

**Steps:**
1. Hover over "Move Left" button
2. Hover over "Pin" button
3. Hover over "Move Right" button
4. Hover over "Minimize" button
5. Hover over "Close" button
6. For each, verify tooltip appears BELOW the button

**Expected Results:**
- ✅ All tooltips appear below their respective buttons
- ✅ Tooltips are not hidden by the header
- ✅ Each tooltip has correct text
- ✅ 500ms delay before showing
- ✅ Tooltip disappears immediately when mouse leaves

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 6.3: Tooltip Position - AI Chat Tabs
**Setup:** AI chat with multiple tabs open

**Steps:**
1. Hover over a tab name
2. Wait for tooltip saying "Double-click to rename"
3. Observe position

**Expected Results:**
- ✅ Tooltip appears below the tab name
- ✅ Tooltip says "Double-click to rename"
- ✅ Tooltip is fully visible

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 6.4: Tooltip Position - Voice Input Button
**Setup:** AI chat visible with input area

**Steps:**
1. Locate the microphone (voice input) button
2. Hover over it
3. Wait for tooltip

**Expected Results:**
- ✅ Tooltip appears below the button
- ✅ Tooltip says "Voice input (coming soon)"
- ✅ Tooltip styling is consistent (dark background, white text)

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Test Suite 7: Regression Testing

### Test 7.1: All Existing Features Still Work
**Setup:** Navigate through the app

**Steps:**
1. Create a new project
2. Create shapes on canvas
3. Use multi-select (Shift+click)
4. Delete shapes
5. Use AI commands
6. Share a project

**Expected Results:**
- ✅ All features work as before
- ✅ No new console errors
- ✅ No visual regressions
- ✅ Only color theme has changed

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

### Test 7.2: No Blue Colors Anywhere
**Setup:** Navigate through entire application

**Steps:**
1. Visit Projects page
2. Create/open a project
3. Open share dialog
4. Open AI chat
5. Use drawing toolbar
6. Use browser inspector to check computed colors

**Expected Results:**
- ✅ No blue colors (#3B82F6, #2563EB, #EFF6FF, #DBEAFE) visible anywhere
- ✅ All blue colors replaced with purple variants
- ✅ UI is consistent and cohesive

**Result:** ☐ Pass / ☐ Fail
**Notes:** _______________

---

## Summary

### Pass/Fail Statistics
- **Projects Page Tests:** ___/4 passed
- **Canvas Sidebar Tests:** ___/3 passed
- **Header Tests:** ___/4 passed
- **Share Dialog Tests:** ___/3 passed
- **Drawing Toolbar Tests:** ___/3 passed
- **Custom Tooltips Tests:** ___/4 passed
- **Regression Tests:** ___/2 passed

### Overall Result
- **Total Tests:** 23
- **Passed:** ___
- **Failed:** ___
- **Pass Rate:** ___%

### Color Palette Verification
- **Primary Purple:** #8B5CF6 ✓
- **Hover Purple:** #7C3AED ✓
- **Light Purple:** #EDE9FE ✓
- **Lighter Purple:** #DDD6FE ✓

### Critical Issues Found
1.
2.
3.

### Recommendations
- [ ] Ready to merge to main
- [ ] Needs fixes before merge
- [ ] Requires additional testing
- [ ] Design/UX improvements needed

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


**Visual Consistency:**


**Tooltip Behavior:**


**Suggested Improvements:**


**Additional Features Tested:**

