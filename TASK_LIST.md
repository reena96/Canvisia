# CollabCanvas - Implementation Task List

**Organized by Pull Requests (PRs)**

Each PR represents a complete, testable feature that can be merged independently.

---

## Project File Structure

```
collabcanvas/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx
│   │   │   ├── CanvasControls.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── ShapeRenderer.tsx
│   │   ├── collaboration/
│   │   │   ├── CursorOverlay.tsx
│   │   │   ├── PresenceIndicator.tsx
│   │   │   └── UserList.tsx
│   │   ├── ai/
│   │   │   ├── AIPanel.tsx
│   │   │   ├── AIInput.tsx
│   │   │   └── AIStatusIndicator.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── hooks/
│   │   ├── useCanvas.ts
│   │   ├── useFirestore.ts
│   │   ├── useCursors.ts
│   │   ├── usePresence.ts
│   │   └── useAI.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   ├── rtdb.ts (Realtime Database for cursors)
│   │   └── claude.ts
│   ├── types/
│   │   ├── canvas.ts
│   │   ├── shapes.ts
│   │   ├── user.ts
│   │   └── ai.ts
│   ├── utils/
│   │   ├── canvasUtils.ts
│   │   ├── shapeDefaults.ts
│   │   └── aiHelpers.ts
│   ├── config/
│   │   ├── firebase.config.ts
│   │   └── canvas.config.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── CollabCanvas-PRD.md
└── TASK_LIST.md (this file)
```

---

## MVP Phase (24 Hours) - PRs 1-8

### PR #1: Project Setup & Configuration

**Goal:** Initialize React + TypeScript + Vite project with Firebase integration

**Branch:** `feature/project-setup`

#### Subtasks:
- [ ] **1.1 Initialize Vite + React + TypeScript project**
  - Run: `npm create vite@latest collabcanvas -- --template react-ts`
  - Files created: All base Vite files

- [ ] **1.2 Install core dependencies**
  - Run: `npm install firebase react-router-dom`
  - Run: `npm install -D @types/node`
  - Files modified: `package.json`, `package-lock.json`

- [ ] **1.3 Install PixiJS**
  - Run: `npm install pixi.js @pixi/react`
  - Files modified: `package.json`

- [ ] **1.4 Install UI dependencies**
  - Run: `npm install lucide-react` (for icons)
  - Files modified: `package.json`

- [ ] **1.5 Create environment file structure**
  - Files created:
    - `.env.local` (add to .gitignore)
    - `.env.example` (template for others)
  - Files modified: `.gitignore`

- [ ] **1.6 Set up base folder structure**
  - Files created:
    - `src/components/` (empty)
    - `src/hooks/` (empty)
    - `src/services/` (empty)
    - `src/types/` (empty)
    - `src/utils/` (empty)
    - `src/config/` (empty)

- [ ] **1.7 Create TypeScript types foundation**
  - Files created:
    - `src/types/canvas.ts`
    - `src/types/shapes.ts`
    - `src/types/user.ts`
  - Content: Base interfaces for Canvas, Shape, User

- [ ] **1.8 Create canvas configuration**
  - Files created:
    - `src/config/canvas.config.ts`
  - Content: Canvas dimensions (5000x5000), default shapes (100x100), zoom limits

- [ ] **1.9 Create Firebase configuration (empty placeholders)**
  - Files created:
    - `src/config/firebase.config.ts`
  - Content: Export Firebase config object (will be filled in PR #2)

- [ ] **1.10 Update README with setup instructions**
  - Files modified: `README.md`
  - Content: Project description, setup steps, tech stack

- [ ] **1.11 Clean up default Vite files**
  - Files deleted: `src/App.css`, unnecessary assets
  - Files modified: `src/App.tsx` (basic shell), `src/index.css` (reset styles)

**Files Created/Modified:**
- Created: `.env.example`, `src/types/*.ts`, `src/config/*.ts`, folder structure
- Modified: `package.json`, `.gitignore`, `README.md`, `src/App.tsx`, `src/index.css`

**Acceptance Criteria:**
- [ ] Project runs with `npm run dev`
- [ ] No TypeScript errors
- [ ] Folder structure matches plan
- [ ] README has clear setup instructions

---

### PR #2: Firebase Setup & Google Authentication

**Goal:** Set up Firebase project and implement Google Sign-In

**Branch:** `feature/auth`

**Dependencies:** PR #1

#### Subtasks:
- [ ] **2.1 Create Firebase project**
  - Action: Go to Firebase Console, create new project
  - Enable Google Analytics (optional)
  - Copy Firebase config keys

- [ ] **2.2 Enable Firebase Authentication**
  - Action: In Firebase Console → Authentication → Sign-in method
  - Enable "Google" provider
  - No files changed yet

- [ ] **2.3 Enable Firestore Database**
  - Action: In Firebase Console → Firestore Database → Create database
  - Start in "test mode" (will add security rules later)
  - Select region (closest to you)

- [ ] **2.4 Enable Realtime Database (for cursors)**
  - Action: In Firebase Console → Realtime Database → Create database
  - Start in "test mode"
  - Select region

- [ ] **2.5 Add Firebase config to project**
  - Files modified:
    - `.env.local` (add Firebase keys - DO NOT COMMIT)
    - `.env.example` (add placeholder keys for others)
    - `src/config/firebase.config.ts` (implement Firebase initialization)
  - Content: Initialize Firebase app, auth, firestore, rtdb

- [ ] **2.6 Create Firebase service modules**
  - Files created:
    - `src/services/firebase.ts` - Export initialized Firebase instances
    - `src/services/auth.ts` - Authentication helpers
    - `src/services/firestore.ts` - Firestore helpers (empty for now)
    - `src/services/rtdb.ts` - Realtime Database helpers (empty for now)

- [ ] **2.7 Create AuthProvider context**
  - Files created:
    - `src/components/auth/AuthProvider.tsx`
  - Content: React Context for auth state, useAuth hook

- [ ] **2.8 Create LoginButton component**
  - Files created:
    - `src/components/auth/LoginButton.tsx`
  - Content: "Sign in with Google" button, calls Firebase auth

- [ ] **2.9 Create Header component with auth**
  - Files created:
    - `src/components/layout/Header.tsx`
  - Content: App header, displays user info when logged in, logout button

- [ ] **2.10 Integrate auth into App.tsx**
  - Files modified:
    - `src/App.tsx`
  - Content: Wrap app with AuthProvider, show login screen if not authenticated

- [ ] **2.11 Test authentication flow**
  - Action: Sign in with Google, verify user info displays
  - Check Firebase Console → Authentication → Users (should see your account)

**Files Created/Modified:**
- Created: `src/services/firebase.ts`, `src/services/auth.ts`, `src/services/firestore.ts`, `src/services/rtdb.ts`, `src/components/auth/*`, `src/components/layout/Header.tsx`
- Modified: `.env.local`, `.env.example`, `src/config/firebase.config.ts`, `src/App.tsx`

**Acceptance Criteria:**
- [ ] Google Sign-In works
- [ ] User info displays in header
- [ ] Logout works
- [ ] Auth state persists on refresh
- [ ] Firebase project is fully configured

---

### PR #3: Basic Canvas with Pan/Zoom

**Goal:** Implement PixiJS canvas with pan and zoom functionality

**Branch:** `feature/canvas-foundation`

**Dependencies:** PR #1, PR #2

#### Subtasks:
- [ ] **3.1 Create useCanvas hook**
  - Files created:
    - `src/hooks/useCanvas.ts`
  - Content: Hook to manage PixiJS app lifecycle, initialize/destroy

- [ ] **3.2 Create Canvas component**
  - Files created:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Initialize PixiJS Application
    - Set canvas size (5000x5000)
    - Create viewport container
    - Handle canvas mount/unmount

- [ ] **3.3 Implement pan functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Track mouse down/move/up
    - Update viewport position on drag
    - Cursor changes to "grab" when panning

- [ ] **3.4 Implement zoom functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Listen to wheel events
    - Scale viewport based on wheel delta
    - Zoom toward mouse position (important!)
    - Clamp zoom between min/max (0.1 - 5.0)

- [ ] **3.5 Create canvas utility functions**
  - Files created:
    - `src/utils/canvasUtils.ts`
  - Content:
    - `screenToCanvas(screenX, screenY, viewport)` - Convert screen coords to canvas coords
    - `canvasToScreen(canvasX, canvasY, viewport)` - Convert canvas coords to screen coords
    - `clampZoom(zoom)` - Ensure zoom is within bounds

- [ ] **3.6 Create CanvasControls component**
  - Files created:
    - `src/components/canvas/CanvasControls.tsx`
  - Content:
    - Zoom in/out buttons
    - Reset view button (center and zoom 1.0)
    - Display current zoom level

- [ ] **3.7 Add visual grid (optional but helpful)**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Draw grid lines on canvas
    - Grid updates as you pan/zoom

- [ ] **3.8 Integrate canvas into App**
  - Files modified:
    - `src/App.tsx`
  - Content:
    - Render Canvas component when authenticated
    - Add CanvasControls overlay

- [ ] **3.9 Test pan and zoom**
  - Action: Click and drag to pan, scroll to zoom
  - Verify smooth 60 FPS performance

**Files Created/Modified:**
- Created: `src/hooks/useCanvas.ts`, `src/components/canvas/Canvas.tsx`, `src/components/canvas/CanvasControls.tsx`, `src/utils/canvasUtils.ts`
- Modified: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Canvas displays at 5000x5000
- [ ] Can pan by clicking and dragging
- [ ] Can zoom with mouse wheel
- [ ] Zoom centers on mouse position
- [ ] 60 FPS during pan/zoom
- [ ] Controls work (zoom buttons, reset view)

---

### PR #4: Realtime Cursor Sync (CRITICAL)

**Goal:** Implement multiplayer cursor sync with name labels

**Branch:** `feature/cursor-sync`

**Dependencies:** PR #1, PR #2, PR #3

**NOTE:** This is the hardest part. Get this working before moving on!

#### Subtasks:
- [ ] **4.1 Create cursor types**
  - Files modified:
    - `src/types/user.ts`
  - Content:
    - `CursorPosition` interface (x, y, userId, userName, color, timestamp)

- [ ] **4.2 Create useCursors hook**
  - Files created:
    - `src/hooks/useCursors.ts`
  - Content:
    - Track local cursor position
    - Send cursor updates to Firebase RTDB
    - Listen to other users' cursors
    - Return map of cursors by userId

- [ ] **4.3 Implement cursor position tracking**
  - Files modified:
    - `src/hooks/useCursors.ts`
  - Content:
    - Listen to mousemove on canvas
    - Convert screen coords to canvas coords
    - Throttle updates to 20 per second (avoid spam)

- [ ] **4.4 Implement cursor broadcasting to Firebase RTDB**
  - Files modified:
    - `src/services/rtdb.ts`
    - `src/hooks/useCursors.ts`
  - Content:
    - Write cursor position to: `cursors/{canvasId}/{userId}`
    - Include: x, y, userId, userName, color, timestamp
    - Use RTDB (not Firestore) for cost efficiency

- [ ] **4.5 Listen to other users' cursors**
  - Files modified:
    - `src/hooks/useCursors.ts`
  - Content:
    - Listen to: `cursors/{canvasId}`
    - Filter out own cursor
    - Update state with other users' cursors

- [ ] **4.6 Create CursorOverlay component**
  - Files created:
    - `src/components/collaboration/CursorOverlay.tsx`
  - Content:
    - Render SVG cursors for each user
    - Position based on canvas coords
    - Different color per user
    - Name label follows cursor

- [ ] **4.7 Integrate cursor overlay with canvas**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
    - `src/App.tsx`
  - Content:
    - Render CursorOverlay on top of canvas
    - Pass cursor positions and viewport transform

- [ ] **4.8 Handle cursor cleanup on disconnect**
  - Files modified:
    - `src/hooks/useCursors.ts`
    - `src/services/rtdb.ts`
  - Content:
    - Use Firebase onDisconnect() to remove cursor on disconnect
    - Remove stale cursors after 10 seconds

- [ ] **4.9 Test with 2 browser windows**
  - Action:
    - Open app in 2 different browsers (or incognito)
    - Sign in as different users
    - Move mouse in one window, see cursor in other
  - Verify:
    - Cursor position syncs smoothly
    - Name labels display correctly
    - No lag or jitter

**Files Created/Modified:**
- Created: `src/hooks/useCursors.ts`, `src/components/collaboration/CursorOverlay.tsx`
- Modified: `src/types/user.ts`, `src/services/rtdb.ts`, `src/components/canvas/Canvas.tsx`, `src/App.tsx`

**Acceptance Criteria:**
- [ ] Cursor position syncs between 2+ users
- [ ] Cursor updates <50ms
- [ ] Name labels display for each cursor
- [ ] Different color per user
- [ ] Cursor disappears when user disconnects
- [ ] No performance issues (60 FPS maintained)

**CRITICAL:** Do NOT proceed to PR #5 until cursor sync is working perfectly!

---

### PR #5: Object Creation & Firestore Sync

**Goal:** Create rectangles and sync them across users in real-time

**Branch:** `feature/object-sync`

**Dependencies:** PR #1, PR #2, PR #3, PR #4

#### Subtasks:
- [ ] **5.1 Update shape types**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - `Shape` interface (id, type, x, y, width, height, color, etc.)
    - `Rectangle` type extends Shape

- [ ] **5.2 Create shape defaults**
  - Files created:
    - `src/utils/shapeDefaults.ts`
  - Content:
    - Default rectangle: 100x100, blue fill
    - Helper: `createDefaultRectangle(x, y)`

- [ ] **5.3 Create Toolbar component**
  - Files created:
    - `src/components/canvas/Toolbar.tsx`
  - Content:
    - Button to select rectangle tool
    - Shows currently selected tool
    - Simple UI (vertical toolbar on left side)

- [ ] **5.4 Implement rectangle creation on click**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - When canvas clicked (not on object), create rectangle at that position
    - Use default size (100x100)
    - Generate unique ID (uuid)
    - Add to local state

- [ ] **5.5 Create ShapeRenderer component**
  - Files created:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Renders PixiJS Graphics for each shape
    - Takes shape data, renders appropriate PixiJS object
    - Handles rectangle drawing

- [ ] **5.6 Integrate shape rendering**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Pass shapes to ShapeRenderer
    - Update PixiJS stage when shapes change

- [ ] **5.7 Implement Firestore write for new shapes**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `createShape(canvasId, shape)` - Write shape to Firestore
    - Path: `canvases/{canvasId}/objects/{shapeId}`

- [ ] **5.8 Create useFirestore hook**
  - Files created:
    - `src/hooks/useFirestore.ts`
  - Content:
    - Listen to shapes collection
    - Return shapes array
    - Auto-update when Firestore changes

- [ ] **5.9 Sync local shape creation to Firestore**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - When shape created locally, write to Firestore
    - Optimistic update (show immediately, sync in background)

- [ ] **5.10 Sync Firestore shapes to local state**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Listen to useFirestore hook
    - Update shapes state when Firestore changes
    - Deduplicate (avoid showing same shape twice)

- [ ] **5.11 Test object sync with 2 users**
  - Action:
    - Open 2 browser windows
    - Create rectangle in window 1
    - Verify it appears in window 2 instantly
  - Check Firestore Console to see shape data

**Files Created/Modified:**
- Created: `src/components/canvas/Toolbar.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/hooks/useFirestore.ts`, `src/utils/shapeDefaults.ts`
- Modified: `src/types/shapes.ts`, `src/services/firestore.ts`, `src/components/canvas/Canvas.tsx`

**Acceptance Criteria:**
- [ ] Can create rectangles by clicking canvas
- [ ] Rectangles render correctly (100x100, blue)
- [ ] Rectangles sync between users <100ms
- [ ] Shapes persist in Firestore
- [ ] Shapes reload on page refresh
- [ ] 60 FPS maintained

---

### PR #6: Object Manipulation (Move/Drag)

**Goal:** Select and drag objects, sync movements across users

**Branch:** `feature/object-manipulation`

**Dependencies:** PR #1-5

#### Subtasks:
- [ ] **6.1 Implement object selection**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Detect click on shape (hit testing)
    - Set selected shape in state
    - Visual feedback (highlight selected shape)

- [ ] **6.2 Add selection visual feedback**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Draw selection outline on selected shape
    - Different color or stroke width

- [ ] **6.3 Implement drag functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - On mouse down on shape: start dragging
    - On mouse move: update shape position
    - On mouse up: stop dragging
    - Handle viewport transform (canvas coords vs screen coords)

- [ ] **6.4 Sync position updates to Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `updateShapePosition(canvasId, shapeId, x, y)` - Update in Firestore

- [ ] **6.5 Throttle position updates during drag**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Don't write to Firestore every frame (too expensive)
    - Throttle to 10-20 updates per second
    - Final position written on mouse up

- [ ] **6.6 Implement optimistic updates**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Update local state immediately on drag
    - Sync to Firestore in background
    - Smooth UX (no lag)

- [ ] **6.7 Handle simultaneous edits (last write wins)**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - No conflict resolution logic (last write wins)
    - Add timestamp to updates
    - Document this behavior in code comments

- [ ] **6.8 Test drag and sync**
  - Action:
    - Open 2 browser windows
    - Drag shape in window 1
    - Verify window 2 sees movement
  - Test edge cases:
    - Both users drag same shape (last write wins)
    - Rapid dragging

**Files Created/Modified:**
- Modified: `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Can select shapes by clicking
- [ ] Selected shape has visual feedback
- [ ] Can drag shapes smoothly
- [ ] Drag updates sync to other users <100ms
- [ ] 60 FPS during drag
- [ ] Position persists after refresh

---

### PR #7: Presence Awareness & MVP Polish

**Goal:** Show who's online, add basic UI polish

**Branch:** `feature/presence`

**Dependencies:** PR #1-6

#### Subtasks:
- [ ] **7.1 Create usePresence hook**
  - Files created:
    - `src/hooks/usePresence.ts`
  - Content:
    - Write own presence to Firestore on mount
    - Update lastSeen timestamp every 30 seconds
    - Listen to other users' presence
    - Return list of active users

- [ ] **7.2 Implement presence in Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `setUserPresence(canvasId, userId, userName, isActive)`
    - Path: `canvases/{canvasId}/users/{userId}`
    - Use onDisconnect() to set isActive=false on disconnect

- [ ] **7.3 Create UserList component**
  - Files created:
    - `src/components/collaboration/UserList.tsx`
  - Content:
    - Display list of online users
    - Show user name and colored dot
    - Count: "3 users online"

- [ ] **7.4 Create PresenceIndicator component**
  - Files created:
    - `src/components/collaboration/PresenceIndicator.tsx`
  - Content:
    - Small colored dots for each user
    - Shows in header or corner

- [ ] **7.5 Integrate presence into app**
  - Files modified:
    - `src/App.tsx`
    - `src/components/layout/Header.tsx`
  - Content:
    - Use usePresence hook
    - Display UserList in sidebar or header
    - Show presence indicator

- [ ] **7.6 Add basic error handling**
  - Files modified:
    - `src/services/firebase.ts`
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Try/catch around Firestore operations
    - Display error messages to user
    - Log errors to console

- [ ] **7.7 Add loading states**
  - Files modified:
    - `src/App.tsx`
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Show "Loading canvas..." while Firestore loads
    - Show spinner during auth
    - Prevent interaction until loaded

- [ ] **7.8 Polish UI styling**
  - Files modified:
    - `src/index.css`
    - Component files (add Tailwind classes)
  - Content:
    - Clean, modern design
    - Dark mode (optional)
    - Responsive layout
    - Professional look for demo

- [ ] **7.9 Add keyboard shortcuts**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Delete key: delete selected shape
    - Escape key: deselect shape
    - Space + drag: pan canvas (optional)

- [ ] **7.10 Test complete MVP flow**
  - Action:
    - Open 3 browser windows
    - Sign in as different users
    - Verify all features work:
      - ✓ Cursors sync
      - ✓ Shapes sync
      - ✓ Drag syncs
      - ✓ Presence shows all users
      - ✓ Persistence works
      - ✓ 60 FPS maintained

**Files Created/Modified:**
- Created: `src/hooks/usePresence.ts`, `src/components/collaboration/UserList.tsx`, `src/components/collaboration/PresenceIndicator.tsx`
- Modified: `src/services/firestore.ts`, `src/App.tsx`, `src/components/layout/Header.tsx`, `src/components/canvas/Canvas.tsx`, `src/index.css`

**Acceptance Criteria:**
- [ ] User list shows all online users
- [ ] Presence updates within 5 seconds of join/leave
- [ ] Loading states display correctly
- [ ] Basic error handling works
- [ ] UI looks polished and professional
- [ ] Delete key deletes selected shape

---

### PR #8: Deployment & MVP Verification

**Goal:** Deploy to Vercel and verify MVP requirements

**Branch:** `feature/deployment`

**Dependencies:** PR #1-7

#### Subtasks:
- [ ] **8.1 Create production environment config**
  - Files created:
    - `.env.production` (add to .gitignore)
  - Content:
    - Production Firebase keys
    - Production API URLs

- [ ] **8.2 Update Firebase security rules**
  - Action: In Firebase Console
    - Firestore rules: Require authentication
    - RTDB rules: Require authentication
  - Files created (local documentation):
    - `firestore.rules` (for reference)
    - `rtdb.rules` (for reference)

- [ ] **8.3 Set up Vercel project**
  - Action: Go to Vercel.com
    - Import GitHub repo
    - Configure build settings (Vite)
    - Add environment variables

- [ ] **8.4 Configure Vercel deployment**
  - Files created:
    - `vercel.json` (optional, for SPA routing)
  - Content:
    - Redirect all routes to index.html

- [ ] **8.5 Deploy to Vercel**
  - Action: Push to main branch (or trigger deploy)
  - Verify deployment succeeds
  - Get public URL

- [ ] **8.6 Test deployed app**
  - Action: Open deployed URL
  - Test all MVP features:
    - [ ] Google Sign-In works
    - [ ] Canvas loads
    - [ ] Can create shapes
    - [ ] Can move shapes
    - [ ] Cursors sync
    - [ ] Presence works
    - [ ] Persistence works

- [ ] **8.7 Test with multiple users on deployed app**
  - Action: Open deployed URL in 2+ browsers/devices
  - Verify real-time sync works in production

- [ ] **8.8 Update README with deployed URL**
  - Files modified:
    - `README.md`
  - Content:
    - Add "Live Demo: [URL]" section
    - Update setup instructions for deployment

- [ ] **8.9 Create MVP verification checklist**
  - Files created:
    - `MVP_CHECKLIST.md`
  - Content:
    - List all 8 MVP requirements
    - Check off each one with evidence

- [ ] **8.10 Final MVP testing**
  - Action: Test ALL MVP requirements on deployed app:
    - [ ] Basic canvas with pan/zoom
    - [ ] At least one shape type (rectangle)
    - [ ] Ability to create and move objects
    - [ ] Real-time sync between 2+ users
    - [ ] Multiplayer cursors with name labels
    - [ ] Presence awareness (who's online)
    - [ ] User authentication (Google Sign-In)
    - [ ] Deployed and publicly accessible

**Files Created/Modified:**
- Created: `.env.production`, `vercel.json`, `firestore.rules`, `rtdb.rules`, `MVP_CHECKLIST.md`
- Modified: `README.md`

**Acceptance Criteria:**
- [ ] App is deployed at public URL
- [ ] All MVP requirements verified and working
- [ ] Security rules implemented
- [ ] Performance targets met (60 FPS, <100ms sync)
- [ ] README has live demo link

**🎉 MVP COMPLETE! Checkpoint passed!**

---

## Full Canvas Features (Days 2-4) - PRs 9-12

### PR #9: Multiple Shape Types (Circle, Line, Text)

**Goal:** Add circles, lines, and text shapes

**Branch:** `feature/multiple-shapes`

**Dependencies:** PR #1-8

#### Subtasks:
- [ ] **9.1 Update shape types**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - Add `Circle` type (x, y, radius, fillColor)
    - Add `Line` type (x1, y1, x2, y2, strokeColor, strokeWidth)
    - Add `Text` type (x, y, content, fontSize, color)

- [ ] **9.2 Add shape defaults**
  - Files modified:
    - `src/utils/shapeDefaults.ts`
  - Content:
    - `createDefaultCircle(x, y)` - 50px radius, red
    - `createDefaultLine(x, y)` - 150px horizontal, black
    - `createDefaultText(x, y)` - "Double-click to edit", 16px

- [ ] **9.3 Update Toolbar with new shape tools**
  - Files modified:
    - `src/components/canvas/Toolbar.tsx`
  - Content:
    - Add circle button
    - Add line button
    - Add text button
    - Visual indication of selected tool

- [ ] **9.4 Implement circle rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Render PixiJS Graphics circle
    - Handle fill color

- [ ] **9.5 Implement line rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Render PixiJS Graphics line
    - Handle stroke color and width

- [ ] **9.6 Implement text rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Render PixiJS Text object
    - Handle font size and color

- [ ] **9.7 Update creation logic for all shapes**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Check currently selected tool
    - Create appropriate shape type on click

- [ ] **9.8 Update Firestore sync for all shapes**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - Handle all shape types in CRUD operations
    - Validate shape data

- [ ] **9.9 Update selection and drag for all shapes**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Hit testing for circles (distance from center)
    - Hit testing for lines (distance from line)
    - Hit testing for text (bounding box)
    - Drag all shape types

- [ ] **9.10 Test all shape types**
  - Action:
    - Create rectangle, circle, line, text
    - Verify rendering
    - Verify sync between users
    - Verify drag works for all types

**Files Created/Modified:**
- Modified: `src/types/shapes.ts`, `src/utils/shapeDefaults.ts`, `src/components/canvas/Toolbar.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/components/canvas/Canvas.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Can create rectangles, circles, lines, text
- [ ] All shapes render correctly
- [ ] All shapes sync between users
- [ ] All shapes can be selected and dragged
- [ ] Visual defaults match spec (100x100 rect, 100px circle, etc.)

---

### PR #10: Resize & Rotate Objects

**Goal:** Add resize handles and rotation for all shapes

**Branch:** `feature/resize-rotate`

**Dependencies:** PR #1-9

#### Subtasks:
- [ ] **10.1 Add rotation property to shapes**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - Add `rotation` field (degrees) to all shape types

- [ ] **10.2 Create resize handle component**
  - Files created:
    - `src/components/canvas/ResizeHandles.tsx`
  - Content:
    - Render 8 resize handles around selected shape
    - Corner handles (NW, NE, SE, SW)
    - Edge handles (N, E, S, W)

- [ ] **10.3 Implement resize interaction**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Detect mouse down on resize handle
    - Track which handle is being dragged
    - Update shape size based on handle movement
    - Maintain aspect ratio (for shift-drag, optional)

- [ ] **10.4 Add rotation handle**
  - Files modified:
    - `src/components/canvas/ResizeHandles.tsx`
  - Content:
    - Render rotation handle above selected shape
    - Circular arrow icon

- [ ] **10.5 Implement rotation interaction**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Detect mouse down on rotation handle
    - Calculate angle from shape center to mouse
    - Update shape rotation
    - Show rotation angle indicator (optional)

- [ ] **10.6 Update shape rendering with rotation**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Apply rotation transform to all shapes
    - Rotate around shape center

- [ ] **10.7 Sync resize and rotate to Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `updateShapeSize(canvasId, shapeId, width, height)`
    - `updateShapeRotation(canvasId, shapeId, rotation)`
    - Throttle updates during interaction

- [ ] **10.8 Handle resize for different shape types**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Rectangle: resize width/height
    - Circle: resize radius (one handle only)
    - Line: move endpoints
    - Text: resize font size (optional, or just bounding box)

- [ ] **10.9 Add visual feedback during resize/rotate**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Show dimensions while resizing (e.g., "150 × 200")
    - Show angle while rotating (e.g., "45°")
    - Ghost outline (optional)

- [ ] **10.10 Test resize and rotate**
  - Action:
    - Select shapes
    - Resize using handles
    - Rotate using rotation handle
    - Verify sync between users
    - Test all shape types

**Files Created/Modified:**
- Created: `src/components/canvas/ResizeHandles.tsx`
- Modified: `src/types/shapes.ts`, `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Resize handles appear on selected shapes
- [ ] Can resize shapes by dragging handles
- [ ] Rotation handle appears on selected shapes
- [ ] Can rotate shapes
- [ ] Resize and rotate sync between users
- [ ] Works for all shape types
- [ ] 60 FPS maintained during interaction

---

### PR #11: Multi-Select & Layer Management

**Goal:** Select multiple objects, basic layer ordering

**Branch:** `feature/multi-select`

**Dependencies:** PR #1-10

#### Subtasks:
- [ ] **11.1 Implement shift-click multi-select**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Hold shift + click to add to selection
    - Track selected shapes in array (not single shape)
    - Visual feedback for all selected shapes

- [ ] **11.2 Implement drag-to-select box**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Click and drag on empty canvas to draw selection box
    - Detect shapes within selection box
    - Add to selection

- [ ] **11.3 Update selection rendering for multiple shapes**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Highlight all selected shapes
    - Show bounding box around all selected shapes (optional)

- [ ] **11.4 Implement multi-drag**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Drag all selected shapes together
    - Maintain relative positions

- [ ] **11.5 Add delete functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Delete key deletes all selected shapes
    - Confirm deletion (optional)
    - Sync deletion to Firestore

- [ ] **11.6 Implement delete in Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `deleteShape(canvasId, shapeId)`
    - Batch delete for multiple shapes

- [ ] **11.7 Add duplicate functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Cmd+D / Ctrl+D duplicates selected shapes
    - Offset duplicates slightly (e.g., +10px x/y)
    - Sync to Firestore

- [ ] **11.8 Add zIndex property to shapes**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - Add `zIndex` field to all shapes
    - Higher zIndex = rendered on top

- [ ] **11.9 Implement layer ordering**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Bring to front: Set zIndex to max + 1
    - Send to back: Set zIndex to min - 1
    - Add keyboard shortcuts (Cmd+] / Cmd+[)

- [ ] **11.10 Sort shapes by zIndex when rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Sort shapes array by zIndex before rendering
    - Update zIndex in Firestore

- [ ] **11.11 Add layer controls to UI (optional)**
  - Files created (optional):
    - `src/components/canvas/LayerPanel.tsx`
  - Content:
    - Show list of all shapes
    - Reorder by dragging
    - Select by clicking

- [ ] **11.12 Test multi-select and layers**
  - Action:
    - Shift-click multiple shapes
    - Drag-select multiple shapes
    - Drag multiple shapes together
    - Delete multiple shapes
    - Duplicate shapes
    - Change layer order
    - Verify all syncs between users

**Files Created/Modified:**
- Created: `src/components/canvas/LayerPanel.tsx` (optional)
- Modified: `src/types/shapes.ts`, `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Can select multiple shapes (shift-click)
- [ ] Can drag-select multiple shapes
- [ ] Can drag multiple shapes together
- [ ] Delete key deletes selected shapes
- [ ] Cmd+D duplicates shapes
- [ ] Can bring to front / send to back
- [ ] All operations sync between users

---

### PR #12: Performance Optimization

**Goal:** Ensure 60 FPS with 500+ objects and 5+ users

**Branch:** `feature/performance`

**Dependencies:** PR #1-11

#### Subtasks:
- [ ] **12.1 Implement object pooling for PixiJS**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Reuse PixiJS Graphics objects instead of recreating
    - Track which objects are in use
    - Clear and reuse on shape delete

- [ ] **12.2 Optimize Firestore listeners**
  - Files modified:
    - `src/hooks/useFirestore.ts`
  - Content:
    - Use more specific queries (only visible shapes)
    - Detach listeners when component unmounts
    - Avoid unnecessary re-renders

- [ ] **12.3 Implement viewport culling (render only visible objects)**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Calculate which shapes are in viewport
    - Only render visible shapes
    - Update on pan/zoom

- [ ] **12.4 Optimize cursor updates**
  - Files modified:
    - `src/hooks/useCursors.ts`
  - Content:
    - Verify throttling (20 updates/sec)
    - Use RTDB (should already be done in PR #4)
    - Batch cursor updates if possible

- [ ] **12.5 Optimize shape update batching**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - Use Firestore batch writes for multiple updates
    - Throttle non-critical updates (position during drag)
    - Only send final position on mouse up

- [ ] **12.6 Add performance monitoring**
  - Files created:
    - `src/utils/performance.ts`
  - Content:
    - Track FPS
    - Log render times
    - Warn if FPS drops below 50

- [ ] **12.7 Profile with Chrome DevTools**
  - Action:
    - Open Chrome DevTools → Performance tab
    - Record while interacting (pan, zoom, drag)
    - Identify bottlenecks
    - Optimize hot paths

- [ ] **12.8 Test with 500+ objects**
  - Action:
    - Create test function to generate 500 shapes
    - Verify 60 FPS maintained
    - Test pan, zoom, selection, drag

- [ ] **12.9 Test with 5+ concurrent users**
  - Action:
    - Open 5+ browser windows
    - All users interact simultaneously
    - Verify no performance degradation
    - Check network tab for excessive traffic

- [ ] **12.10 Document performance optimizations**
  - Files modified:
    - `README.md`
  - Content:
    - List optimizations implemented
    - Performance benchmarks
    - Known limitations

**Files Created/Modified:**
- Created: `src/utils/performance.ts`
- Modified: `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/hooks/useFirestore.ts`, `src/hooks/useCursors.ts`, `src/services/firestore.ts`, `README.md`

**Acceptance Criteria:**
- [ ] 60 FPS with 500+ objects
- [ ] 60 FPS with 5+ concurrent users
- [ ] Cursor sync <50ms
- [ ] Object sync <100ms
- [ ] No memory leaks (test over 10+ minutes)
- [ ] Network traffic is reasonable

---

## AI Canvas Agent (Days 5-7) - PRs 13-17

### PR #13: AI Integration - Basic Setup

**Goal:** Set up Claude API and basic function calling

**Branch:** `feature/ai-setup`

**Dependencies:** PR #1-12

#### Subtasks:
- [ ] **13.1 Install Anthropic SDK**
  - Run: `npm install @anthropic-ai/sdk`
  - Files modified: `package.json`

- [ ] **13.2 Add Claude API key to environment**
  - Files modified:
    - `.env.local` (add VITE_ANTHROPIC_API_KEY)
    - `.env.example` (add placeholder)
  - Action: Get API key from Anthropic Console

- [ ] **13.3 Create Claude service**
  - Files created:
    - `src/services/claude.ts`
  - Content:
    - Initialize Anthropic client
    - `sendMessage(prompt, tools)` - Send message with function calling
    - Handle streaming responses (optional)

- [ ] **13.4 Define AI types**
  - Files created:
    - `src/types/ai.ts`
  - Content:
    - `AICommand` type
    - `AIFunctionCall` type
    - Tool schemas

- [ ] **13.5 Create function calling schemas**
  - Files modified:
    - `src/services/claude.ts`
  - Content:
    - Define tools: createShape, moveShape, resizeShape, rotateShape, createText, getCanvasState
    - JSON schema for each function
    - Match Claude's function calling format

- [ ] **13.6 Create AIPanel component**
  - Files created:
    - `src/components/ai/AIPanel.tsx`
  - Content:
    - Toggleable panel (right side)
    - Shows AI chat interface
    - Open/close button

- [ ] **13.7 Create AIInput component**
  - Files created:
    - `src/components/ai/AIInput.tsx`
  - Content:
    - Text input for AI commands
    - Send button
    - Show recent commands (history)

- [ ] **13.8 Create AIStatusIndicator component**
  - Files created:
    - `src/components/ai/AIStatusIndicator.tsx`
  - Content:
    - Shows "AI is thinking..."
    - Shows errors
    - Shows success messages

- [ ] **13.9 Create useAI hook**
  - Files created:
    - `src/hooks/useAI.ts`
  - Content:
    - `sendCommand(text)` - Send command to Claude
    - Parse function calls from response
    - Execute functions on canvas
    - Handle errors

- [ ] **13.10 Integrate AI panel into app**
  - Files modified:
    - `src/App.tsx`
  - Content:
    - Render AIPanel
    - Connect useAI hook

- [ ] **13.11 Test basic AI flow (without real commands)**
  - Action:
    - Open AI panel
    - Type "hello"
    - Verify Claude responds
    - Check function calling works (even if no functions called)

**Files Created/Modified:**
- Created: `src/services/claude.ts`, `src/types/ai.ts`, `src/components/ai/AIPanel.tsx`, `src/components/ai/AIInput.tsx`, `src/components/ai/AIStatusIndicator.tsx`, `src/hooks/useAI.ts`
- Modified: `.env.local`, `.env.example`, `package.json`, `src/App.tsx`

**Acceptance Criteria:**
- [ ] Claude API integration works
- [ ] AI panel displays and opens/closes
- [ ] Can send messages to Claude
- [ ] Function calling schemas defined
- [ ] No errors in console

---

### PR #14: AI Creation Commands

**Goal:** Implement AI commands to create shapes

**Branch:** `feature/ai-creation`

**Dependencies:** PR #1-13

**Required Commands (minimum 2):**
- "Create a red circle at position 100, 200"
- "Add a text layer that says 'Hello World'"
- "Make a 200x300 rectangle"

#### Subtasks:
- [ ] **14.1 Implement createShape function**
  - Files created:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeCreateShape(type, x, y, width, height, color)` - Create shape and sync to Firestore
    - Handle all shape types

- [ ] **14.2 Implement createText function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeCreateText(text, x, y, fontSize, color)` - Create text shape

- [ ] **14.3 Connect function calls to canvas**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - When Claude calls `createShape`, execute `executeCreateShape`
    - When Claude calls `createText`, execute `executeCreateText`
    - Pass canvasId and canvas context

- [ ] **14.4 Implement getCanvasState function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `getCanvasState()` - Return current shapes as JSON
    - Send to Claude for context

- [ ] **14.5 Test: "Create a red circle at position 100, 200"**
  - Action:
    - Type command in AI panel
    - Verify Claude calls createShape function
    - Verify circle appears on canvas
    - Verify other users see the circle

- [ ] **14.6 Test: "Add a text layer that says 'Hello World'"**
  - Action:
    - Type command
    - Verify text appears on canvas
    - Verify sync between users

- [ ] **14.7 Test: "Make a 200x300 rectangle"**
  - Action:
    - Type command
    - Verify rectangle with correct size appears
    - Verify positioned reasonably (center or default position)

- [ ] **14.8 Handle position defaults intelligently**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - If no position specified, place at canvas center or viewport center
    - Don't overlap with existing shapes (smart placement)

- [ ] **14.9 Add AI command history**
  - Files modified:
    - `src/components/ai/AIPanel.tsx`
  - Content:
    - Show list of past commands
    - Show which shapes were created by each command
    - Click to select those shapes (optional)

- [ ] **14.10 Test multiple creation commands**
  - Action:
    - Test 5+ different creation commands
    - Verify all work correctly
    - Test with 2 users (both using AI)

**Files Created/Modified:**
- Created: `src/utils/aiHelpers.ts`
- Modified: `src/hooks/useAI.ts`, `src/components/ai/AIPanel.tsx`

**Acceptance Criteria:**
- [ ] Can create shapes via AI commands
- [ ] At least 3 creation commands work
- [ ] AI-created shapes sync to all users
- [ ] Shapes appear at reasonable positions
- [ ] Response time <2 seconds

---

### PR #15: AI Manipulation Commands

**Goal:** Implement AI commands to move, resize, rotate shapes

**Branch:** `feature/ai-manipulation`

**Dependencies:** PR #1-14

**Required Commands (minimum 2):**
- "Move the blue rectangle to the center"
- "Resize the circle to be twice as big"
- "Rotate the text 45 degrees"

#### Subtasks:
- [ ] **15.1 Implement moveShape function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeMoveShape(shapeId, x, y)` - Move shape and update Firestore
    - Handle shape identification (by color, type, etc.)

- [ ] **15.2 Implement shape identification logic**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `findShape(descriptor)` - Find shape by description
    - "the blue rectangle" → find rectangle with blue color
    - "the circle" → find circle (or newest circle if multiple)

- [ ] **15.3 Implement smart positioning**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - "to the center" → calculate canvas center
    - "to the left" → move left 200px
    - "next to X" → position relative to another shape

- [ ] **15.4 Implement resizeShape function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeResizeShape(shapeId, width, height)` - Resize shape
    - Handle relative sizes ("twice as big" = multiply by 2)

- [ ] **15.5 Implement rotateShape function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeRotateShape(shapeId, degrees)` - Rotate shape
    - Handle absolute and relative rotation

- [ ] **15.6 Connect manipulation functions to AI**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - When Claude calls moveShape, execute it
    - When Claude calls resizeShape, execute it
    - When Claude calls rotateShape, execute it

- [ ] **15.7 Test: "Move the blue rectangle to the center"**
  - Action:
    - Create blue rectangle first
    - Send move command
    - Verify rectangle moves to center
    - Verify sync between users

- [ ] **15.8 Test: "Resize the circle to be twice as big"**
  - Action:
    - Create circle first
    - Send resize command
    - Verify circle doubles in size

- [ ] **15.9 Test: "Rotate the text 45 degrees"**
  - Action:
    - Create text first
    - Send rotate command
    - Verify text rotates 45 degrees

- [ ] **15.10 Handle ambiguity**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - If multiple shapes match, pick most recent
    - Or ask user to clarify (optional)
    - Log warning in AI panel

- [ ] **15.11 Test multiple manipulation commands**
  - Action:
    - Test 5+ different manipulation commands
    - Test chained commands ("create a circle, then move it left")

**Files Created/Modified:**
- Modified: `src/utils/aiHelpers.ts`, `src/hooks/useAI.ts`

**Acceptance Criteria:**
- [ ] Can move shapes via AI commands
- [ ] Can resize shapes via AI commands
- [ ] Can rotate shapes via AI commands
- [ ] At least 3 manipulation commands work
- [ ] Shape identification works correctly
- [ ] All operations sync between users

---

### PR #16: AI Layout Commands

**Goal:** Implement AI commands for arranging multiple shapes

**Branch:** `feature/ai-layout`

**Dependencies:** PR #1-15

**Required Commands (minimum 2):**
- "Arrange these shapes in a horizontal row"
- "Create a grid of 3x3 squares"
- "Space these elements evenly"

#### Subtasks:
- [ ] **16.1 Implement arrangeHorizontal function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeArrangeHorizontal(shapeIds, spacing)` - Arrange shapes in row
    - Calculate positions with even spacing
    - Update all shapes in Firestore

- [ ] **16.2 Implement arrangeVertical function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeArrangeVertical(shapeIds, spacing)` - Arrange shapes in column

- [ ] **16.3 Implement createGrid function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeCreateGrid(rows, cols, shapeType, spacing)` - Create grid of shapes
    - Calculate positions for each shape
    - Batch create in Firestore

- [ ] **16.4 Implement distributeEvenly function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeDistributeEvenly(shapeIds, axis)` - Space shapes evenly
    - Calculate equal spacing between shapes
    - Update positions

- [ ] **16.5 Connect layout functions to AI**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Add layout functions to tool schema
    - Execute when Claude calls them

- [ ] **16.6 Test: "Arrange these shapes in a horizontal row"**
  - Action:
    - Create 3+ shapes
    - Send command
    - Verify shapes arrange horizontally with even spacing

- [ ] **16.7 Test: "Create a grid of 3x3 squares"**
  - Action:
    - Send command
    - Verify 9 squares appear in 3x3 grid
    - Verify spacing is even

- [ ] **16.8 Test: "Space these elements evenly"**
  - Action:
    - Create 3+ shapes in random positions
    - Send command
    - Verify shapes distribute evenly

- [ ] **16.9 Implement smart selection for layout commands**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - "these shapes" → use currently selected shapes
    - If none selected, use all shapes
    - Or use shapes matching a description

- [ ] **16.10 Test multiple layout commands**
  - Action:
    - Test 5+ layout variations
    - Test with different numbers of shapes
    - Verify all sync between users

**Files Created/Modified:**
- Modified: `src/utils/aiHelpers.ts`, `src/hooks/useAI.ts`

**Acceptance Criteria:**
- [ ] Can arrange shapes horizontally/vertically
- [ ] Can create grids via AI
- [ ] Can distribute shapes evenly
- [ ] At least 3 layout commands work
- [ ] All operations sync between users
- [ ] Performance remains good (60 FPS)

---

### PR #17: Complex AI Commands & Polish

**Goal:** Implement multi-step complex commands and polish AI UX

**Branch:** `feature/ai-complex`

**Dependencies:** PR #1-16

**Complex Commands (stretch goal, minimum 1):**
- "Create a login form with username and password fields"
- "Build a navigation bar with 4 menu items"
- "Make a card layout with title, image, and description"

#### Subtasks:
- [ ] **17.1 Implement multi-step command execution**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Allow Claude to call multiple functions in sequence
    - Execute each function in order
    - Show progress to user

- [ ] **17.2 Implement createLoginForm function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - Create 2 text labels ("Username", "Password")
    - Create 2 rectangles (input fields)
    - Create 1 button (submit)
    - Arrange in vertical layout
    - Return group of shapes

- [ ] **17.3 Implement createNavBar function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - Create horizontal bar (rectangle)
    - Create N text items (menu items)
    - Arrange in horizontal row
    - Proper spacing and alignment

- [ ] **17.4 Implement createCard function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - Create container rectangle
    - Create title text
    - Create image placeholder rectangle
    - Create description text
    - Arrange in vertical layout

- [ ] **17.5 Test: "Create a login form with username and password fields"**
  - Action:
    - Send command
    - Verify form appears with all elements
    - Verify proper alignment and spacing
    - Verify sync between users

- [ ] **17.6 Test: "Build a navigation bar with 4 menu items"**
  - Action:
    - Send command
    - Verify nav bar appears with 4 items
    - Verify horizontal layout

- [ ] **17.7 Test: "Make a card layout with title, image, and description"**
  - Action:
    - Send command
    - Verify card appears with all components

- [ ] **17.8 Add AI visual feedback**
  - Files modified:
    - `src/components/ai/AIStatusIndicator.tsx`
  - Content:
    - Show progress bar during multi-step commands
    - Highlight shapes being created
    - Show "Created 5 shapes" summary

- [ ] **17.9 Improve AI error handling**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Catch and display errors clearly
    - Suggest fixes ("No blue rectangle found. Did you mean red?")
    - Retry logic for API failures

- [ ] **17.10 Add AI command suggestions**
  - Files modified:
    - `src/components/ai/AIPanel.tsx`
  - Content:
    - Show example commands
    - Autocomplete common commands
    - Click to insert

- [ ] **17.11 Add AI undo**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Track shapes created by each command
    - "Undo last AI command" button
    - Delete shapes created by last command

- [ ] **17.12 Test AI with multiple users**
  - Action:
    - Open 2+ browser windows
    - Both users send AI commands
    - Verify no conflicts
    - Verify all commands sync

- [ ] **17.13 Polish AI UI**
  - Files modified:
    - `src/components/ai/*.tsx`
    - `src/index.css`
  - Content:
    - Clean, modern design
    - Smooth animations
    - Loading states
    - Success/error states

- [ ] **17.14 Performance test with AI**
  - Action:
    - Send command that creates 50+ shapes (e.g., "create 10x10 grid")
    - Verify 60 FPS maintained
    - Verify sync works

**Files Created/Modified:**
- Modified: `src/utils/aiHelpers.ts`, `src/hooks/useAI.ts`, `src/components/ai/AIPanel.tsx`, `src/components/ai/AIStatusIndicator.tsx`, `src/index.css`

**Acceptance Criteria:**
- [ ] At least 1 complex command works (login form, nav bar, or card)
- [ ] Multi-step commands execute correctly
- [ ] AI UX is polished (loading states, errors, suggestions)
- [ ] Can undo AI commands
- [ ] Multiple users can use AI simultaneously
- [ ] All AI-created shapes sync between users
- [ ] Total of 6+ command types work across all AI PRs

---

## Final Submission (Day 7) - PR #18

### PR #18: Documentation, Demo Video & Final Polish

**Goal:** Create demo video, write AI development log, final testing

**Branch:** `feature/final-submission`

**Dependencies:** PR #1-17

#### Subtasks:
- [ ] **18.1 Update README with complete documentation**
  - Files modified:
    - `README.md`
  - Content:
    - Project description
    - Live demo link
    - Features list
    - Tech stack explanation
    - Setup instructions
    - Architecture overview
    - Screenshots

- [ ] **18.2 Create architecture documentation**
  - Files created:
    - `ARCHITECTURE.md`
  - Content:
    - System architecture diagram (draw.io or similar)
    - Data flow (client → Firestore → client)
    - Real-time sync explanation
    - AI integration flow
    - Performance optimizations

- [ ] **18.3 Document Firestore structure**
  - Files created:
    - `DATABASE.md`
  - Content:
    - Firestore collections and documents
    - RTDB structure
    - Security rules
    - Indexes used

- [ ] **18.4 Write AI Development Log (1 page)**
  - Files created:
    - `AI_DEVELOPMENT_LOG.md`
  - Content (as specified in project requirements):
    1. Tools & Workflow: AI coding tools used (Claude Code, etc.)
    2. Prompting Strategies: 3-5 effective prompts that worked well
    3. Code Analysis: % of AI-generated vs hand-written code
    4. Strengths & Limitations: Where AI excelled and struggled
    5. Key Learnings: Insights about working with AI

- [ ] **18.5 Record demo video (3-5 minutes)**
  - Files created:
    - `demo-video.mp4` (or upload to YouTube/Loom)
  - Content:
    1. Intro: Project overview (30 sec)
    2. Real-time collaboration demo (1 min):
       - Show 2 users editing simultaneously
       - Cursors syncing
       - Shapes syncing
       - Presence awareness
    3. AI commands demo (2 min):
       - Show 3-5 different AI commands
       - Creation, manipulation, layout commands
       - Show complex command (login form)
    4. Architecture explanation (1 min):
       - Quick overview of tech stack
       - Firestore structure
       - Performance optimizations
    5. Outro: Key achievements and future work (30 sec)

- [ ] **18.6 Create setup guide**
  - Files created:
    - `SETUP.md`
  - Content:
    - Prerequisites (Node, npm)
    - Clone repo
    - Install dependencies
    - Set up Firebase project
    - Get Claude API key
    - Configure environment variables
    - Run locally
    - Deploy to Vercel

- [ ] **18.7 Add screenshots to repo**
  - Files created:
    - `screenshots/` folder
    - `screenshots/canvas.png`
    - `screenshots/multiplayer.png`
    - `screenshots/ai-panel.png`
  - Use in README

- [ ] **18.8 Final testing checklist**
  - Action: Test ALL features on deployed app:
    - [ ] Google Sign-In
    - [ ] Canvas pan/zoom (60 FPS)
    - [ ] Create all shape types
    - [ ] Move, resize, rotate shapes
    - [ ] Multi-select
    - [ ] Delete, duplicate
    - [ ] Layer ordering
    - [ ] Cursor sync (<50ms)
    - [ ] Object sync (<100ms)
    - [ ] Presence awareness
    - [ ] 500+ objects (60 FPS)
    - [ ] 5+ concurrent users
    - [ ] AI creation commands (3+)
    - [ ] AI manipulation commands (3+)
    - [ ] AI layout commands (2+)
    - [ ] Complex AI command (1+)
    - [ ] State persistence

- [ ] **18.9 Create submission checklist**
  - Files created:
    - `SUBMISSION_CHECKLIST.md`
  - Content:
    - [ ] GitHub repo is public
    - [ ] README has live demo link
    - [ ] Demo video uploaded (link in README)
    - [ ] AI Development Log completed
    - [ ] Architecture documentation complete
    - [ ] All features working on deployed app
    - [ ] 60 FPS performance verified
    - [ ] Multi-user testing completed

- [ ] **18.10 Clean up code**
  - Action:
    - Remove console.logs
    - Remove commented code
    - Fix any TypeScript warnings
    - Run linter
    - Format code

- [ ] **18.11 Final Firestore security rules**
  - Action: In Firebase Console
  - Content:
    - Lock down Firestore rules
    - Only authenticated users can read/write
    - Users can only update their own presence
    - Add validation rules

- [ ] **18.12 Add LICENSE file**
  - Files created:
    - `LICENSE`
  - Content:
    - MIT License (or your choice)

- [ ] **18.13 Final deployment**
  - Action:
    - Merge all PRs to main
    - Verify Vercel auto-deploys
    - Test deployed app one more time
    - Share link!

**Files Created/Modified:**
- Created: `ARCHITECTURE.md`, `DATABASE.md`, `AI_DEVELOPMENT_LOG.md`, `SETUP.md`, `SUBMISSION_CHECKLIST.md`, `screenshots/*`, `LICENSE`, demo video
- Modified: `README.md`, Firestore security rules

**Acceptance Criteria:**
- [ ] Demo video is 3-5 minutes and shows all required features
- [ ] AI Development Log is complete (1 page)
- [ ] README is comprehensive with live demo link
- [ ] All documentation is clear and professional
- [ ] Code is clean and well-commented
- [ ] All features work on deployed app
- [ ] Ready to submit!

---

## Summary

**Total PRs:** 18

**MVP (24 hours):** PR #1-8
**Full Canvas (Days 2-4):** PR #9-12
**AI Agent (Days 5-7):** PR #13-17
**Final Submission (Day 7):** PR #18

**Key Milestones:**
- PR #4: Cursor sync working (hardest part!)
- PR #8: MVP complete and deployed
- PR #12: Performance targets met
- PR #17: All 6+ AI commands working
- PR #18: Ready to submit

**Total Files:** ~50+ files created/modified

**Estimated Time:**
- MVP: 20-24 hours
- Full Canvas: 12-16 hours
- AI Agent: 16-20 hours
- Final: 4-6 hours
- **Total: 52-66 hours** (within one week with focus)

Good luck! Follow this task list step by step, and you'll build a complete CollabCanvas that meets all requirements. 🚀
