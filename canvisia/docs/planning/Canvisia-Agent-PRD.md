# Canvisia AI Canvas Agent - Product Requirements Document

**Version:** 1.0
**Last Updated:** October 17, 2025
**Status:** In Development
**Target Completion:** Day 1 (8 hours)

---

## Executive Summary

The **Canvisia AI Canvas Agent** adds natural language command capabilities to the existing collaborative canvas, enabling users to create, manipulate, and arrange canvas elements through conversational AI commands. This feature transforms Canvisia from a manual design tool into an intelligent assistant-powered workspace.

**Key Value Proposition:** Users can describe what they want instead of manually clicking through menus and tools.

---

## Goals & Success Criteria

### Primary Goals
1. **Enable AI-powered canvas manipulation** through natural language commands
2. **Achieve 25/25 points** on the CollabCanvas Rubric Section 4 (AI Canvas Agent)
3. **Maintain sub-2 second response times** for 90%+ of commands
4. **Support 8+ distinct command types** across all required categories

### Success Metrics
- ✅ Sub-2 second AI response time (P0)
- ✅ 90%+ command accuracy (P0)
- ✅ Multi-user AI state management working flawlessly (P0)
- ✅ 8+ command types implemented (P0)
- ✅ Complex commands execute multi-step plans correctly (P0)
- 🎯 User satisfaction: "AI makes tasks faster/easier" (P1)

### Non-Goals (Out of Scope for V1)
- ❌ Voice commands (text only)
- ❌ AI-generated images/assets
- ❌ Conversational memory beyond current session
- ❌ AI model training/fine-tuning
- ❌ Natural language search/queries

---

## User Stories

### Epic 1: Basic AI Commands
**As a canvas user, I want to create elements using natural language so that I can work faster than clicking tools.**

**User Stories:**
1. **Creation Commands**
   - "Create a red circle at position 100, 200" → Circle appears
   - "Add a text layer that says 'Hello World'" → Text appears
   - "Make a 200x300 rectangle" → Rectangle appears

2. **Manipulation Commands**
   - "Move the blue rectangle to the center" → Element moves
   - "Resize the circle to be twice as big" → Element resizes
   - "Rotate the text 45 degrees" → Element rotates

3. **Layout Commands**
   - "Arrange these shapes in a horizontal row" → Auto-arranges
   - "Space these elements evenly" → Calculates spacing
   - "Align these elements to the center" → Aligns perfectly

### Epic 2: Complex AI Commands
**As a designer, I want AI to create complete layouts so that I don't have to manually place every element.**

**User Stories:**
1. "Create a login form with username and password fields" → Generates 4+ properly arranged elements
2. "Build a navigation bar with 4 menu items" → Creates styled nav bar
3. "Make a card layout with title, image placeholder, and description" → Complete card component

### Epic 3: Multi-User AI Coordination
**As a team member, I want AI commands to work smoothly when multiple people are editing so that we don't conflict.**

**User Stories:**
1. User A uses AI while User B is editing → User B sees "AI is being used by User A"
2. User A's AI command completes → User B can now use AI
3. Both users see AI-created elements in real-time

---

## Technical Architecture

### System Overview (High-Level Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
│  • Persistent AI input box at bottom of canvas              │
│  • Cmd+K keyboard shortcut to focus                          │
│  • Loading states during AI processing                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  MULTI-USER LOCK LAYER                       │
│  Firestore: canvases/{canvasId}/ai_lock                     │
│  • Prevents simultaneous AI commands                         │
│  • 10-second timeout                                         │
│  • Queue or "busy" message for blocked users                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  AI ORCHESTRATION LAYER                      │
│  Claude 3.5 Sonnet via Anthropic SDK                        │
│  • Context builder (gathers canvas state)                   │
│  • Tool definitions (11+ function calls)                    │
│  • Response parser (extract & validate tool calls)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    COMMAND EXECUTOR                          │
│  Executes tool calls using existing canvas operations       │
│  • createShape() → Firestore integration                    │
│  • updateShape() → Real-time sync                           │
│  • Batch operations for multi-element commands              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      USER FEEDBACK                           │
│  • Success toast: "Created 4 shapes"                        │
│  • Error toast: "Could not interpret command"              │
│  • Release lock in Firestore                                │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UI COMPONENTS (src/components/ai/)                          │  │
│  │                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │  │
│  │  │ AICommandInput   │  │ AIStatusIndicator│                 │  │
│  │  │ - Text input     │  │ - Loading state  │                 │  │
│  │  │ - Send button    │  │ - Success/Error  │                 │  │
│  │  │ - Cmd+K shortcut │  │ - Toast messages │                 │  │
│  │  └────────┬─────────┘  └──────────────────┘                 │  │
│  │           │                                                   │  │
│  └───────────┼───────────────────────────────────────────────────┘  │
│              │                                                       │
│  ┌───────────▼───────────────────────────────────────────────────┐  │
│  │  HOOKS (src/hooks/)                                           │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ useAI(canvasId)                                        │  │  │
│  │  │                                                        │  │  │
│  │  │  State:                                                │  │  │
│  │  │  - isProcessing: boolean                               │  │  │
│  │  │  - isLocked: boolean                                   │  │  │
│  │  │  - lockOwner: string | null                            │  │  │
│  │  │  - lastCommand: string                                 │  │  │
│  │  │                                                        │  │  │
│  │  │  Methods:                                              │  │  │
│  │  │  - sendCommand(text: string): Promise<void>           │  │  │
│  │  │  - cancelCommand(): void                               │  │  │
│  │  └────────────────────────┬───────────────────────────────┘  │  │
│  │                           │                                   │  │
│  └───────────────────────────┼───────────────────────────────────┘  │
│                              │                                       │
│  ┌───────────────────────────▼───────────────────────────────────┐  │
│  │  AI SERVICES (src/services/ai/)                              │  │
│  │                                                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │   client.ts  │  │ orchestrator │  │  executor.ts │      │  │
│  │  │              │  │      .ts     │  │              │      │  │
│  │  │ • Initialize │  │ • Build      │  │ • Execute    │      │  │
│  │  │   Anthropic  │  │   context    │  │   tool calls │      │  │
│  │  │   SDK        │  │ • Send to    │  │ • Call       │      │  │
│  │  │ • API calls  │  │   Claude     │  │   create/    │      │  │
│  │  │ • Error      │  │ • Parse      │  │   update     │      │  │
│  │  │   handling   │  │   response   │  │   Shape      │      │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │  │
│  │         │                 │                 │              │  │
│  │  ┌──────▼─────────────────▼─────────────────▼───────────┐  │  │
│  │  │                   context.ts                          │  │  │
│  │  │  • buildContext(shapes): string                       │  │  │
│  │  │  • Returns JSON summary of canvas state               │  │  │
│  │  │  • Includes: shape count, types, positions, colors    │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐  │  │
│  │  │                   lock.ts                             │  │  │
│  │  │  • acquireAILock(canvasId, userId, command)          │  │  │
│  │  │  • releaseAILock(canvasId)                           │  │  │
│  │  │  • onAILockChange(canvasId, callback)                │  │  │
│  │  └───────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                │ API Calls
                                │
        ┌───────────────────────▼────────────────────────┐
        │      ANTHROPIC API (Claude 3.5 Sonnet)        │
        │                                                │
        │  Input: { messages, tools, system_prompt }    │
        │  Output: { content, tool_calls[] }            │
        │                                                │
        │  Tools (11 functions):                        │
        │  • create_shape                               │
        │  • create_text                                │
        │  • create_arrow                               │
        │  • move_element                               │
        │  • resize_element                             │
        │  • rotate_element                             │
        │  • arrange_elements                           │
        │  • align_elements                             │
        │  • create_flowchart                           │
        │  • create_ui_component                        │
        │  • create_diagram                             │
        └────────────────────────────────────────────────┘
                                │
                                │ Results
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                    FIREBASE BACKEND                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  FIRESTORE (canvases/{canvasId}/shapes)                        │  │
│  │                                                                 │  │
│  │  Document: {                                                    │  │
│  │    id: string                                                   │  │
│  │    type: 'rectangle' | 'circle' | 'text' | ...                 │  │
│  │    x, y, width, height, color, rotation                        │  │
│  │    metadata: {  // NEW for simulation                          │  │
│  │      nodeType?: 'start' | 'process' | 'decision' | 'end'       │  │
│  │      processTime?: number                                       │  │
│  │      capacity?: number                                          │  │
│  │    }                                                            │  │
│  │    connections?: {  // NEW for arrows                          │  │
│  │      fromShapeId?: string                                       │  │
│  │      toShapeId?: string                                         │  │
│  │    }                                                            │  │
│  │    createdBy: string                                            │  │
│  │    createdAt: timestamp                                         │  │
│  │  }                                                              │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  REALTIME DATABASE (canvases/{canvasId}/aiLock)                │  │
│  │                                                                 │  │
│  │  {                                                              │  │
│  │    userId: string                                               │  │
│  │    userName: string                                             │  │
│  │    timestamp: number                                            │  │
│  │    command: string                                              │  │
│  │  }                                                              │  │
│  │                                                                 │  │
│  │  • Written before AI call                                       │  │
│  │  • Deleted after AI call completes                             │  │
│  │  • Auto-expires after 10 seconds                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Sequence Diagram

```
User          AICommandInput    useAI Hook      aiLock       Claude API    executor      Firestore
 │                 │                │              │              │            │             │
 │ Type command    │                │              │              │            │             │
 │────────────────>│                │              │              │            │             │
 │                 │                │              │              │            │             │
 │                 │ sendCommand()  │              │              │            │             │
 │                 │───────────────>│              │              │            │             │
 │                 │                │              │              │            │             │
 │                 │                │ acquireLock()│              │            │             │
 │                 │                │─────────────>│              │            │             │
 │                 │                │              │              │            │             │
 │                 │                │  lock acquired│             │            │             │
 │                 │                │<─────────────│              │            │             │
 │                 │                │              │              │            │             │
 │                 │ Show loading   │              │              │            │             │
 │                 │<───────────────│              │              │            │             │
 │                 │                │              │              │            │             │
 │                 │                │ buildContext()              │            │             │
 │                 │                │──────────────────────────────┼───────────>│             │
 │                 │                │              │              │            │ Read shapes │
 │                 │                │              │              │            │───────────>│
 │                 │                │              │              │            │<───────────│
 │                 │                │              │              │            │             │
 │                 │                │ sendMessage()│              │            │             │
 │                 │                │─────────────────────────────>│            │             │
 │                 │                │              │              │            │             │
 │                 │                │              │  tool_calls  │            │             │
 │                 │                │<─────────────────────────────│            │             │
 │                 │                │              │              │            │             │
 │                 │                │ executeToolCalls()           │            │             │
 │                 │                │──────────────────────────────────────────>│             │
 │                 │                │              │              │            │             │
 │                 │                │              │              │            │ createShape()
 │                 │                │              │              │            │───────────>│
 │                 │                │              │              │            │<───────────│
 │                 │                │              │              │            │             │
 │                 │                │              │              │   results  │             │
 │                 │                │<──────────────────────────────────────────│             │
 │                 │                │              │              │            │             │
 │                 │                │ releaseLock()│              │            │             │
 │                 │                │─────────────>│              │            │             │
 │                 │                │              │              │            │             │
 │                 │ Success toast  │              │              │            │             │
 │<────────────────│<───────────────│              │              │            │             │
 │                 │                │              │              │            │             │
 │ See new shapes (real-time sync)                                                          │
 │<─────────────────────────────────────────────────────────────────────────────────────────│
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **AI Model** | Claude 3.5 Sonnet | Best-in-class reasoning, native function calling |
| **AI SDK** | Anthropic SDK | Direct API, fastest response times, simplest |
| **Validation** | TypeScript + Zod | Type-safe tool schemas |
| **Lock System** | Firestore | Real-time multi-user coordination |
| **Canvas Ops** | Existing hooks | Reuse useFirestore, createShape, updateShape |
| **UI Framework** | React + Konva | Already in stack |
| **Animation** | GSAP | For future simulation features |

### Key Design Decisions

#### Decision 1: Client-Side vs Server-Side AI
**Choice:** Client-side (browser) for Day 1
**Rationale:**
- ✅ Faster (no backend hop = sub-2s guaranteed)
- ✅ Simpler (no Firebase Functions setup)
- ✅ Good enough for dev/demo (can secure later)
- ⚠️ API key in .env.local (dev only, not production-safe)

**Future:** Move to Firebase Functions for production with API key security.

#### Decision 2: Claude SDK vs LangChain vs LangGraph
**Choice:** Start with Claude SDK only
**Rationale:**
- ✅ Fastest implementation (8 hours achievable)
- ✅ Lowest latency (~800ms)
- ✅ Simplest debugging
- ✅ Meets all rubric requirements
- Can add LangChain later for complex commands if needed

#### Decision 3: Multi-User Lock Strategy
**Choice:** Lock-based (one AI command at a time)
**Rationale:**
- ✅ Simple to implement
- ✅ No command conflicts
- ✅ 10-second timeout prevents deadlocks
- ❌ Slight UX friction (users must wait)
- Alternative (parallel execution) adds complexity without clear benefit

---

## Functional Requirements

### FR1: AI Command Input Interface

**Priority:** P0 (Must Have)

**Requirements:**
1. Persistent input box at bottom of canvas
2. Placeholder: "💬 Ask AI: Create shapes, arrange elements, simulate flows..."
3. Cmd+K (Mac) / Ctrl+K (Windows) keyboard shortcut to focus
4. Enter key submits command
5. Loading spinner during AI processing
6. Input disabled during processing

**Acceptance Criteria:**
- [ ] Input box visible on canvas load
- [ ] Cmd+K focuses input from anywhere
- [ ] Loading state shows during AI call
- [ ] Input clears after successful command

---

### FR2: Command Categories (11 Total)

#### Category: Creation (3 commands minimum)

**FR2.1: create_shape**
- **Input:** Shape type, position (x, y), optional size, optional color
- **Example:** "Create a red circle at 100, 200"
- **Output:** New shape created on canvas
- **Edge Cases:**
  - No position specified → Default to center (1000, 1000)
  - Invalid color → Use default (#000000)

**FR2.2: create_text**
- **Input:** Text content, position, optional fontSize, optional color
- **Example:** "Add a text layer that says 'Hello World'"
- **Output:** New text element created

**FR2.3: create_arrow**
- **Input:** Start position, end position, optional style
- **Example:** "Draw an arrow from 100,100 to 500,500"
- **Output:** New arrow/line connector created

#### Category: Manipulation (3 commands minimum)

**FR2.4: move_element**
- **Input:** Element identifier (ID or description), new position
- **Example:** "Move the blue rectangle to the center"
- **Logic:**
  1. Find element by description (color + type)
  2. If multiple matches, use most recently created
  3. Update position

**FR2.5: resize_element**
- **Input:** Element identifier, scale factor or explicit dimensions
- **Example:** "Resize the circle to be twice as big"
- **Output:** Element dimensions updated

**FR2.6: rotate_element**
- **Input:** Element identifier, rotation angle
- **Example:** "Rotate the text 45 degrees"
- **Output:** Element rotation updated

#### Category: Layout (2 commands minimum)

**FR2.7: arrange_elements**
- **Input:** Element identifiers, arrangement pattern (horizontal, vertical, grid)
- **Example:** "Arrange these shapes in a horizontal row"
- **Logic:**
  1. Calculate even spacing
  2. Maintain element order
  3. Update all positions atomically

**FR2.8: align_elements**
- **Input:** Element identifiers, alignment direction (left, center, right, top, middle, bottom)
- **Example:** "Align these elements to the center"

#### Category: Complex (3 commands minimum)

**FR2.9: create_flowchart**
- **Input:** Node descriptions, connections
- **Example:** "Create a flowchart with start, process, decision, and end nodes"
- **Output:** 4+ connected nodes with proper spacing and arrows
- **Requirements:**
  - Nodes spaced 200px vertically
  - Arrows connect nodes automatically
  - Text labels centered on nodes

**FR2.10: create_ui_component**
- **Input:** Component type (form, card, navbar), properties
- **Example:** "Create a login form with username and password fields"
- **Output:** 4+ properly arranged elements:
  - "Username" label + input field rectangle
  - "Password" label + input field rectangle
  - "Login" button
  - Proper spacing and alignment

**FR2.11: create_diagram**
- **Input:** Diagram type, entities
- **Example:** "Build a navigation bar with 4 menu items"
- **Output:** Structured layout with 4+ elements

---

### FR3: Multi-User AI State Management

**Priority:** P0 (Must Have)

**Requirements:**
1. Lock mechanism prevents simultaneous AI commands
2. Firestore path: `canvases/{canvasId}/ai_lock/current`
3. Lock includes: userId, userName, timestamp
4. Lock timeout: 10 seconds
5. User feedback when AI is busy

**Lock Lifecycle:**
```
1. User submits command
2. Check if lock exists and < 10s old
3. If locked → Show toast: "AI is being used by {userName}. Please wait..."
4. If free → Acquire lock with current user's info
5. Execute AI command
6. Release lock (always, even on error)
```

**Acceptance Criteria:**
- [ ] Two users cannot use AI simultaneously
- [ ] Lock auto-expires after 10 seconds
- [ ] Clear error message shown to blocked user
- [ ] Lock always released (try/finally block)

---

### FR4: AI Performance Requirements

**Priority:** P0 (Must Have)

**Requirements:**
1. **Response Time:** 90% of commands complete in < 2 seconds
2. **Accuracy:** 90% of commands execute correctly on first try
3. **Error Handling:** Clear error messages for failed commands
4. **Retry Logic:** Automatic retry on transient failures (network errors)

**Performance Budget:**
- Lock check: < 100ms
- Context building: < 200ms
- Claude API call: < 1000ms
- Command execution: < 500ms
- **Total: < 1800ms**

---

### FR5: Context Awareness

**Priority:** P1 (Should Have)

**Requirements:**
1. Claude receives current canvas state
2. Context includes:
   - All shapes (type, position, color, size)
   - Canvas dimensions (2000x2000)
   - Shape count
3. Context limited to 50 most recent shapes (to save tokens)

**Smart Defaults:**
- "at the center" → x: 1000, y: 1000
- "at the top" → y: 200
- "on the right" → x: 1800
- No color specified → Use default based on shape type

---

## Non-Functional Requirements

### NFR1: Performance
- 90% of commands respond in < 2 seconds
- UI remains responsive during AI processing
- No blocking of canvas interactions

### NFR2: Reliability
- 90%+ command accuracy
- Graceful degradation on API failures
- Automatic lock timeout prevents deadlocks

### NFR3: Security
- API keys not exposed in production
- User commands validated before execution
- No injection attacks via command parsing

### NFR4: Usability
- Clear error messages
- Visual feedback (loading states)
- Keyboard shortcuts for power users

### NFR5: Scalability
- Supports 5+ concurrent users
- Handles canvases with 500+ objects
- Command queue for high load

---

## User Experience

### UX Flow: Simple Command

```
1. User types: "Create a red circle"
2. User presses Enter
3. Input shows loading spinner
4. Lock acquired in Firestore
5. Claude API called with canvas context
6. Claude returns: create_shape tool call
7. createShape() executed → Firestore updated
8. All users see new circle in real-time
9. Lock released
10. Success toast: "Created circle"
11. Input clears, ready for next command
```

### UX Flow: Complex Command

```
1. User types: "Create a login form"
2. Lock acquired
3. Claude analyzes command
4. Claude returns 4 tool calls:
   - create_text("Username", x, y)
   - create_shape(rectangle for input)
   - create_text("Password", x, y+80)
   - create_shape(rectangle for input)
   - create_shape(button)
5. Executor runs all 5 sequentially
6. All elements appear on canvas
7. Success toast: "Created login form with 5 elements"
```

### UX Flow: Multi-User Conflict

```
1. User A types command, presses Enter
2. User B types command, presses Enter (2 seconds after A)
3. User B sees error toast:
   "AI is being used by Alice. Please wait..."
4. User B's command is NOT executed
5. User A's command completes
6. Lock released
7. User B can now retry their command
```

---

## Implementation Plan

### Phase 1: Foundation (Hour 1)
**Duration:** 60 minutes

**Tasks:**
1. Install dependencies
   ```bash
   npm install @anthropic-ai/sdk gsap
   ```
2. Create type definitions
   - `src/types/ai-commands.ts`
   - Tool interfaces
3. Setup Anthropic client
   - `src/services/ai/client.ts`
4. Add `VITE_ANTHROPIC_API_KEY` to `.env.local`

**Deliverables:**
- [ ] Dependencies installed
- [ ] Type definitions created
- [ ] Anthropic client initialized

---

### Phase 2: AI Tools - Simple Commands (Hours 2-3)
**Duration:** 120 minutes

**Tasks:**
1. Implement 6 simple tools:
   - create_shape
   - create_text
   - create_arrow
   - move_element
   - resize_element
   - rotate_element

2. Create tool executor
   - `src/services/ai/executor.ts`

3. Build context builder
   - `src/services/ai/context.ts`

**Deliverables:**
- [ ] 6 tools defined with schemas
- [ ] Executor integrates with existing canvas operations
- [ ] Context builder gathers canvas state

---

### Phase 3: AI Tools - Layout Commands (Hour 4)
**Duration:** 60 minutes

**Tasks:**
1. Implement 2 layout tools:
   - arrange_elements
   - align_elements

2. Implement layout algorithms
   - Horizontal/vertical spacing
   - Alignment calculations

**Deliverables:**
- [ ] 2 layout tools working
- [ ] Smart spacing algorithms
- [ ] 8 tools total (meets rubric minimum)

---

### Phase 4: AI Integration + UX (Hour 4-5)
**Duration:** 60 minutes

**Tasks:**
1. Create AICommandInput component
   - `src/components/ai/AICommandInput.tsx`
2. Implement orchestrator
   - `src/services/ai/orchestrator.ts`
3. Add multi-user lock system
   - `src/services/ai/lock.ts`
4. Toast notifications for feedback

**Deliverables:**
- [ ] AI input box visible on canvas
- [ ] Cmd+K shortcut works
- [ ] Multi-user lock prevents conflicts
- [ ] User feedback (toasts, loading states)

---

### Phase 5: Complex Commands (Hour 5-6)
**Duration:** 60 minutes

**Tasks:**
1. Implement 3 complex tools:
   - create_flowchart
   - create_ui_component
   - create_diagram

2. Multi-step execution logic

**Deliverables:**
- [ ] 11 tools total
- [ ] Complex commands create 3+ elements
- [ ] Smart positioning and arrangement

---

### Phase 6: Testing & Polish (Hours 7-8)
**Duration:** 120 minutes

**Tasks:**
1. Test all 11 commands
2. Verify sub-2s response times
3. Test multi-user scenarios
4. Fix bugs
5. Add error handling
6. Performance optimization

**Deliverables:**
- [ ] All 11 commands working
- [ ] 90%+ accuracy verified
- [ ] Sub-2s response times confirmed
- [ ] Multi-user coordination tested

---

## Testing Strategy

### Unit Tests
- Tool schema validation (Zod)
- Context builder output
- Lock acquire/release logic

### Integration Tests
- Claude API mocking
- Command execution end-to-end
- Multi-user lock scenarios

### Manual Testing Checklist
- [ ] Simple commands work (8 types)
- [ ] Complex commands create multiple elements (3 types)
- [ ] Multi-user: blocked user sees error message
- [ ] Multi-user: lock timeout works (10s)
- [ ] Response time < 2s for 10 sample commands
- [ ] Cmd+K focuses input
- [ ] Error handling for invalid commands
- [ ] Success feedback (toasts)

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Claude API timeout** | High | Medium | Implement 5s timeout, show clear error, allow retry |
| **Multi-user lock conflicts** | Medium | High | 10s timeout, clear error messages, queue system |
| **Command ambiguity** | Medium | Medium | Use last selected shape, ask for clarification |
| **Cost (API calls)** | Low | Low | Cache context, limit to 50 shapes, optimize prompts |
| **API key security** | High | Medium | Move to Firebase Functions for production |
| **Complex command failures** | Medium | Medium | Break into smaller steps, validate each step |

---

## Future Enhancements (Post-V1)

### V2: Conversational Memory
- Remember previous commands in session
- "Make it bigger" → knows which "it"
- Context-aware follow-ups

### V3: Simulation Board Features
Transform Canvisia into a **visual process simulator** where flowcharts come to life.

**Core Simulation Commands:**
- "Simulate this flow" - AI detects flowchart and runs simulation
- "Run 100 tokens through this process" - Spawns animated tokens
- "Show me the bottleneck" - Highlights congestion points
- "Speed up the simulation 2x" - Controls playback speed

**Visual Simulation Engine:**
- **Token Animation** (GSAP Timeline)
  - Tokens spawn at "start" nodes
  - Move along arrows/connectors
  - Split at decision nodes (with probabilities)
  - Queue at bottlenecks (visual stacking)
  - Merge at join nodes
  - Exit at "end" nodes

- **Real-time Metrics Dashboard**
  - Tokens in system: 47
  - Throughput: 12 tokens/sec
  - Avg time in system: 8.3s
  - Queue lengths per node
  - Utilization rates

**AI-Powered Simulation:**
- AI analyzes flowchart structure
- Identifies start/end nodes, processes, decisions
- Infers process times (or asks user: "How long does 'Review' take?")
- Sets up GSAP timelines automatically
- Suggests optimizations: "Try adding 2 more 'Review' nodes to reduce queue"

**Example User Flow:**
1. User: "Create a customer support flowchart"
   → AI creates: Ticket → Triage → Assign → Resolve → Close
2. User: "Simulate this with 50 tickets"
   → AI spawns 50 animated tokens, moves them through flow
3. User: "Show me where tickets are backing up"
   → AI highlights "Triage" node with red glow, shows queue: 23 tickets
4. User: "What if I add another triage agent?"
   → AI duplicates "Triage" node, re-runs simulation, shows improvement

**Technical Implementation:**
- **GSAP Timeline** for smooth 60 FPS animation
- **Custom Simulation Engine** (TypeScript)
  - Token class (position, state, history)
  - Node class (capacity, process time, queue)
  - Edge class (path, speed)
  - Simulation clock (real-time or accelerated)
- **Konva Layer** for rendering tokens
- **AI Orchestration** to set up and control simulation
- **React State** for metrics dashboard

**Use Cases:**
- Process optimization (find bottlenecks)
- System design (capacity planning)
- Education (visualize algorithms: sorting, pathfinding)
- Business analysis (customer journey mapping)
- Software architecture (request flow visualization)

**Stretch Goals:**
- Heatmaps showing "hot spots" over time
- Replay controls (pause, rewind, slow-mo)
- Export simulation as video
- A/B testing: "Compare these 2 process designs"
- Probabilistic branching at decision nodes (70% yes, 30% no)

### V4: Voice Commands
- **Speech-to-text integration** (Web Speech API or Whisper API)
- **Push-to-talk interface** (hold spacebar or click mic button)
- **Hands-free canvas editing** for accessibility
- **Real-time transcription** shown in command input
- **Multi-language support** (English, Spanish, Chinese, etc.)
- **Voice feedback** (optional TTS confirmation)

**Implementation Options:**
1. **Web Speech API** (Browser native, free, works offline)
   - `SpeechRecognition` API
   - Chrome/Edge support excellent
   - Safari/Firefox limited
   - No cost, instant setup

2. **OpenAI Whisper API** (Cloud-based, multilingual, high accuracy)
   - API call per voice command (~$0.006/minute)
   - 99 languages supported
   - More accurate than browser API
   - Works on all browsers

**User Experience:**
- Click microphone icon or press/hold spacebar
- Speak command: "Create a blue circle in the center"
- See transcription appear in real-time
- Release to send command to AI
- Visual feedback (waveform animation during recording)

**Example Voice Commands:**
- "Create three rectangles in a row"
- "Move the selected shape to the top right"
- "Make it bigger" (context-aware)
- "Delete the red circle"
- "Undo that"

**Accessibility Benefits:**
- Hands-free operation for users with mobility impairments
- Faster than typing for power users
- Natural language interface
- Reduces keyboard/mouse fatigue

### V5: Advanced AI
- AI-suggested improvements
- Smart component detection
- Auto-generate from sketches

---

## Appendix

### A. Example Commands

**Creation:**
- "Create a red circle at 100, 200"
- "Add a text layer that says 'Hello World'"
- "Make a 200x300 rectangle with a blue color"

**Manipulation:**
- "Move the blue rectangle to the center"
- "Resize the circle to be twice as big"
- "Rotate the text 45 degrees"
- "Change the color of the rectangle to green"

**Layout:**
- "Arrange these 3 shapes in a horizontal row"
- "Space these elements evenly with 50px gaps"
- "Align these elements to the center"
- "Create a grid of 3x3 squares"

**Complex:**
- "Create a login form with username and password fields"
- "Build a navigation bar with Home, About, Services, Contact"
- "Make a flowchart with start, process, decision, and end nodes"
- "Create a card layout with title, image placeholder, and description"

### B. System Prompts

**Claude System Prompt:**
```
You are an AI assistant for Canvisia, a collaborative canvas tool.
Users will give you commands to create, modify, or arrange elements on the canvas.
Parse their intent and call the appropriate tools.

The canvas is 2000x2000 pixels. When positions aren't specified:
- "at the center" → x: 1000, y: 1000
- "at the top" → y: 200
- "at the bottom" → y: 1800
- "on the left" → x: 200
- "on the right" → x: 1800

Be smart about inferring reasonable defaults for size, color, and positioning.
When creating multiple elements (like a form), arrange them with proper spacing (80px between elements).
```

### C. Tool Schema Example

```typescript
{
  name: "create_shape",
  description: "Create a shape on the canvas",
  input_schema: {
    type: "object",
    properties: {
      shapeType: {
        type: "string",
        enum: ["circle", "rectangle", "triangle", "ellipse", "star"],
        description: "The type of shape to create"
      },
      x: {
        type: "number",
        description: "X coordinate (0-2000)"
      },
      y: {
        type: "number",
        description: "Y coordinate (0-2000)"
      },
      width: {
        type: "number",
        description: "Width in pixels (optional)"
      },
      height: {
        type: "number",
        description: "Height in pixels (optional)"
      },
      radius: {
        type: "number",
        description: "Radius for circles (optional)"
      },
      color: {
        type: "string",
        description: "Hex color like #FF0000 (optional)"
      }
    },
    required: ["shapeType", "x", "y"]
  }
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-17 | Claude + Reena | Initial PRD created |

---

## Approvals

- [ ] Product Owner: _________________
- [ ] Engineering Lead: _________________
- [ ] Design Lead: _________________

---

**End of Document**
