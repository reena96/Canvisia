# Testing Guide - Canvisia MVP

**Live App:** https://canvisia-ab47b.web.app

This guide walks through testing all recent changes and MVP features on the production deployment.

---

## ✅ Automated Test Results

**Status:** All 63 tests passing

```
Test Files  10 passed (10)
Tests       63 passed (63)
Duration    1.15s
```

### Test Coverage:
- ✅ Canvas configuration and utilities (26 tests)
- ✅ Authentication service (7 tests)
- ✅ Cursor synchronization (8 tests)
- ✅ Presence awareness (3 tests)
- ✅ Shape drag synchronization (2 tests)
- ✅ AuthProvider integration (6 tests)
- ✅ Throttling utilities (6 tests)
- ✅ Hit testing (5 tests)

---

## 📋 Manual Testing Checklist

### Test 1: Initial Load & Authentication
**Purpose:** Verify Google Sign-In works correctly

**Steps:**
1. Open https://canvisia-ab47b.web.app in a browser
2. Verify you see the login page with "Sign in with Google" button
3. Click "Sign in with Google"
4. Complete Google authentication
5. Verify you're redirected to the canvas
6. Verify your name appears in the header (top-right)

**Expected Results:**
- ✅ Login page loads correctly
- ✅ Google OAuth popup appears
- ✅ After auth, redirected to canvas
- ✅ User name displayed in header
- ✅ User profile photo shown (if available)

---

### Test 2: Canvas Navigation (New Features)
**Purpose:** Verify Figma-style infinite canvas with dot grid

**Steps:**
1. After logging in, observe the canvas
2. Verify you see a dot grid (not lines)
3. Scroll up/down with mouse wheel
4. Verify the canvas pans (doesn't zoom)
5. Hold Cmd (Mac) or Ctrl (Windows) and scroll
6. Verify the canvas zooms in/out
7. Press spacebar and drag with mouse
8. Verify the canvas pans
9. Zoom in/out and observe the dot grid
10. Verify dots scale with zoom level

**Expected Results:**
- ✅ Dot grid visible across canvas
- ✅ Regular scroll = pan up/down
- ✅ Cmd/Ctrl + scroll = zoom
- ✅ Spacebar + drag = pan
- ✅ Grid dots scale with zoom (not lines)
- ✅ Infinite canvas (no boundaries)

---

### Test 3: Zoom Controls (New Feature)
**Purpose:** Verify integrated zoom controls in vertical toolbar

**Steps:**
1. Look at the left side of the screen
2. Verify you see a vertical toolbar
3. Locate the zoom controls at the bottom of toolbar:
   - Plus (+) button
   - Percentage display (e.g., "100%")
   - Minus (−) button
4. Click the + button
5. Verify zoom increases by 10%
6. Click the − button
7. Verify zoom decreases by 10%
8. Click the percentage display
9. Verify zoom resets to 100%
10. Verify no duplicate zoom controls in bottom-right corner

**Expected Results:**
- ✅ Zoom controls in vertical toolbar (left side)
- ✅ Plus button zooms in
- ✅ Minus button zooms out
- ✅ Percentage display shows current zoom
- ✅ Click percentage to reset to 100%
- ✅ NO horizontal zoom controls at bottom-right
- ✅ Hover effects on zoom buttons

---

### Test 4: Shape Creation & Manipulation
**Purpose:** Verify rectangle tool works correctly

**Steps:**
1. In the vertical toolbar, click the Rectangle tool (▭)
2. Verify the button appears selected (blue border)
3. Click and drag on the canvas
4. Verify a rectangle appears as you drag
5. Release mouse
6. Verify rectangle is created with blue fill
7. Create 2-3 more rectangles in different sizes
8. Click the Select tool (↖) at top of toolbar
9. Click on a rectangle
10. Verify it shows selection handles
11. Drag the rectangle to move it
12. Verify it moves smoothly

**Expected Results:**
- ✅ Rectangle tool selectable
- ✅ Click-and-drag creates rectangles
- ✅ Visual feedback during creation
- ✅ Rectangles have blue fill, black stroke
- ✅ Select tool allows clicking shapes
- ✅ Selected shapes show handles
- ✅ Shapes draggable when selected

---

### Test 5: Real-Time Sync (Single User)
**Purpose:** Verify shapes persist across sessions

**Steps:**
1. Create 2-3 rectangles on the canvas
2. Note their positions
3. Refresh the page (Cmd+R or Ctrl+R)
4. Sign in again if needed
5. Verify rectangles are still there
6. Verify they're in the same positions
7. Move a rectangle to a new position
8. Refresh the page again
9. Verify the rectangle is in its new position

**Expected Results:**
- ✅ Shapes persist after refresh
- ✅ Positions maintained correctly
- ✅ Shape updates saved to Firebase
- ✅ Data loads on page refresh

---

### Test 6: Multi-User Real-Time Sync
**Purpose:** Verify real-time collaboration works

**Setup:** Open the app in 2+ browser tabs/windows

**Steps:**
1. Open https://canvisia-ab47b.web.app in Tab 1
2. Sign in to Tab 1
3. Open https://canvisia-ab47b.web.app in Tab 2 (incognito or different browser)
4. Sign in to Tab 2 (can use same or different Google account)
5. In Tab 1, select Rectangle tool and create a rectangle
6. Watch Tab 2
7. Verify rectangle appears in Tab 2 within ~100ms
8. In Tab 2, select the rectangle and drag it
9. Watch Tab 1
10. Verify rectangle moves in Tab 1 in real-time
11. Create shapes in both tabs simultaneously
12. Verify both tabs stay synchronized

**Expected Results:**
- ✅ Both tabs can connect simultaneously
- ✅ Shape creation syncs across tabs
- ✅ Shape movement syncs across tabs
- ✅ Latency < 100ms
- ✅ No conflicts or lost updates
- ✅ Both users can work simultaneously

---

### Test 7: Multiplayer Cursors
**Purpose:** Verify cursor tracking between users

**Setup:** Use 2+ browser tabs/windows from Test 6

**Steps:**
1. With both tabs open and signed in
2. In Tab 1, move your mouse around the canvas
3. Watch Tab 2
4. Verify you see a cursor with the user's name
5. Verify cursor moves smoothly (not jumpy)
6. In Tab 2, move your mouse
7. Watch Tab 1
8. Verify you see Tab 2's cursor with name label
9. Move both cursors at the same time
10. Verify both cursors visible and smooth

**Expected Results:**
- ✅ Remote cursors visible with name labels
- ✅ Cursor positions update smoothly
- ✅ Different color per user
- ✅ No lag or jumpiness
- ✅ Names displayed next to cursors
- ✅ Latency < 50ms

---

### Test 8: User Presence
**Purpose:** Verify user list shows active collaborators

**Setup:** Use 2+ browser tabs/windows

**Steps:**
1. Open Tab 1 and sign in
2. Look for user presence indicator (check header or sidebar)
3. Note the user count
4. Open Tab 2 and sign in with different account
5. In Tab 1, verify user count increases
6. Verify Tab 2's user name appears in the list
7. Close Tab 2
8. Wait 5-10 seconds
9. In Tab 1, verify user count decreases
10. Verify Tab 2's user no longer in the list

**Expected Results:**
- ✅ User presence list visible
- ✅ Shows current user count
- ✅ Shows user names
- ✅ Updates when users join
- ✅ Updates when users leave
- ✅ Automatic cleanup on disconnect

---

### Test 9: Toolbar & UI Polish
**Purpose:** Verify UI enhancements and visual quality

**Steps:**
1. Examine the vertical toolbar on the left
2. Verify it has clean styling with:
   - White background
   - Rounded corners
   - Drop shadow
   - Icons for each tool
3. Hover over each tool button
4. Verify hover effect (light gray background)
5. Click each tool
6. Verify selection state (blue background, blue border)
7. Check disabled tools (Circle, Line, Text)
8. Verify they appear grayed out
9. Verify disabled tools show "not-allowed" cursor
10. Check the divider between tools and zoom controls

**Expected Results:**
- ✅ Professional toolbar design
- ✅ Clear visual hierarchy
- ✅ Smooth hover animations
- ✅ Selection state clearly visible
- ✅ Disabled state clearly indicated
- ✅ Divider separates tools from zoom
- ✅ Consistent spacing and alignment

---

### Test 10: Performance & Smoothness
**Purpose:** Verify app runs smoothly at 60 FPS

**Steps:**
1. Create 10-20 rectangles on the canvas
2. Rapidly pan around the canvas
3. Verify smooth movement (no stuttering)
4. Zoom in and out rapidly
5. Verify smooth zoom animation
6. Select and drag a shape quickly
7. Verify shape follows cursor smoothly
8. Move cursor around quickly
9. Open browser DevTools (F12)
10. Go to Performance tab
11. Record during interactions
12. Verify FPS stays around 60

**Expected Results:**
- ✅ Smooth panning (60 FPS)
- ✅ Smooth zooming (60 FPS)
- ✅ Smooth shape dragging
- ✅ Smooth cursor tracking
- ✅ No frame drops or stuttering
- ✅ No memory leaks
- ✅ Responsive UI interactions

---

### Test 11: Error Handling
**Purpose:** Verify graceful handling of errors

**Steps:**
1. Open DevTools (F12) → Network tab
2. Set network throttling to "Offline"
3. Try to create a rectangle
4. Note behavior (may work locally, won't sync)
5. Re-enable network ("Online")
6. Verify shape syncs when connection restored
7. Try to sign in with wrong account (if possible)
8. Verify error message appears
9. Test rapid clicking on tools
10. Verify no UI glitches or crashes

**Expected Results:**
- ✅ Offline changes queue or show warning
- ✅ Connection restored = auto-sync
- ✅ Auth errors handled gracefully
- ✅ No crashes from rapid interactions
- ✅ Error messages user-friendly

---

## 🎯 Recent Changes Testing Summary

### Changes Made in This Session:

#### 1. ✅ Infinite Canvas with Figma-Style Navigation
- Changed scroll behavior: scroll = pan (not zoom)
- Added Cmd/Ctrl + scroll = zoom
- Increased zoom sensitivity (5x) for Figma feel
- **Test Coverage:** Tests 2, 10

#### 2. ✅ Dot Grid (Figma-Style)
- Replaced grid lines with dots
- Dots scale with zoom level
- Professional appearance
- **Test Coverage:** Test 2

#### 3. ✅ Consolidated Zoom Controls
- Removed horizontal zoom controls (bottom-right)
- Integrated zoom into vertical toolbar (left)
- Three controls: +, %, −
- **Test Coverage:** Test 3

#### 4. ✅ Documentation Updates
- Added live demo link to README
- Created MVP_CHECKLIST.md
- Enhanced feature descriptions
- **Test Coverage:** Manual verification (check GitHub)

---

## 📊 Test Results Template

Use this template to record your test results:

```markdown
## Manual Test Results - [Date]

### Test 1: Authentication
- [ ] Login page loads
- [ ] Google sign-in works
- [ ] Redirect to canvas works
- [ ] User name appears

### Test 2: Canvas Navigation
- [ ] Dot grid visible
- [ ] Scroll = pan
- [ ] Cmd+scroll = zoom
- [ ] Spacebar+drag = pan
- [ ] Infinite canvas works

### Test 3: Zoom Controls
- [ ] Toolbar visible on left
- [ ] + button zooms in
- [ ] − button zooms out
- [ ] % display shows zoom
- [ ] Click % resets zoom
- [ ] NO duplicate controls

### Test 4: Shape Creation
- [ ] Rectangle tool works
- [ ] Visual feedback during creation
- [ ] Shapes have correct styling

### Test 5: Single User Persistence
- [ ] Shapes persist after refresh
- [ ] Positions maintained

### Test 6: Multi-User Sync
- [ ] Multiple tabs can connect
- [ ] Shape creation syncs
- [ ] Shape movement syncs
- [ ] Latency < 100ms

### Test 7: Multiplayer Cursors
- [ ] Remote cursors visible
- [ ] Names displayed
- [ ] Smooth movement
- [ ] Latency < 50ms

### Test 8: User Presence
- [ ] User list visible
- [ ] Updates on join/leave
- [ ] Auto cleanup on disconnect

### Test 9: UI Polish
- [ ] Toolbar styled professionally
- [ ] Hover effects work
- [ ] Selection states clear
- [ ] Disabled tools indicated

### Test 10: Performance
- [ ] 60 FPS during interactions
- [ ] No stuttering or lag
- [ ] Smooth animations

### Test 11: Error Handling
- [ ] Offline handling works
- [ ] Auth errors handled
- [ ] No crashes from rapid clicks

**Overall Status:** [PASS/FAIL]
**Issues Found:** [List any issues]
**Notes:** [Additional observations]
```

---

## 🐛 Known Issues to Watch For

- None currently identified
- Report any issues found during testing

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. ✅ Mark all tests as complete
2. ✅ Document any issues found
3. ✅ Create GitHub issues for bugs
4. ✅ Update MVP_CHECKLIST.md with results
5. ✅ Prepare for next phase (post-MVP features)

---

**Happy Testing!**

For questions or issues, create a GitHub issue at:
https://github.com/reena96/Canvisia/issues
