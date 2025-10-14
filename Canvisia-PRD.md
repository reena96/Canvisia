# Canvisia - Product Requirements Document

## Project Overview

Canvisia is a real-time collaborative design tool inspired by Figma, enabling multiple users to work simultaneously on a shared canvas with AI-assisted design capabilities. This is a one-week sprint project for Gauntlet AI with a critical 24-hour MVP checkpoint.

**Timeline:**
- MVP: Tuesday (24 hours) - HARD GATE
- Early Submission: Friday (4 days)
- Final: Sunday (7 days)

---

## User Stories

### Primary User: Designer/Creator
- As a designer, I want to create shapes (rectangles, circles, text) on a canvas so that I can build visual layouts
- As a designer, I want to pan and zoom the canvas so that I can navigate a large workspace
- As a designer, I want to move, resize, and rotate objects so that I can arrange my design
- As a designer, I want to see other users' cursors in real-time so that I know where they're working
- As a designer, I want to see who else is online so that I know who I'm collaborating with
- As a designer, I want my work to persist when I disconnect so that I don't lose my progress
- As a designer, I want to use natural language to create designs so that I can work faster with AI assistance

### Secondary User: Collaborator
- As a collaborator, I want to join an existing canvas so that I can work with my team
- As a collaborator, I want to see changes from other users instantly so that we can work simultaneously without conflicts
- As a collaborator, I want to use the AI agent and see its results shared with everyone so that we can co-create with AI

### System User: AI Agent
- As an AI agent, I want to receive natural language commands so that I can interpret user intent
- As an AI agent, I want to manipulate canvas objects through function calls so that I can execute design tasks
- As an AI agent, I want my changes to sync to all users so that everyone sees AI-generated content

---

## Canvas Flow & Access

### Canvas Creation
**MVP Implementation:**
- After login, user is redirected to `/canvas/new`
- `/canvas/new` route creates a new canvas document in Firestore with auto-generated ID
- User is automatically navigated to `/canvas/{canvasId}`
- Canvas metadata includes: name (default: "Untitled Canvas"), createdAt, ownerId, lastModified
- **No dashboard in MVP** - saves 2-3 hours of development time

**Canvas Creation Code Flow:**
```typescript
// When user visits /canvas/new
const canvasRef = await firestore.collection('canvases').add({
  name: 'Untitled Canvas',
  createdAt: serverTimestamp(),
  ownerId: currentUser.uid,
  lastModified: serverTimestamp()
})

// Redirect to /canvas/{canvasRef.id}
navigate(`/canvas/${canvasRef.id}`)
```

**Post-MVP:**
- Dashboard at `/dashboard` with "Recent Canvases" list
- Canvas templates
- Canvas search/filter
- Rename canvas functionality

### Canvas Joining & Collaboration
**MVP Implementation:**
- Users join existing canvases via **URL sharing only**
  - Example: `canvisia.com/canvas/abc123def456`
  - Each canvas has a unique ID generated on creation
  - Anyone with the URL can access the canvas (must be authenticated)
- No invite system or canvas selection UI in MVP

**Access Control:**
- MVP: **Public to authenticated users** - must sign in with Google, then can access any canvas via URL
- Firestore security rules enforce authentication (see Security section below)
- Post-MVP: Private canvases, role-based access (owner, editor, viewer)

**User Flow:**
1. User visits `/` → Redirected to `/login` (if not authenticated) or `/canvas/new` (if authenticated)
2. User signs in with Google
3. User redirected to `/canvas/new` → Creates canvas → Auto-redirected to `/canvas/{id}`
4. User shares `/canvas/{id}` URL with collaborators
5. Collaborators visit URL → Must sign in → Join same canvas session
6. All users see real-time updates from each other

**Routes:**
- `/` - Redirects to `/canvas/new` (authenticated) or `/login` (unauthenticated)
- `/login` - Google Sign-In page
- `/canvas/new` - Creates new canvas, redirects to `/canvas/{id}`
- `/canvas/{id}` - Canvas editor

---

## MVP Requirements (24-Hour Checkpoint)

### Critical Features - MUST HAVE
These are non-negotiable for passing the MVP gate:

- [ ] **Basic canvas with pan/zoom**
  - Large workspace (doesn't need to be infinite, but spacious)
  - Smooth pan (click and drag)
  - Zoom in/out (mouse wheel)

- [ ] **At least one shape type**
  - Rectangle, circle, OR text (minimum one, more is better)
  - Basic properties: position, size, color

- [ ] **Create and move objects**
  - Click to create new objects
  - Drag to move objects
  - Visual feedback during interaction

- [ ] **Real-time sync between 2+ users**
  - Object creation syncs instantly
  - Object movements sync instantly
  - Changes visible to all connected users

- [ ] **Multiplayer cursors with name labels**
  - See other users' cursor positions in real-time
  - Each cursor labeled with username
  - Smooth cursor movement (not jumpy)

- [ ] **Presence awareness**
  - See who's currently online
  - Clear indicator of active users

- [ ] **User authentication**
  - **Google Sign-In only** (OAuth)
  - Users authenticated via Google accounts (provides name, email, profile photo)
  - Session persistence via Firebase Auth
  - No email/password signup in MVP (simplifies security, avoids password storage)

- [ ] **Deployed and publicly accessible**
  - Working URL
  - Can be accessed from any browser
  - No local-only dependencies

### Success Criteria
- Two users in different browsers can edit simultaneously
- Canvas state persists through page refresh
- 60 FPS maintained during pan/zoom/move operations

---

## Key Features for Full Project

### Phase 1: Core Collaborative Canvas (Days 1-3)

#### Canvas Features
- **Workspace:**
  - Pan (click and drag background)
  - Zoom (mouse wheel, pinch gestures)
  - Large canvas area (5000x5000 minimum)

- **Shape Types:**
  - Rectangles (with fill color, stroke)
  - Circles (with fill color, stroke)
  - Lines (with stroke color, width)
  - Text layers (with font size, color, basic formatting)

- **Shape Default Values:**

| Shape | Default Size | Default Color | Placement |
|-------|-------------|---------------|-----------|
| Rectangle | 100×100 px | Blue (#4285F4) | Center of viewport or click point |
| Circle | Radius 50 px (100px diameter) | Red (#DB4437) | Center of viewport or click point |
| Line | 150px horizontal | Black (#000000) | Center of viewport or click point |
| Text | "Hello World", 16px | Black (#000000) | Center of viewport or click point |

- **Object Manipulation:**
  - Move (click and drag)
  - Resize (drag handles)
  - Rotate (rotation handle)
  - Selection (single click)
  - Multi-select (shift-click or drag-to-select box)

- **Operations:**
  - Delete (backspace/delete key)
  - Duplicate (cmd+d / ctrl+d)
  - Layer ordering (bring to front, send to back)
  - Undo/redo (nice to have, not MVP)

#### Real-Time Collaboration
- **Multiplayer Cursors:**
  - Position syncs <50ms
  - Smooth interpolation between updates
  - Name labels follow cursor
  - Color-coded per user

- **Object Sync:**
  - Create/delete operations sync <100ms
  - Transform operations (move/resize/rotate) sync <100ms
  - Optimistic updates (local changes appear instant)

- **Presence System:**
  - User join/leave notifications
  - Active users list with indicators
  - Last seen timestamps

- **Conflict Resolution:**
  - Last write wins strategy (acceptable for MVP)
  - Clear documentation of approach
  - Graceful handling of simultaneous edits

- **Connection Management:**
  - Handle disconnects gracefully
  - Reconnect without data loss
  - State persistence across sessions

#### Performance Targets
- 60 FPS during all interactions
- Support 500+ **total objects** on canvas without degradation
  - *Note: Uses viewport culling - only renders visible objects (~100-200 at once)*
  - *Performance testing focuses on interaction smoothness, not raw object count*
- Support 5+ concurrent users
- Cursor sync <50ms latency
- Object sync <100ms latency

### Phase 2: AI Canvas Agent (Days 4-7)

#### AI Capabilities
The AI agent must support **at least 6 distinct command types** demonstrating:
- Creation
- Manipulation
- Layout operations

#### Command Categories

**Creation Commands (must support 2+):**
- "Create a red circle at position 100, 200"
- "Add a text layer that says 'Hello World'"
- "Make a 200x300 rectangle"

**Manipulation Commands (must support 2+):**
- "Move the blue rectangle to the center"
- "Resize the circle to be twice as big"
- "Rotate the text 45 degrees"

**Layout Commands (must support 2+):**
- "Arrange these shapes in a horizontal row"
- "Create a grid of 3x3 squares"
- "Space these elements evenly"

**Complex Commands (stretch goal):**
- "Create a login form with username and password fields"
- "Build a navigation bar with 4 menu items"
- "Make a card layout with title, image, and description"

#### Technical Implementation
- **Function Calling Schema:**
  ```typescript
  createShape(type, x, y, width, height, color)
  moveShape(shapeId, x, y)
  resizeShape(shapeId, width, height)
  rotateShape(shapeId, degrees)
  createText(text, x, y, fontSize, color)
  getCanvasState() // returns current objects for context
  ```

- **Function Parameter Defaults:**
  - Parameters are optional; fallback to shape defaults (see Shape Default Values table)
  - Examples:
    ```typescript
    createShape("rectangle", 100, 200)
    // → width=100, height=100, color=blue (#4285F4)

    createShape("circle")
    // → x=viewport center, y=viewport center, radius=50, color=red (#DB4437)

    createText("Hello")
    // → x=viewport center, y=viewport center, fontSize=16, color=black
    ```
  - Missing x/y coordinates default to viewport center

- **AI Integration:**
  - Anthropic Claude with function calling
  - Natural language interpretation
  - Multi-step operation planning
  - Context awareness of canvas state

- **Shared AI State:**
  - All users see AI-generated results
  - Multiple users can use AI simultaneously
  - AI actions sync through same real-time system

- **Multi-User AI Conflict Resolution:**
  - **MVP Strategy: Last-Write-Wins**
  - If two users send AI commands simultaneously:
    - Both commands execute independently
    - Last command to complete writes final state
    - Conflicts logged in dev console for debugging
  - **Post-MVP:** Command queue or lock system to serialize AI operations

- **AI Context Optimization:**
  - **MVP Strategy: Filtered Subset**
  - Don't send full canvas state (500 objects = expensive)
  - Filter to relevant objects only:
    - Example: "move red circles" → send only circles with fill: red
    - Example: "create grid" → send canvas bounds + existing objects in target area
  - Include canvas metadata (size, zoom level) for spatial commands
  - **Post-MVP:** Implement context summarization or compression

#### AI Performance Targets
- Response latency <2 seconds for single-step commands
- Handles 6+ command types reliably
- Executes multi-step operations correctly
- Consistent and accurate execution
- Natural interaction with immediate feedback

---

## Tech Stack

### Frontend
**Framework:** React
**Why:**
- Large ecosystem and component libraries
- Excellent developer experience
- Strong community support for real-time features
- Great tooling (Create React App, Vite)

**Rendering:** Konva.js + react-konva
**Why:**
- **Better React integration:** react-konva provides declarative React components (`<Stage>`, `<Layer>`, `<Rect>`) - no manual state synchronization needed
- **Built-in features:** Drag-and-drop (`draggable={true}`), resize handles (`<Transformer>`), hit detection, and event handling all included
- **Sufficient performance:** Handles 300-500 visible objects at 60 FPS; with viewport culling, easily supports 500+ total objects
- **Faster MVP development:** Estimated 10-15 hours saved vs PixiJS due to React integration complexity
- **Better for collaborative tools:** Used by Excalidraw, Miro-like apps; PixiJS is optimized for games
- **AI code generation advantage:** react-konva's declarative patterns are more common in training data, leading to more accurate AI-generated code

**Why not PixiJS:**
- PixiJS (WebGL) offers superior raw performance (1000+ objects) but requires complex manual integration with React
- Would need custom state synchronization between React state and PixiJS scene graph
- Manual implementation of drag-and-drop, hit detection, and resize handles
- Adds 4-6 hours of complexity per PR for a 7-day timeline
- Performance advantage not needed: With viewport culling, only 100-200 objects visible at once

**State Management:** Zustand
**Why:**
- **Better performance with 500+ objects:** Selective subscriptions prevent unnecessary re-renders
- **Simpler API:** No Provider wrappers, less boilerplate than Context + useReducer
- **Proven for canvas apps:** Used by Excalidraw and similar collaborative tools
- **Granular updates:** Components subscribe only to the state they need
- **Easy optimization:** Built-in shallow comparison, middleware support
- **Small bundle:** ~1KB, minimal overhead

**State Structure:**
```typescript
// Canvas Store
const useCanvasStore = create((set) => ({
  shapes: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map(s => s.id === id ? { ...s, ...updates } : s)
  }))
}))

// Auth Store (or keep Firebase Auth context - lighter)
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))

// Presence Store
const usePresenceStore = create((set) => ({
  onlineUsers: [],
  cursors: {},
  updateCursor: (userId, position) => set((state) => ({
    cursors: { ...state.cursors, [userId]: position }
  }))
}))
```

**Why not React Context:**
- Context causes all consumers to re-render on any state change
- With 500+ shapes, this breaks the 60 FPS requirement
- Requires extensive use of React.memo, useMemo, useCallback for optimization
- Zustand provides better DX with less manual optimization

**Styling:**
- Tailwind CSS (utility-first, fast development)
- Or CSS Modules (scoped styling)

### Backend
**Database & Real-Time:** Firebase Firestore
**Why:**
- Built-in real-time listeners
- Easy to set up and deploy
- Automatic scaling
- Integrated authentication
- Good free tier for MVP

**Authentication:** Firebase Auth with Google Sign-In
**Why:**
- Integrates seamlessly with Firestore
- **Google OAuth only** for MVP (simplifies setup, no password storage)
- Session management handled automatically
- Quick setup (single provider configuration)
- Users authenticated with name and profile photo
- Post-MVP: Can add email/password, GitHub if needed

**Security Rules (Implemented in PR #2, not PR #18!):**
```javascript
// firestore.rules - Enforce authentication from day 1
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Canvases: Any authenticated user can read/write
    match /canvases/{canvasId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// rtdb.rules - RTDB for cursors
{
  "rules": {
    "cursors": {
      "$canvasId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    }
  }
}
```

**Why enforce auth from day 1:**
- Prevents bot spam and abuse
- Can track usage per user
- Production-ready security for MVP deployment
- Still "public via URL" - any authenticated user can access any canvas

**AI:** Anthropic Claude API (via Vercel Functions)
**Why:**
- Excellent function calling support
- Strong instruction following
- Good at multi-step reasoning
- Context management

**AI Security Architecture:**
```
Client → Vercel Function (with Firebase JWT)
       → Verify Auth Token
       → Claude API (API key hidden server-side)
       → Execute commands via Firestore Admin SDK
       → Return result to client
```

**Vercel Function Pattern:**
```typescript
// /api/ai/execute-command.ts
export default async function handler(req, res) {
  // 1. Extract Firebase Auth token from header
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    // 2. Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token)
    const userId = decodedToken.uid

    // 3. Call Claude API (server-side, API key protected)
    const aiResponse = await callClaude(req.body.command, req.body.canvasState)

    // 4. Execute AI commands as admin (bypasses Firestore security rules)
    await executeAICommands(aiResponse, req.body.canvasId, userId)

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

**Why server-side AI:**
- ✅ Claude API key never exposed to client
- ✅ Prevents abuse and cost overruns
- ✅ Rate limiting per user possible
- ✅ Can validate commands before executing

### Deployment
**Frontend:** Vercel
**Why:**
- Zero-config deployment for React
- Automatic HTTPS
- Edge network for low latency
- Excellent DX
- Environment variables configured in Vercel dashboard (no `.env.production` file in repo)

**Backend:** Firebase (fully managed)

**Environment Variables:**
- **Development:** `.env.local` (gitignored)
- **Production:** Vercel Dashboard → Settings → Environment Variables
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  ANTHROPIC_API_KEY=... (server-side only, NOT prefixed with VITE_)
  ```
- **Why no .env.production:** Security risk if accidentally committed to repo

### Development Tools
- TypeScript (type safety, better DX)
- Zustand (state management)
- Vitest + Testing Library (testing)
- Firebase Emulator (local development & testing)
- ESLint + Prettier (code quality)
- Git + GitHub (version control)

---

## Tech Stack: Pros, Cons & Pitfalls

### Firebase Firestore

**Pros:**
- Real-time updates out of the box
- No server management required
- Scales automatically
- Simple query API
- Free tier is generous (50k reads/day, 20k writes/day)
- Built-in security rules

**Cons:**
- Can get expensive at scale (pricing per operation)
- Query limitations (no OR queries without multiple calls)
- Offline handling requires extra setup
- Vendor lock-in

**Security Rules (IMPLEMENT IN PR #2, NOT PR #18!):**
- ⚠️ PITFALL: Deploying MVP with "test mode" security rules = anyone can read/write your database
- ✅ SOLUTION: Implement authenticated-only rules from day 1 (see Backend section above)
- Test security rules with Firebase Emulator before deploying

**Critical Pitfalls (You're New to Real-Time):**

1. **Document Size Limits (1MB max)**
   - ⚠️ PITFALL: Storing all canvas objects in one document will hit limits fast
   - ✅ SOLUTION: Use subcollections or separate documents per object
   - Recommended structure:
     ```
     canvases/{canvasId}/objects/{objectId}
     canvases/{canvasId}/users/{userId}
     canvases/{canvasId}/metadata
     ```

2. **Read/Write Costs on Cursor Movement**
   - ⚠️ PITFALL: Syncing cursor position every frame = thousands of writes/sec
   - ✅ SOLUTION: Use Firebase Realtime Database (RTDB) for cursors, Firestore for objects
   - **Throttle rate: 20 updates/sec (50ms intervals)** for smooth UX
   - Auto-degrade to 10 updates/sec if 5+ concurrent users detected

3. **Listener Overhead**
   - ⚠️ PITFALL: Listening to entire collection causes re-renders on every change
   - ✅ SOLUTION: Use precise queries, implement local optimistic updates
   - Detach listeners when component unmounts

4. **Simultaneous Edits**
   - ⚠️ PITFALL: Two users editing same object = last write wins (data loss)
   - ✅ SOLUTION: For MVP, "last write wins" is acceptable (document this!)
   - Future: Implement operational transforms or CRDTs

5. **Cold Start Latency**
   - ⚠️ PITFALL: Initial connection can take 1-2 seconds
   - ✅ SOLUTION: Show loading state, implement optimistic updates

### React + Konva.js

**Pros:**
- react-konva provides React components for canvas elements
- Declarative API matches React patterns naturally
- No manual state synchronization needed
- Built-in drag-and-drop, resize handles, hit detection
- Strong TypeScript support
- Active maintenance (10k+ GitHub stars)

**Cons:**
- Canvas 2D rendering (not WebGL) - slightly lower max object count than PixiJS
- Performance depends on proper optimization (viewport culling essential)

**Critical Pitfalls:**

1. **Performance Without Culling**
   - ⚠️ PITFALL: Rendering 500+ objects without viewport culling = poor FPS
   - ✅ SOLUTION: Implement viewport culling early (only render visible shapes)
   - Pattern: Filter shapes based on viewport bounds before rendering

2. **Layer Management**
   - ⚠️ PITFALL: Too many layers or unnecessary re-renders = performance drop
   - ✅ SOLUTION: Use single Layer for all shapes, optimize with React.memo
   - Only re-render changed shapes, not entire canvas

3. **Event Handler Memory**
   - ⚠️ PITFALL: Creating new functions in render = unnecessary re-renders
   - ✅ SOLUTION: Use useCallback for event handlers, memoize shape components

4. **Large Canvas Performance**
   - ⚠️ PITFALL: 5000x5000 canvas with all shapes rendered = slow zoom/pan
   - ✅ SOLUTION: Implement viewport culling in PR #5 (not PR #12)
   - Use `scaleX` and `scaleY` for zoom, optimize Stage props

### Zustand

**Pros:**
- Minimal boilerplate (no providers, reducers)
- Excellent performance (selective re-renders)
- Small bundle size (~1KB)
- Works outside React (useful for Firestore listeners)
- DevTools support
- TypeScript support out of the box

**Cons:**
- Less widespread than Context (but growing)
- One more dependency to learn

**Critical Pitfalls:**

1. **Mutating State Directly**
   - ⚠️ PITFALL: `set((state) => { state.shapes.push(shape); return state })` (mutates!)
   - ✅ SOLUTION: Always return new objects/arrays
   ```typescript
   set((state) => ({ shapes: [...state.shapes, shape] })) // ✅ Correct
   ```

2. **Subscribing to Entire Store**
   - ⚠️ PITFALL: `const store = useCanvasStore()` (re-renders on ANY change)
   - ✅ SOLUTION: Use selectors
   ```typescript
   const shapes = useCanvasStore(state => state.shapes) // ✅ Only shapes
   const addShape = useCanvasStore(state => state.addShape) // ✅ Stable reference
   ```

3. **Firestore → Zustand Sync Pattern**
   - ⚠️ PITFALL: Syncing in components causes race conditions
   - ✅ SOLUTION: Sync in store initialization
   ```typescript
   // Initialize store with Firestore listener
   const useCanvasStore = create((set) => {
     // Subscribe to Firestore once at store level
     onSnapshot(collection, (snapshot) => {
       set({ shapes: snapshot.docs.map(doc => doc.data()) })
     })
     return { shapes: [], addShape: ... }
   })
   ```

4. **Actions vs Selectors**
   - Pattern: Actions (setters) should be stable, data should be reactive
   ```typescript
   // ✅ Good: Actions outside state, data inside
   const useCanvasStore = create((set) => ({
     shapes: [],
     addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] }))
   }))
   ```

### Anthropic Claude API

**Pros:**
- Excellent function calling
- Strong reasoning for complex commands
- Good at following instructions
- 200k context window (can send full canvas state)

**Cons:**
- API costs (but reasonable for MVP)
- Rate limits on free tier
- Latency (network round trip)

**Pitfalls:**

1. **Rate Limits**
   - ⚠️ PITFALL: Multiple users hitting AI = rate limit errors
   - ✅ SOLUTION: Implement queue system, show "AI is thinking" state
   - Cache common commands

2. **Cost Management**
   - ⚠️ PITFALL: Sending full canvas state every request = $$
   - ✅ SOLUTION: Send only relevant objects, use efficient prompts
   - Consider caching canvas context

3. **Error Handling**
   - ⚠️ PITFALL: API failures = broken UX
   - ✅ SOLUTION: Graceful fallbacks, retry logic, clear error messages

---

## Recommended Architecture

### Data Model (Firestore)

```
canvases/
  {canvasId}/
    metadata:
      - name
      - createdAt
      - ownerId

    objects/
      {objectId}:
        - type (rectangle, circle, text)
        - x, y, width, height
        - color, strokeColor, strokeWidth
        - rotation
        - zIndex
        - createdBy
        - updatedAt

    users/
      {userId}:
        - name
        - color (for cursor)
        - lastSeen
        - isActive
```

### Alternative: Hybrid Approach (Recommended)
- **Firestore:** Canvas objects, user accounts, canvas metadata
- **Firebase Realtime Database (RTDB):** Cursor positions (cheaper for high-frequency updates)

---

## Out of Scope for MVP

### Features NOT Required for MVP (24 hours)
- Undo/redo functionality
- Copy/paste
- Grouping objects
- Advanced styling (gradients, shadows, borders)
- Image uploads
- Export to PNG/SVG
- Keyboard shortcuts beyond basics
- Touch/mobile optimization
- Multiple canvas pages
- Comments or annotations
- Version history
- Permissions/sharing settings

### Features NOT Required for Full Project (Week 1)
- Advanced conflict resolution (CRDTs, OT)
- Video/voice chat
- Advanced AI commands beyond the 6 required
- Custom fonts
- Animation or transitions
- Snap to grid/guides
- Component libraries
- Templates
- Team workspaces
- Payment/billing

---

## Success Metrics

### MVP (24 Hours)
- [ ] Can create account and log in (Google Sign-In)
- [ ] Can create new canvas and join via URL
- [ ] Can pan and zoom canvas smoothly
- [ ] Can create at least one type of shape
- [ ] Can move objects around
- [ ] Two users see each other's cursors
- [ ] Two users see each other's changes instantly
- [ ] Canvas state persists through refresh
- [ ] Canvas interactions maintain ≥60 FPS
- [ ] Deployed at public URL

### Full Project (7 Days)
- [ ] All MVP requirements +
- [ ] Multiple shape types (rect, circle, line, text)
- [ ] Resize and rotate objects
- [ ] Multi-select functionality
- [ ] 60 FPS performance with 500+ objects
- [ ] 5+ users can collaborate simultaneously
- [ ] AI agent handles 6+ command types
- [ ] Complex AI commands work (e.g., "create login form")
- [ ] Demo video completed
- [ ] AI development log submitted

---

## Recommended Build Order

Based on project guidance and pitfalls for real-time newcomers:

### Day 1 (MVP Focus)
**Priority: Get multiplayer sync working**

1. **Setup (2 hours)**
   - Initialize React + TypeScript project
   - Set up Firebase (Firestore + Auth)
   - **Implement Firestore security rules** (authenticated users only)
   - Deploy placeholder to Vercel
   - Set up Google Sign-In authentication
   - Create `/canvas/new` route for canvas creation

2. **Cursor Sync (3-4 hours)** ⚠️ START WITH HARDEST PART
   - Implement cursor position tracking
   - Send cursor position to Firestore/RTDB
   - Listen to other users' cursors
   - Render cursors with name labels
   - Test with 2 browser windows

3. **Basic Canvas + One Shape (1-2 hours)** ✅ Simpler with Konva.js
   - Set up react-konva Stage and Layer
   - Implement pan (draggable Stage) and zoom (wheel handler)
   - Create ONE shape type (rectangle is easiest)
   - Declarative rendering with `<Rect>` components

4. **Object Sync (4-5 hours)**
   - Create object → write to Firestore
   - Listen to Firestore → render new objects
   - Move object → update Firestore
   - Handle simultaneous edits (last write wins)
   - Test persistence (refresh browser)

5. **Polish & Deploy (2-3 hours)**
   - Presence awareness (who's online)
   - Basic error handling
   - Deploy and test publicly
   - Fix critical bugs

### Days 2-4 (Full Canvas Features)
6. **More Shapes & Transforms**
   - Add circles, lines, text
   - Implement resize handles
   - Implement rotation
   - Delete and duplicate

7. **Advanced Selection**
   - Multi-select (shift-click)
   - Drag-to-select box
   - Layer management

8. **Performance Optimization**
   - Optimize Firestore listeners
   - Throttle updates where appropriate
   - Test with 500+ objects
   - Ensure 60 FPS

### Days 5-7 (AI Agent)
9. **Basic AI Integration**
   - Set up Claude API
   - Implement function calling schema
   - Test simple commands (create shape)

10. **Advanced AI Commands**
    - Manipulation commands
    - Layout commands
    - Complex multi-step commands

11. **AI UX & Testing**
    - Natural language input UI
    - Loading states
    - Error handling
    - Multi-user AI testing

12. **Documentation & Submission**
    - Record demo video
    - Write AI development log
    - README with setup guide
    - Architecture documentation

---

## Risk Mitigation

### High-Risk Areas (You're New to Real-Time)

1. **Firestore Structure**
   - Risk: Wrong structure = performance death or cost explosion
   - Mitigation: Follow recommended structure above, test early with multiple users

2. **Cursor Update Frequency**
   - Risk: Too many writes = cost/performance issues
   - Mitigation: Use RTDB for cursors AND throttle to 20 updates/sec (degrades to 10/sec with 5+ users)

3. **Konva.js Performance Under Load**
   - Risk: 500+ objects without optimization = FPS drops
   - Mitigation: Implement viewport culling early (PR #5), use React.memo, optimize re-renders

4. **Conflict Resolution**
   - Risk: Lost updates, bad UX
   - Mitigation: Implement optimistic updates, use "last write wins" with clear feedback

5. **Time Management**
   - Risk: Spending too much on features, not enough on sync
   - Mitigation: Follow build order above, get multiplayer working FIRST

---

## Questions to Resolve Before Starting

- [ ] Firebase project set up?
- [ ] Claude API key obtained?
- [ ] GitHub repo created?
- [ ] Vercel account ready?
- [ ] Development environment ready (Node, npm/yarn)?

---

## Additional Resources

### Firebase Real-Time Best Practices
- Use subcollections for scalability
- Implement security rules early
- Consider using RTDB for high-frequency updates
- Monitor usage in Firebase console

### Konva.js + React Patterns
- Use react-konva for declarative canvas components
- Implement viewport culling for 500+ objects
- Memoize shape components with React.memo
- Use useCallback for event handlers to prevent re-renders
- Study Excalidraw source code for collaborative canvas patterns

### AI Function Calling
- Anthropic Claude function calling docs
- Test with simple commands first
- Build up to complex multi-step operations
- Handle partial failures gracefully

---

## Next Steps

1. Review this PRD together
2. Make any adjustments to tech stack or scope
3. Set up development environment
4. Create implementation plan with detailed tasks
5. Start building (multiplayer sync first!)

---

**Philosophy:** "A simple, solid, multiplayer canvas with a working AI agent beats any feature-rich app with broken collaboration."

**Focus:** Get the foundation right. Everything else builds on top of solid real-time sync.
