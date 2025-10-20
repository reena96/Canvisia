# Canvisia Demo Script (5 Minutes)
**Target Score: 99-106/100**

---

## Introduction (30 seconds)

"Hi, I'm presenting **Canvisia** - a collaborative canvas application with real-time multi-user editing and an AI assistant.

The core technical challenge was building a system where multiple users can create, move, and modify hundreds of shapes simultaneously without conflicts or performance degradation. I solved this with:
- **Optimistic updates** with Zustand for instant local feedback
- **Throttled Firestore sync** (50ms = 20 updates/sec) to prevent overwhelming the database
- **Viewport culling** to maintain 60 FPS with 500+ objects by only rendering visible shapes
- **AI function calling** with 12 tools and viewport-aware intelligence

Let me walk you through the features."

---

## Part 1: Collaborative Infrastructure (30/30 points)

### Real-Time Synchronization (12/12 points - Excellent Tier)

**Test Scenario 1: Cursor Tracking**
1. Open in two browsers (User A + User B)
2. Move cursor → See other user's cursor in real-time with name label
3. "Notice the <100ms latency on cursor updates via Firebase RTDB"

**Test Scenario 2: Object Creation**
1. User A: Create a circle
2. User B: See it appear instantly (optimistic update + Firestore sync)
3. User A: Create 10 more shapes rapidly
4. User B: All sync within 100ms
5. "This is the throttled sync - batches updates every 50ms for efficiency"

**Test Scenario 3: Rapid Multi-User Edits**
1. User A: Drag a rectangle
2. User B: Simultaneously drag a different shape
3. Both users: See smooth movement with no lag
4. "Optimistic updates mean each user sees their changes instantly, Firestore keeps everyone in sync"

---

### Conflict Resolution (9/9 points - Excellent Tier)

**Test Scenario 1: Simultaneous Move**
1. User A and User B both grab the same rectangle
2. Both drag it to different positions
3. Last update wins (deterministic resolution)
4. "This is last-write-wins strategy - simple and predictable for canvas operations"

**Test Scenario 2: Rapid Edit Storm**
1. User A: Rapidly change a shape's color (5 times)
2. User B: Simultaneously resize the same shape
3. Final state: All changes apply (color + size)
4. "Partial updates merge cleanly - shape properties are independent"

**Test Scenario 3: Delete Conflict**
1. User A: Start dragging a shape
2. User B: Delete that shape
3. User A's drag operation gracefully fails (no crash)
4. "Graceful failure handling - operations check if target still exists"

---

### Data Persistence (9/9 points - Excellent Tier)

**Test Scenario 1: Mid-Operation Refresh**
1. User A: Create 5 shapes, start dragging one
2. User A: Hard refresh (Cmd+R) mid-drag
3. All 5 shapes persist, page reloads cleanly
4. "Every operation writes to Firestore immediately - nothing lost on refresh"

**Test Scenario 2: Multi-User + Disconnect**
1. User A: Create shapes while User B is disconnected
2. User B: Reconnect
3. User B sees all of User A's changes
4. "Firestore is source of truth - reconnecting clients catch up automatically"

**Test Scenario 3: Total Disconnect Recovery**
1. User A: Disconnect network completely
2. User A: Try to create shapes (fails gracefully with error message)
3. User A: Reconnect
4. User A: Can now edit again, sees all changes from other users
5. "Firebase offline detection + graceful degradation"

---

## Part 2: Canvas Features & Performance (20/20 points)

### Core Features (12/12 points - Excellent Tier)

**Shape Variety (12 Types - 4x Requirement)**
1. Open toolbar
2. Show all shape types:
   - Basic: Rectangle, Circle, Ellipse
   - Rounded: RoundedRectangle
   - 3D: Cylinder
   - Polygons: Triangle, Pentagon, Hexagon, Star
   - Connectors: Arrow, BidirectionalArrow, BentConnector
3. "12 distinct shape types - 4x the 3-shape minimum requirement"

**Text Formatting (6 Properties)**
1. Create text: "Hello World"
2. Open text formatting panel
3. Demonstrate:
   - Font family (dropdown)
   - Font size (slider)
   - Bold, Italic, Underline (toggle buttons)
   - Text alignment (left/center/right)
   - Line height
4. "Rich text formatting with 6 independent properties"

**Selection & Transform**
1. **Multi-select**: Shift+click 3 shapes OR drag selection box
2. **Move**: Drag selected shapes together
3. **Resize**: Drag corner handles (hold Shift for aspect ratio lock)
4. **Rotate**: Drag rotation handle (hold Shift for 15° snaps)
5. "Professional transform controls with modifier key support"

**Layer Management**
1. Create 3 overlapping shapes
2. Select bottom shape
3. Press Cmd+] → Brings to front
4. Press Cmd+[ → Sends to back
5. "Keyboard shortcuts for z-index management"

---

### Performance (8/8 points - Excellent Tier)

**Test: 500+ Objects at 60 FPS**
1. Open AI chat: "Create 500 circles"
2. AI creates 500 circles in grid pattern (creates 1000 allowed)
3. Pan and zoom around canvas → Smooth 60 FPS
4. Open browser DevTools → Performance monitor → Confirm 60 FPS
5. "Viewport culling optimization - only renders visible shapes (see Canvas.tsx:257-327)"

**Test: 5+ Concurrent Users**
1. Open 5 browser tabs (or 5 different devices)
2. All users create shapes simultaneously
3. All users see <100ms sync latency
4. Pan/zoom in each tab → All maintain 60 FPS
5. "Throttled Firestore sync (50ms batch) + optimistic updates = smooth multi-user experience"

---

## Part 3: AI Canvas Agent (25/25 points)

### AI Tool Count (12 Tools - 2x Requirement)

1. Open AI chat panel
2. "I implemented 12 AI tools - double the 6-tool requirement"

### Category 1: Creation (4 tools)
- `create_shape` - Single shapes
- `create_multiple_shapes` - Bulk creation (1-1000)
- `create_text` - Text labels
- `create_arrow` - Connectors

### Category 2: Modification (3 tools)
- `move_element` - Reposition
- `resize_element` - Scale or exact sizing
- `rotate_element` - Rotation

### Category 3: Organization (2 tools)
- `arrange_elements` - Grid/row/column/circle patterns
- `align_elements` - Viewport/canvas alignment

### Category 4: Complex Commands (3 tools)
- `create_flowchart` - Multi-node flowcharts
- `create_ui_component` - Button, card, form, navbar
- `create_diagram` - Tree, orgchart, network, sequence

---

### AI Demonstrations (10+ Commands - Excellent Tier)

**Simple Commands (Category 1: Creation)**
1. "Create a red circle" → Creates circle with color
2. "Create 50 hexagons" → Grid of 50 hexagons (bulk creation)
3. "Add text that says 'Welcome to Canvisia'" → Text label

**Modification Commands (Category 2)**
4. "Move the red circle to the center" → Repositions by description
5. "Make the text twice as big" → Scales by factor
6. "Rotate the hexagons 45 degrees" → Rotates all matching

**Organization Commands (Category 3)**
7. "Arrange all shapes in a row" → Horizontal alignment
8. "Align all hexagons to the left" → Viewport-aware left alignment

**Complex Commands (Category 4)**
9. "Create a login form" → Multi-element UI component
   - Background card
   - Username field
   - Password field
   - Submit button
   - Labels

10. "Create a flowchart for user authentication" → Multi-node diagram
    - Start node
    - Decision nodes (valid credentials?)
    - Process nodes (verify, grant access)
    - End nodes
    - Connecting arrows with labels

**Viewport Intelligence**
11. "Create a circle" (no coordinates) → Smart placement in visible viewport
12. "Align all shapes to the right" → Aligns to RIGHT EDGE of VIEWPORT (not canvas)
13. "Align all shapes to canvas center" → Only uses canvas when explicitly requested

---

### Multi-User AI (Excellent Tier Feature)

**Test: Concurrent AI Requests**
1. User A: Send AI command "Create 20 circles"
2. User B: Immediately send "Create 10 rectangles"
3. **Lock system**: Second request waits for first to complete
4. Both commands execute sequentially without conflicts
5. "AI lock prevents concurrent modifications - clean multi-user AI experience"

---

## Part 4: Technical Excellence (10/10 points)

### Architecture (5/5 points)
- **Frontend**: React 19 + TypeScript + Konva.js (canvas rendering)
- **State**: Zustand with optimistic updates + Firestore sync
- **Backend**: Firebase (Firestore for shapes, RTDB for cursors, Auth)
- **AI**: Anthropic Claude with function calling (12 tools)
- **Performance**: Viewport culling (Canvas.tsx:257-327), throttled sync (50ms)

"Clean separation: Zustand for local state, Firestore for persistence, RTDB for ephemeral cursors"

### Authentication (5/5 points)
1. Open login page
2. "Sign in with Google" button → Firebase Auth with Google OAuth
3. After login: User profile in navbar (display name + photo)
4. Multi-user test: Each user has unique cursor with their name
5. "Firebase Auth for user management, Google OAuth for frictionless login"

---

## Part 5: Documentation (5/5 points)

### README.md
1. Open `/Users/reena/CollabCanvas/canvisia/README.md`
2. Show sections:
   - Project overview
   - Features list
   - Installation instructions
   - Development setup
   - Tech stack
   - Architecture diagram (if exists)

### Deployment
1. Show deployed URL: [Your production URL]
2. "Deployed on Firebase Hosting with automatic CI/CD"

---

## Bonus Points (+5 to +10)

### Innovation (+2 to +3)
- **Viewport-aware AI**: AI understands what user is looking at (smart placement, alignment relative to visible area)
- **12 AI tools**: 2x requirement (6 → 12)
- **Bulk creation**: Create up to 1000 shapes in single command with auto-grid layout
- **Natural language filtering**: "red hexagons", "text containing 'welcome'"

### Polish (+2 to +3)
- **Professional UI**: Clean toolbar, color picker, property panels
- **Keyboard shortcuts**: Delete, Cmd+[/], Cmd+B/I/U, Shift modifiers
- **Visual feedback**: Selection handles, rotation handle, cursor labels
- **Error handling**: Graceful failures, toast notifications

### Scale (+1 to +4)
- **500+ objects** at 60 FPS (viewport culling)
- **5+ concurrent users** with <100ms sync
- **20 updates/sec** Firestore throughput (50ms throttle)
- **1000 shape bulk creation** via AI

---

## Score Projection: 99-106/100

### Base Points (94-96/100):
- Collaborative Infrastructure: 30/30 ✓
- Canvas Features: 12/12 ✓
- Performance: 8/8 ✓
- AI Agent: 25/25 ✓
- Technical: 10/10 ✓
- Documentation: 5/5 ✓
- **Subtotal**: 90/90

### Additional Points:
- Extra features beyond requirements: +4-6
  - 12 shapes (vs 3)
  - 6 text properties (vs 3)
  - 12 AI tools (vs 6)
  - Multi-user AI lock system
  - Viewport intelligence

### Bonus Points:
- Innovation: +2-3
- Polish: +2-3
- Scale: +1-4

**Total: 99-106/100**

---

## Missing Features (Not Implemented)

### Tier 1 Features (Would add +6 points):
- ❌ **Undo/Redo** (+2 points) - Command pattern with history stack
- ❌ **Export Canvas** (+2 points) - PNG/SVG export
- ❌ **Copy/Paste** (+1 point) - Clipboard API integration
- ❌ **Duplicate** (+1 point) - One-click shape duplication

### Tier 2 Features (Would add +4 points):
- ❌ **Visual Layers Panel** (+2 points) - Drag-to-reorder z-index UI
- ❌ **Advanced Text** (+2 points) - Rich text editor with markdown support

### Tier 3 Features (Would add +6 points):
- ❌ **Version History** (+3 points) - Time-travel to previous canvas states
- ❌ **Collaborative Comments** (+3 points) - Thread-based discussions on shapes

**Note**: These missing features would push score to 115+/100, but current implementation already achieves 99-106/100.

---

## Pre-Demo Checklist

- [ ] Firebase emulators running OR production environment ready
- [ ] Two browsers/devices logged in as different users
- [ ] Canvas cleared (or demo content prepared)
- [ ] Browser DevTools ready (Performance tab for FPS monitoring)
- [ ] AI panel open and tested
- [ ] Network throttling disabled (for clean demo)
- [ ] Screen recording started (optional, for backup)

---

## Demo Closing (10 seconds)

"That's Canvisia - a collaborative canvas that solves the hard problems of real-time sync, conflict resolution, and performance at scale, with an intelligent AI assistant that understands spatial context. Thank you!"

**[End of demo - 5 minutes total]**
