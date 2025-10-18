# AI Canvas Agent - Enhanced Implementation Task List with Tests

**Based on:** TASK_LIST_WITH_TESTS.md PR 13-17
**Enhancements:** Modular architecture, multi-user lock, simulation prep, bottom input UI
**Reference:** Canvisia-Agent-PRD.md, Canvisia-Agent-Architecture.md

---

## Summary of Enhancements Over Original PR 13-17

### Architecture Improvements
- ✅ **Modular Services:** Split monolithic `claude.ts` into 5 services
- ✅ **Multi-User Lock:** Prevent concurrent AI command conflicts
- ✅ **Bottom Input UI:** Command palette instead of side panel
- ✅ **Simulation Ready:** Add metadata and connections fields
- ✅ **11 Commands:** Expanded from 6 to 11 tool functions

### New Files (vs Original)
| Original | Enhanced | Reason |
|----------|----------|--------|
| `src/services/claude.ts` | `src/services/ai/client.ts` | Modular |
| (none) | `src/services/ai/orchestrator.ts` | Separation of concerns |
| (none) | `src/services/ai/executor.ts` | Command execution |
| (none) | `src/services/ai/context.ts` | Context building |
| (none) | `src/services/ai/lock.ts` | Multi-user coordination |
| `src/components/ai/AIPanel.tsx` | `src/components/ai/AICommandInput.tsx` | Better UX |
| (none) | `src/utils/canvasQuery.ts` | Flowchart analysis |
| (none) | `src/utils/connectionUtils.ts` | Arrow connections |

---

## AI Canvas Agent (Enhanced) - PRs 13-17

### PR #13: AI Integration - Basic Setup (Enhanced)

**Goal:** Set up Claude API, modular services, and multi-user lock system

**Branch:** `feature/ai-setup`

**Dependencies:** PR #1-12

**Estimated Time:** 90 minutes (vs 60 min original)

#### Subtasks:

- [ ] **13.1 Install Dependencies**
  - Run: `npm install @anthropic-ai/sdk gsap`
  - Files modified: `package.json`
  - Note: GSAP for future simulation features

- [ ] **13.2 Add Claude API Key to Environment**
  - Files modified:
    - `.env.local` (add `VITE_ANTHROPIC_API_KEY=sk-ant-...`)
    - `.env.example` (add placeholder)
  - Action: Use provided API key

- [ ] **13.3 Create AI Types**
  - Files created:
    - `canvisia/src/types/ai.ts`
  - Content:
    ```typescript
    // AI Command Types
    export interface AICommand {
      id: string
      text: string
      timestamp: number
      userId: string
      status: 'pending' | 'processing' | 'completed' | 'failed'
    }

    // Tool call types
    export interface AIToolCall {
      name: string
      input: Record<string, any>
    }

    // AI Response
    export interface AIResponse {
      content: string
      tool_calls?: AIToolCall[]
      error?: string
    }

    // Lock types
    export interface AILock {
      userId: string
      userName: string
      timestamp: number
      command: string
    }
    ```

- [ ] **13.4 Enhance Shape Types with Metadata**
  - Files modified:
    - `canvisia/src/types/shapes.ts`
  - Content:
    ```typescript
    // Add to BaseShape interface
    export interface BaseShape {
      // ... existing fields ...

      // NEW: Metadata for simulation and advanced features
      metadata?: {
        // Simulation node properties
        nodeType?: 'start' | 'process' | 'decision' | 'end' | 'queue'
        processTime?: number // milliseconds
        capacity?: number // max concurrent tokens
        successRate?: number // % for decision nodes

        // Other extensions
        [key: string]: any
      }
    }

    // Add connections to Arrow types
    export interface Arrow extends BaseShape {
      // ... existing fields ...

      // NEW: Track which shapes this arrow connects
      connections?: {
        fromShapeId?: string
        toShapeId?: string
      }
    }

    // Apply same to BidirectionalArrow, BentConnector
    ```

- [ ] **13.5 Create AI Client Service**
  - Files created:
    - `canvisia/src/services/ai/client.ts`
  - Content:
    ```typescript
    import Anthropic from '@anthropic-ai/sdk'
    import type { AIResponse, AIToolCall } from '@/types/ai'

    const client = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true // Client-side for Day 1
    })

    export async function sendMessage(
      message: string,
      tools: any[],
      systemPrompt: string
    ): Promise<AIResponse> {
      try {
        const response = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
          tools
        })

        // Extract tool calls
        const toolCalls: AIToolCall[] = response.content
          .filter((block) => block.type === 'tool_use')
          .map((block: any) => ({
            name: block.name,
            input: block.input
          }))

        return {
          content: response.content.find((b) => b.type === 'text')?.text || '',
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined
        }
      } catch (error) {
        console.error('Claude API error:', error)
        return {
          content: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    ```

- [ ] **13.6 Create Context Builder Service**
  - Files created:
    - `canvisia/src/services/ai/context.ts`
  - Content:
    ```typescript
    import type { Shape } from '@/types/shapes'

    export function buildContext(shapes: Shape[]): string {
      if (shapes.length === 0) {
        return 'Canvas is empty. No shapes present.'
      }

      // Summarize canvas state
      const summary = {
        totalShapes: shapes.length,
        shapesByType: {} as Record<string, number>,
        recentShapes: shapes.slice(-5).map(s => ({
          id: s.id,
          type: s.type,
          x: s.x,
          y: s.y
        }))
      }

      shapes.forEach(shape => {
        summary.shapesByType[shape.type] = (summary.shapesByType[shape.type] || 0) + 1
      })

      return JSON.stringify(summary, null, 2)
    }
    ```

- [ ] **13.7 Create Multi-User Lock Service**
  - Files created:
    - `canvisia/src/services/ai/lock.ts`
  - Content:
    ```typescript
    import { db } from '@/services/firebase'
    import { ref, set, get, remove, onValue } from 'firebase/database'
    import type { AILock } from '@/types/ai'

    const AI_LOCK_TIMEOUT = 10000 // 10 seconds

    export async function acquireAILock(
      canvasId: string,
      userId: string,
      userName: string,
      command: string
    ): Promise<boolean> {
      const lockRef = ref(db, `canvases/${canvasId}/aiLock`)

      try {
        const snapshot = await get(lockRef)

        if (snapshot.exists()) {
          const lock: AILock = snapshot.val()
          const age = Date.now() - lock.timestamp

          // Break stale lock
          if (age > AI_LOCK_TIMEOUT) {
            await set(lockRef, {
              userId,
              userName,
              timestamp: Date.now(),
              command
            })
            return true
          }

          return false // Lock held by other user
        }

        // Acquire lock
        await set(lockRef, {
          userId,
          userName,
          timestamp: Date.now(),
          command
        })
        return true

      } catch (error) {
        console.error('Error acquiring AI lock:', error)
        return false
      }
    }

    export async function releaseAILock(canvasId: string): Promise<void> {
      const lockRef = ref(db, `canvases/${canvasId}/aiLock`)
      await remove(lockRef)
    }

    export function onAILockChange(
      canvasId: string,
      callback: (lock: AILock | null) => void
    ): () => void {
      const lockRef = ref(db, `canvases/${canvasId}/aiLock`)

      const unsubscribe = onValue(lockRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as AILock)
        } else {
          callback(null)
        }
      })

      return unsubscribe
    }
    ```

- [ ] **🧪 13.8 Create Unit Tests for Lock System**
  - Files created:
    - `canvisia/tests/unit/aiLock.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect, beforeEach, vi } from 'vitest'
    import { acquireAILock, releaseAILock } from '@/services/ai/lock'

    describe('AI Lock System', () => {
      const canvasId = 'test-canvas'

      beforeEach(async () => {
        await releaseAILock(canvasId)
      })

      it('should acquire lock when none exists', async () => {
        const acquired = await acquireAILock(
          canvasId,
          'user1',
          'Alice',
          'Create a circle'
        )
        expect(acquired).toBe(true)
      })

      it('should fail to acquire when lock exists', async () => {
        await acquireAILock(canvasId, 'user1', 'Alice', 'Create a circle')

        const acquired = await acquireAILock(
          canvasId,
          'user2',
          'Bob',
          'Create a rectangle'
        )
        expect(acquired).toBe(false)
      })

      it('should release lock successfully', async () => {
        await acquireAILock(canvasId, 'user1', 'Alice', 'Create a circle')
        await releaseAILock(canvasId)

        const acquired = await acquireAILock(
          canvasId,
          'user2',
          'Bob',
          'Create a rectangle'
        )
        expect(acquired).toBe(true)
      })
    })
    ```

- [ ] **13.9 Define Tool Schemas**
  - Files created:
    - `canvisia/src/services/ai/tools.ts`
  - Content: Define 11 tool schemas (see Appendix A below)

- [ ] **🧪 13.10 Create Unit Tests for Tool Schemas**
  - Files created:
    - `canvisia/tests/unit/aiToolSchemas.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { AI_TOOLS } from '@/services/ai/tools'

    describe('AI Tool Schemas', () => {
      it('should have all 11 required tools defined', () => {
        expect(AI_TOOLS).toHaveProperty('create_shape')
        expect(AI_TOOLS).toHaveProperty('create_text')
        expect(AI_TOOLS).toHaveProperty('create_arrow')
        expect(AI_TOOLS).toHaveProperty('move_element')
        expect(AI_TOOLS).toHaveProperty('resize_element')
        expect(AI_TOOLS).toHaveProperty('rotate_element')
        expect(AI_TOOLS).toHaveProperty('arrange_elements')
        expect(AI_TOOLS).toHaveProperty('align_elements')
        expect(AI_TOOLS).toHaveProperty('create_flowchart')
        expect(AI_TOOLS).toHaveProperty('create_ui_component')
        expect(AI_TOOLS).toHaveProperty('create_diagram')
      })

      it('should validate create_shape schema', () => {
        const schema = AI_TOOLS.create_shape
        expect(schema.input_schema.properties).toHaveProperty('shapeType')
        expect(schema.input_schema.properties).toHaveProperty('x')
        expect(schema.input_schema.properties).toHaveProperty('y')
      })
    })
    ```

- [ ] **13.11 Create AICommandInput Component**
  - Files created:
    - `canvisia/src/components/ai/AICommandInput.tsx`
  - Content:
    ```typescript
    import { useState, useEffect } from 'react'
    import { useAI } from '@/hooks/useAI'

    interface AICommandInputProps {
      canvasId: string
    }

    export function AICommandInput({ canvasId }: AICommandInputProps) {
      const [command, setCommand] = useState('')
      const { sendCommand, isProcessing, isLocked, lockOwner } = useAI(canvasId)

      // Cmd+K to focus
      useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            document.getElementById('ai-command-input')?.focus()
          }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
      }, [])

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!command.trim() || isProcessing) return

        await sendCommand(command)
        setCommand('')
      }

      return (
        <div className="ai-command-bar">
          <form onSubmit={handleSubmit} className="ai-form">
            <input
              id="ai-command-input"
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={
                isLocked
                  ? `AI busy with ${lockOwner}'s command...`
                  : isProcessing
                  ? 'Processing...'
                  : '🤖 Type AI command... (Cmd+K)'
              }
              disabled={isProcessing || isLocked}
              className="ai-input"
            />
            <button
              type="submit"
              disabled={isProcessing || isLocked || !command.trim()}
              className="ai-submit-btn"
            >
              {isProcessing ? '⏳' : '→'}
            </button>
          </form>
        </div>
      )
    }
    ```

- [ ] **13.12 Create AIStatusIndicator Component**
  - Files created:
    - `canvisia/src/components/ai/AIStatusIndicator.tsx`
  - Content:
    ```typescript
    interface AIStatusIndicatorProps {
      status: 'idle' | 'processing' | 'success' | 'error'
      message?: string
    }

    export function AIStatusIndicator({ status, message }: AIStatusIndicatorProps) {
      if (status === 'idle') return null

      return (
        <div className={`ai-status ai-status-${status}`}>
          {status === 'processing' && '⏳ AI is thinking...'}
          {status === 'success' && `✅ ${message || 'Success!'}`}
          {status === 'error' && `❌ ${message || 'Error'}`}
        </div>
      )
    }
    ```

- [ ] **13.13 Create useAI Hook**
  - Files created:
    - `canvisia/src/hooks/useAI.ts`
  - Content:
    ```typescript
    import { useState, useEffect } from 'react'
    import { useAuth } from '@/contexts/AuthContext'
    import { acquireAILock, releaseAILock, onAILockChange } from '@/services/ai/lock'
    import { sendMessage } from '@/services/ai/client'
    import { AI_TOOLS, SYSTEM_PROMPT } from '@/services/ai/tools'
    import { buildContext } from '@/services/ai/context'
    import { executeToolCalls } from '@/services/ai/executor'
    import { toast } from 'sonner'

    export function useAI(canvasId: string) {
      const { user } = useAuth()
      const [isProcessing, setIsProcessing] = useState(false)
      const [isLocked, setIsLocked] = useState(false)
      const [lockOwner, setLockOwner] = useState<string | null>(null)

      // Listen to lock changes
      useEffect(() => {
        const unsubscribe = onAILockChange(canvasId, (lock) => {
          if (lock) {
            setIsLocked(lock.userId !== user?.uid)
            setLockOwner(lock.userName)
          } else {
            setIsLocked(false)
            setLockOwner(null)
          }
        })
        return unsubscribe
      }, [canvasId, user?.uid])

      const sendCommand = async (command: string) => {
        if (!user) return

        // Try to acquire lock
        const acquired = await acquireAILock(
          canvasId,
          user.uid,
          user.displayName || 'Unknown User',
          command
        )

        if (!acquired) {
          toast.error(`AI is busy with ${lockOwner}'s command. Please wait...`)
          return
        }

        setIsProcessing(true)

        try {
          // Build context
          const context = buildContext(shapes)

          // Call Claude
          const response = await sendMessage(command, AI_TOOLS, SYSTEM_PROMPT)

          if (response.error) {
            toast.error(`AI Error: ${response.error}`)
            return
          }

          // Execute tool calls
          if (response.tool_calls && response.tool_calls.length > 0) {
            await executeToolCalls(response.tool_calls, canvasId)
            toast.success(`✅ Created ${response.tool_calls.length} element(s)`)
          } else {
            toast.info(response.content || 'No actions taken')
          }

        } catch (error) {
          console.error('AI command error:', error)
          toast.error('Failed to execute command')
        } finally {
          setIsProcessing(false)
          await releaseAILock(canvasId)
        }
      }

      return { sendCommand, isProcessing, isLocked, lockOwner }
    }
    ```

- [ ] **13.14 Integrate AI Input into App**
  - Files modified:
    - `canvisia/src/App.tsx`
  - Content:
    ```typescript
    import { AICommandInput } from '@/components/ai/AICommandInput'

    // Add at bottom of app layout
    <AICommandInput canvasId={canvasId} />
    ```

- [ ] **13.15 Add AI Input Styles**
  - Files modified:
    - `canvisia/src/index.css`
  - Content:
    ```css
    .ai-command-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: #ffffff;
      border-top: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      padding: 0 20px;
      z-index: 1000;
    }

    .ai-form {
      display: flex;
      gap: 10px;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

    .ai-input {
      flex: 1;
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
    }

    .ai-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .ai-input:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }

    .ai-submit-btn {
      padding: 8px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
    }

    .ai-submit-btn:hover:not(:disabled) {
      background: #2563eb;
    }

    .ai-submit-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    ```

- [ ] **🧪 13.16 Create Integration Test for Claude API**
  - Files created:
    - `canvisia/tests/integration/claudeAPI.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { sendMessage } from '@/services/ai/client'
    import { AI_TOOLS, SYSTEM_PROMPT } from '@/services/ai/tools'

    describe('Claude API Integration', () => {
      it('should send message and receive response', async () => {
        const response = await sendMessage(
          'Hello',
          [],
          SYSTEM_PROMPT
        )
        expect(response).toBeDefined()
        expect(response.content).toBeTruthy()
      }, 10000)

      it('should handle function calling', async () => {
        const response = await sendMessage(
          'Create a blue circle at 100, 200',
          AI_TOOLS,
          SYSTEM_PROMPT
        )
        expect(response.tool_calls).toBeDefined()
        expect(response.tool_calls?.length).toBeGreaterThan(0)
      }, 10000)
    })
    ```

- [ ] **13.17 Test Basic AI Flow**
  - Action:
    - Open app in browser
    - Focus AI input (Cmd+K)
    - Type "hello"
    - Verify Claude responds
    - Check console for errors

**Files Created/Modified:**
- Created: `canvisia/src/services/ai/client.ts`, `canvisia/src/services/ai/context.ts`, `canvisia/src/services/ai/lock.ts`, `canvisia/src/services/ai/tools.ts`, `canvisia/src/types/ai.ts`, `canvisia/src/components/ai/AICommandInput.tsx`, `canvisia/src/components/ai/AIStatusIndicator.tsx`, `canvisia/src/hooks/useAI.ts`, `canvisia/tests/unit/aiLock.test.ts`, `canvisia/tests/unit/aiToolSchemas.test.ts`, `canvisia/tests/integration/claudeAPI.test.ts`
- Modified: `.env.local`, `.env.example`, `package.json`, `canvisia/src/App.tsx`, `canvisia/src/types/shapes.ts`, `canvisia/src/index.css`

**Acceptance Criteria:**
- [ ] Claude API integration works
- [ ] AI command input displays at bottom
- [ ] Cmd+K focuses input
- [ ] Multi-user lock prevents conflicts
- [ ] Function calling schemas defined (11 tools)
- [ ] No errors in console
- [ ] ✅ All tests pass

---

### PR #14: AI Creation Commands (Enhanced)

**Goal:** Implement AI commands to create shapes, text, and arrows

**Branch:** `feature/ai-creation`

**Dependencies:** PR #1-13

**Required Commands (minimum 3):**
- "Create a red circle at position 100, 200"
- "Add a text layer that says 'Hello World'"
- "Draw an arrow from 100,100 to 500,500"

**Estimated Time:** 90 minutes

#### Subtasks:

- [ ] **14.1 Create Command Executor Service**
  - Files created:
    - `canvisia/src/services/ai/executor.ts`
  - Content:
    ```typescript
    import type { AIToolCall } from '@/types/ai'
    import { executeCreateShape } from '@/utils/aiHelpers'
    import { executeCreateText } from '@/utils/aiHelpers'
    import { executeCreateArrow } from '@/utils/aiHelpers'
    // ... other executors

    export async function executeToolCalls(
      toolCalls: AIToolCall[],
      canvasId: string
    ): Promise<void> {
      for (const toolCall of toolCalls) {
        switch (toolCall.name) {
          case 'create_shape':
            await executeCreateShape(canvasId, toolCall.input)
            break
          case 'create_text':
            await executeCreateText(canvasId, toolCall.input)
            break
          case 'create_arrow':
            await executeCreateArrow(canvasId, toolCall.input)
            break
          // ... other cases
          default:
            console.warn(`Unknown tool: ${toolCall.name}`)
        }
      }
    }
    ```

- [ ] **14.2 Implement executeCreateShape**
  - Files created:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content:
    ```typescript
    import { createShapeInFirestore } from '@/services/firestore'
    import type { Shape } from '@/types/shapes'
    import { v4 as uuidv4 } from 'uuid'

    export async function executeCreateShape(
      canvasId: string,
      input: {
        shapeType: string
        x: number
        y: number
        width?: number
        height?: number
        radius?: number
        color?: string
      }
    ): Promise<void> {
      const { shapeType, x, y, width = 100, height = 100, radius = 50, color = '#3B82F6' } = input

      let shape: Partial<Shape>

      switch (shapeType) {
        case 'rectangle':
          shape = {
            id: uuidv4(),
            type: 'rectangle',
            x,
            y,
            width,
            height,
            fill: color,
            stroke: '#1F2937',
            strokeWidth: 2,
            rotation: 0,
            createdBy: 'ai',
            updatedAt: new Date().toISOString()
          }
          break

        case 'circle':
          shape = {
            id: uuidv4(),
            type: 'circle',
            x,
            y,
            radius,
            fill: color,
            stroke: '#1F2937',
            strokeWidth: 2,
            rotation: 0,
            createdBy: 'ai',
            updatedAt: new Date().toISOString()
          }
          break

        // ... other shape types
      }

      await createShapeInFirestore(canvasId, shape as Shape)
    }
    ```

- [ ] **🧪 14.3 Create Unit Tests for AI Helpers**
  - Files created:
    - `canvisia/tests/unit/aiHelpers.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect, vi } from 'vitest'
    import { executeCreateShape, executeCreateText } from '@/utils/aiHelpers'

    describe('AI Helper Functions', () => {
      it('should create rectangle with correct properties', async () => {
        const mockCreate = vi.fn()

        await executeCreateShape('canvas1', {
          shapeType: 'rectangle',
          x: 100,
          y: 200,
          width: 150,
          height: 100,
          color: '#FF0000'
        })

        // Verify shape created
        expect(mockCreate).toHaveBeenCalled()
      })

      it('should handle default values', async () => {
        await executeCreateShape('canvas1', {
          shapeType: 'rectangle',
          x: 0,
          y: 0
        })

        // Should use default width/height of 100
      })
    })
    ```

- [ ] **14.4 Implement executeCreateText**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Create text shapes with defaults

- [ ] **14.5 Implement executeCreateArrow**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Create arrow shapes, detect connections

- [ ] **14.6 Add Connection Detection for Arrows**
  - Files created:
    - `canvisia/src/utils/connectionUtils.ts`
  - Content:
    ```typescript
    import type { Shape, Arrow } from '@/types/shapes'

    export function detectConnection(
      arrow: Arrow,
      shapes: Shape[]
    ): { fromShapeId?: string; toShapeId?: string } {
      const [x1, y1] = [arrow.x, arrow.y]
      const [x2, y2] = [arrow.x2, arrow.y2]

      const fromShape = shapes.find(s => isPointInShape({ x: x1, y: y1 }, s))
      const toShape = shapes.find(s => isPointInShape({ x: x2, y: y2 }, s))

      return {
        fromShapeId: fromShape?.id,
        toShapeId: toShape?.id
      }
    }

    function isPointInShape(point: { x: number; y: number }, shape: Shape): boolean {
      // Implement point-in-shape detection
      // For rectangles, circles, etc.
    }
    ```

- [ ] **14.7 Test: "Create a red circle at position 100, 200"**
  - Action: Type command, verify circle appears

- [ ] **14.8 Test: "Add a text layer that says 'Hello World'"**
  - Action: Type command, verify text appears

- [ ] **14.9 Test: "Draw an arrow from 100,100 to 500,500"**
  - Action: Type command, verify arrow appears

- [ ] **14.10 Smart Position Defaults**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Default to center (1000, 1000) if no position specified

- [ ] **🧪 14.11 Create Integration Test for AI Commands**
  - Files created:
    - `canvisia/tests/integration/aiCommands.test.ts`
  - Content: Test end-to-end command execution

- [ ] **14.12 Test Multiple Creation Commands**
  - Action: Test 5+ different creation commands
  - Verify all work correctly
  - Test with 2 users

**Files Created/Modified:**
- Created: `canvisia/src/services/ai/executor.ts`, `canvisia/src/utils/aiHelpers.ts`, `canvisia/src/utils/connectionUtils.ts`, `canvisia/tests/unit/aiHelpers.test.ts`, `canvisia/tests/integration/aiCommands.test.ts`
- Modified: `canvisia/src/hooks/useAI.ts`

**Acceptance Criteria:**
- [ ] Can create shapes via AI commands
- [ ] At least 3 creation commands work
- [ ] AI-created shapes sync to all users
- [ ] Arrows detect connections automatically
- [ ] Shapes appear at reasonable positions
- [ ] Response time <2 seconds
- [ ] ✅ All tests pass

---

### PR #15: AI Manipulation Commands (Enhanced)

**Goal:** Implement AI commands to move, resize, rotate shapes

**Branch:** `feature/ai-manipulation`

**Dependencies:** PR #1-14

**Required Commands (minimum 3):**
- "Move the blue rectangle to the center"
- "Resize the circle to be twice as big"
- "Rotate the text 45 degrees"

**Estimated Time:** 90 minutes

#### Subtasks:

- [ ] **15.1 Implement Shape Identification Logic**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content:
    ```typescript
    export function findShape(
      shapes: Shape[],
      descriptor: {
        type?: string
        color?: string
        id?: string
      }
    ): Shape | undefined {
      // Find by ID
      if (descriptor.id) {
        return shapes.find(s => s.id === descriptor.id)
      }

      // Find by color + type
      if (descriptor.color && descriptor.type) {
        return shapes
          .filter(s => s.type === descriptor.type)
          .find(s => matchesColor(s, descriptor.color))
      }

      // Find by type only (most recent)
      if (descriptor.type) {
        return shapes.filter(s => s.type === descriptor.type).slice(-1)[0]
      }

      return undefined
    }

    function matchesColor(shape: Shape, colorName: string): boolean {
      const colorMap: Record<string, string[]> = {
        blue: ['#3B82F6', '#2563EB', '#1D4ED8'],
        red: ['#EF4444', '#DC2626', '#B91C1C'],
        // ... more colors
      }

      const fill = 'fill' in shape ? shape.fill : undefined
      if (!fill) return false

      return colorMap[colorName.toLowerCase()]?.includes(fill) || false
    }
    ```

- [ ] **🧪 15.2 Create Unit Tests for Shape Identification**
  - Files created:
    - `canvisia/tests/unit/shapeIdentification.test.ts`
  - Content: Test finding shapes by color, type, description

- [ ] **15.3 Implement executeMoveShape**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Move shape by updating x, y

- [ ] **15.4 Implement Smart Positioning**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content:
    ```typescript
    export function calculateSmartPosition(
      position: string,
      canvasSize = { width: 2000, height: 2000 }
    ): { x: number; y: number } {
      switch (position.toLowerCase()) {
        case 'center':
          return { x: canvasSize.width / 2, y: canvasSize.height / 2 }
        case 'top left':
          return { x: 200, y: 200 }
        case 'top right':
          return { x: canvasSize.width - 200, y: 200 }
        // ... more positions
        default:
          return { x: canvasSize.width / 2, y: canvasSize.height / 2 }
      }
    }
    ```

- [ ] **🧪 15.5 Create Unit Tests for Smart Positioning**
  - Files created:
    - `canvisia/tests/unit/smartPositioning.test.ts`

- [ ] **15.6 Implement executeResizeShape**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Resize by scale factor or absolute dimensions

- [ ] **15.7 Implement executeRotateShape**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Update rotation field

- [ ] **15.8 Connect Manipulation Functions to Executor**
  - Files modified:
    - `canvisia/src/services/ai/executor.ts`
  - Content: Add cases for move, resize, rotate

- [ ] **15.9 Test: "Move the blue rectangle to the center"**

- [ ] **15.10 Test: "Resize the circle to be twice as big"**

- [ ] **15.11 Test: "Rotate the text 45 degrees"**

- [ ] **15.12 Test Chained Commands**
  - Example: "Create a circle, then move it left"

**Files Created/Modified:**
- Created: `canvisia/tests/unit/shapeIdentification.test.ts`, `canvisia/tests/unit/smartPositioning.test.ts`
- Modified: `canvisia/src/utils/aiHelpers.ts`, `canvisia/src/services/ai/executor.ts`

**Acceptance Criteria:**
- [ ] Can move shapes via AI commands
- [ ] Can resize shapes via AI commands
- [ ] Can rotate shapes via AI commands
- [ ] At least 3 manipulation commands work
- [ ] Shape identification works correctly
- [ ] Smart positioning works (center, top left, etc.)
- [ ] ✅ All tests pass

---

### PR #16: AI Layout Commands (Enhanced)

**Goal:** Implement AI commands for arranging multiple shapes

**Branch:** `feature/ai-layout`

**Dependencies:** PR #1-15

**Required Commands (minimum 3):**
- "Arrange these shapes in a horizontal row"
- "Create a grid of 3x3 squares"
- "Align these elements to the center"

**Estimated Time:** 90 minutes

#### Subtasks:

- [ ] **16.1 Implement executeArrangeElements**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content:
    ```typescript
    export async function executeArrangeElements(
      canvasId: string,
      input: {
        shapeIds: string[]
        pattern: 'horizontal' | 'vertical' | 'grid'
        spacing?: number
      }
    ): Promise<void> {
      const { shapeIds, pattern, spacing = 50 } = input

      const shapes = await getShapesByIds(shapeIds)

      switch (pattern) {
        case 'horizontal':
          arrangeHorizontal(shapes, spacing)
          break
        case 'vertical':
          arrangeVertical(shapes, spacing)
          break
        case 'grid':
          arrangeGrid(shapes, spacing)
          break
      }

      // Update all shapes
      for (const shape of shapes) {
        await updateShapeInFirestore(canvasId, shape.id, {
          x: shape.x,
          y: shape.y
        })
      }
    }
    ```

- [ ] **🧪 16.2 Create Unit Tests for Layout Calculations**
  - Files created:
    - `canvisia/tests/unit/layoutCalculations.test.ts`
  - Content: Test horizontal, vertical, grid layouts

- [ ] **16.3 Implement executeAlignElements**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Align left, center, right, top, middle, bottom

- [ ] **16.4 Implement Grid Creation**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content: Create NxM grid of shapes

- [ ] **16.5 Connect Layout Functions to Executor**

- [ ] **16.6 Test: "Arrange these shapes in a horizontal row"**

- [ ] **16.7 Test: "Create a grid of 3x3 squares"**

- [ ] **16.8 Test: "Align these elements to the center"**

- [ ] **🧪 16.9 Create Integration Test for Layout Commands**

**Files Created/Modified:**
- Created: `canvisia/tests/unit/layoutCalculations.test.ts`, `canvisia/tests/integration/layoutCommands.test.ts`
- Modified: `canvisia/src/utils/aiHelpers.ts`, `canvisia/src/services/ai/executor.ts`

**Acceptance Criteria:**
- [ ] Can arrange shapes horizontally/vertically
- [ ] Can create grids via AI
- [ ] Can align shapes
- [ ] At least 3 layout commands work
- [ ] All operations sync between users
- [ ] ✅ All tests pass

---

### PR #17: Complex AI Commands & Polish (Enhanced)

**Goal:** Implement multi-step complex commands and polish AI UX

**Branch:** `feature/ai-complex`

**Dependencies:** PR #1-16

**Complex Commands (minimum 3):**
- "Create a login form with username and password fields"
- "Build a navigation bar with 4 menu items"
- "Create a flowchart with start, process, decision, and end nodes"

**Estimated Time:** 120 minutes

#### Subtasks:

- [ ] **17.1 Implement Multi-Step Command Execution**
  - Files modified:
    - `canvisia/src/services/ai/executor.ts`
  - Content: Execute multiple tool calls sequentially

- [ ] **17.2 Implement createUIComponent (Login Form)**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content:
    ```typescript
    export async function executeCreateUIComponent(
      canvasId: string,
      input: {
        componentType: 'login_form' | 'nav_bar' | 'card'
        x: number
        y: number
      }
    ): Promise<void> {
      const { componentType, x, y } = input

      switch (componentType) {
        case 'login_form':
          await createLoginForm(canvasId, x, y)
          break
        case 'nav_bar':
          await createNavBar(canvasId, x, y)
          break
        case 'card':
          await createCard(canvasId, x, y)
          break
      }
    }

    async function createLoginForm(canvasId: string, x: number, y: number) {
      // Create: Username label, input, Password label, input, Login button
      const shapes: Partial<Shape>[] = [
        { type: 'text', text: 'Username', x, y, fontSize: 16 },
        { type: 'rectangle', x, y: y + 30, width: 200, height: 40 }, // Input
        { type: 'text', text: 'Password', x, y: y + 80, fontSize: 16 },
        { type: 'rectangle', x, y: y + 110, width: 200, height: 40 }, // Input
        { type: 'rectangle', x, y: y + 160, width: 200, height: 40, fill: '#3B82F6' } // Button
      ]

      for (const shape of shapes) {
        await createShapeInFirestore(canvasId, shape as Shape)
      }
    }
    ```

- [ ] **17.3 Implement createFlowchart**
  - Files modified:
    - `canvisia/src/utils/aiHelpers.ts`
  - Content:
    ```typescript
    async function createFlowchart(canvasId: string, x: number, y: number) {
      const nodes = [
        { type: 'ellipse', x, y, text: 'Start', metadata: { nodeType: 'start' } },
        { type: 'rectangle', x, y: y + 150, text: 'Process', metadata: { nodeType: 'process' } },
        { type: 'diamond', x, y: y + 300, text: 'Decision', metadata: { nodeType: 'decision' } },
        { type: 'ellipse', x, y: y + 450, text: 'End', metadata: { nodeType: 'end' } }
      ]

      // Create nodes
      const createdNodes = []
      for (const node of nodes) {
        const shape = await createShapeInFirestore(canvasId, node as Shape)
        createdNodes.push(shape)
      }

      // Create connecting arrows
      for (let i = 0; i < createdNodes.length - 1; i++) {
        await createShapeInFirestore(canvasId, {
          type: 'arrow',
          x: createdNodes[i].x,
          y: createdNodes[i].y + 75,
          x2: createdNodes[i + 1].x,
          y2: createdNodes[i + 1].y - 75,
          connections: {
            fromShapeId: createdNodes[i].id,
            toShapeId: createdNodes[i + 1].id
          }
        } as Arrow)
      }
    }
    ```

- [ ] **17.4 Implement Canvas Query Utility**
  - Files created:
    - `canvisia/src/utils/canvasQuery.ts`
  - Content:
    ```typescript
    export class CanvasQuery {
      constructor(private shapes: Shape[]) {}

      findFlowchartNodes(): Shape[] {
        return this.shapes.filter(s => s.metadata?.nodeType !== undefined)
      }

      findConnections(): Array<{ from: Shape; to: Shape; arrow: Arrow }> {
        const arrows = this.shapes.filter(s =>
          s.type === 'arrow' || s.type === 'bidirectionalArrow'
        ) as Arrow[]

        return arrows
          .map(arrow => ({
            from: this.shapes.find(s => s.id === arrow.connections?.fromShapeId),
            to: this.shapes.find(s => s.id === arrow.connections?.toShapeId),
            arrow
          }))
          .filter(conn => conn.from && conn.to) as any
      }

      buildFlowGraph(): Map<string, string[]> {
        const graph = new Map<string, string[]>()
        const connections = this.findConnections()

        connections.forEach(({ from, to }) => {
          if (!graph.has(from.id)) graph.set(from.id, [])
          graph.get(from.id)!.push(to.id)
        })

        return graph
      }
    }
    ```

- [ ] **🧪 17.5 Create Unit Tests for Complex Commands**
  - Files created:
    - `canvisia/tests/unit/complexCommands.test.ts`

- [ ] **17.6 Test: "Create a login form"**

- [ ] **17.7 Test: "Build a navigation bar with 4 menu items"**

- [ ] **17.8 Test: "Create a flowchart"**

- [ ] **17.9 Add AI Undo Functionality**
  - Files modified:
    - `canvisia/src/hooks/useAI.ts`
  - Content: Track shapes created by last command, delete on undo

- [ ] **17.10 Add Command Suggestions**
  - Files modified:
    - `canvisia/src/components/ai/AICommandInput.tsx`
  - Content: Show example commands

- [ ] **17.11 Polish AI UI**
  - Better loading states
  - Error messages with suggestions
  - Success animations

- [ ] **17.12 Test Multi-User Scenarios**
  - Test 2+ users using AI simultaneously
  - Verify lock prevents conflicts

- [ ] **🧪 17.13 Create Integration Test for Multi-Step Execution**

**Files Created/Modified:**
- Created: `canvisia/src/utils/canvasQuery.ts`, `canvisia/tests/unit/complexCommands.test.ts`, `canvisia/tests/integration/multiStepExecution.test.ts`
- Modified: `canvisia/src/utils/aiHelpers.ts`, `canvisia/src/hooks/useAI.ts`, `canvisia/src/components/ai/AICommandInput.tsx`, `canvisia/src/services/ai/executor.ts`, `canvisia/src/index.css`

**Acceptance Criteria:**
- [ ] At least 3 complex commands work (login form, nav bar, flowchart)
- [ ] Multi-step commands execute correctly
- [ ] AI UX is polished (loading states, errors, suggestions)
- [ ] Can undo AI commands
- [ ] Multiple users can use AI simultaneously (with lock)
- [ ] All AI-created shapes sync between users
- [ ] Flowchart nodes have metadata for simulation
- [ ] Total of 11+ command types work across all AI PRs
- [ ] ✅ All tests pass

---

## Summary

### Total Enhancements
- **11 AI Commands** (vs 6 in original)
- **Multi-User Lock System** (new)
- **Bottom Command Input** (vs side panel)
- **Modular Services** (5 files vs 1)
- **Simulation Ready** (metadata, connections)
- **11 Test Files** (comprehensive coverage)

### Estimated Time
- **PR #13:** 90 min
- **PR #14:** 90 min
- **PR #15:** 90 min
- **PR #16:** 90 min
- **PR #17:** 120 min
- **Total:** ~8 hours

---

## Appendix A: Tool Schemas

```typescript
// canvisia/src/services/ai/tools.ts
export const SYSTEM_PROMPT = `You are an AI assistant for Canvisia, a collaborative canvas tool.
Users will give you commands to create, modify, or arrange elements on the canvas.
Parse their intent and call the appropriate tools.

The canvas is 2000x2000 pixels. When positions aren't specified:
- "at the center" → x: 1000, y: 1000
- "at the top" → y: 200
- "at the bottom" → y: 1800
- "on the left" → x: 200
- "on the right" → x: 1800

Be smart about inferring reasonable defaults for size, color, and positioning.`

export const AI_TOOLS = [
  {
    name: "create_shape",
    description: "Create a shape on the canvas",
    input_schema: {
      type: "object",
      properties: {
        shapeType: {
          type: "string",
          enum: ["rectangle", "circle", "ellipse", "triangle", "pentagon", "hexagon", "star"],
          description: "Type of shape to create"
        },
        x: { type: "number", description: "X coordinate (0-2000)" },
        y: { type: "number", description: "Y coordinate (0-2000)" },
        width: { type: "number", description: "Width in pixels (optional, default 100)" },
        height: { type: "number", description: "Height in pixels (optional, default 100)" },
        radius: { type: "number", description: "Radius for circles (optional, default 50)" },
        color: { type: "string", description: "Hex color like #FF0000 or color name (optional, default blue)" }
      },
      required: ["shapeType", "x", "y"]
    }
  },
  {
    name: "create_text",
    description: "Create a text element on the canvas",
    input_schema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text content" },
        x: { type: "number", description: "X coordinate" },
        y: { type: "number", description: "Y coordinate" },
        fontSize: { type: "number", description: "Font size (optional, default 16)" },
        color: { type: "string", description: "Text color (optional, default black)" }
      },
      required: ["text", "x", "y"]
    }
  },
  {
    name: "create_arrow",
    description: "Create an arrow or connector between two points",
    input_schema: {
      type: "object",
      properties: {
        x1: { type: "number", description: "Start X coordinate" },
        y1: { type: "number", description: "Start Y coordinate" },
        x2: { type: "number", description: "End X coordinate" },
        y2: { type: "number", description: "End Y coordinate" },
        style: { type: "string", enum: ["arrow", "bidirectional", "line"], description: "Arrow style (optional, default arrow)" }
      },
      required: ["x1", "y1", "x2", "y2"]
    }
  },
  {
    name: "move_element",
    description: "Move an existing element to a new position",
    input_schema: {
      type: "object",
      properties: {
        elementId: { type: "string", description: "ID of element to move (optional if using description)" },
        description: { type: "string", description: "Description like 'the blue rectangle' (optional if using elementId)" },
        x: { type: "number", description: "New X coordinate (optional if using position)" },
        y: { type: "number", description: "New Y coordinate (optional if using position)" },
        position: { type: "string", description: "Named position like 'center', 'top left' (optional if using x, y)" }
      },
      required: []
    }
  },
  {
    name: "resize_element",
    description: "Resize an existing element",
    input_schema: {
      type: "object",
      properties: {
        elementId: { type: "string", description: "ID of element (optional if using description)" },
        description: { type: "string", description: "Description like 'the circle'" },
        scale: { type: "number", description: "Scale factor like 2 for twice as big (optional if using width/height)" },
        width: { type: "number", description: "New width (optional if using scale)" },
        height: { type: "number", description: "New height (optional if using scale)" }
      },
      required: []
    }
  },
  {
    name: "rotate_element",
    description: "Rotate an existing element",
    input_schema: {
      type: "object",
      properties: {
        elementId: { type: "string" },
        description: { type: "string" },
        angle: { type: "number", description: "Rotation angle in degrees" }
      },
      required: ["angle"]
    }
  },
  {
    name: "arrange_elements",
    description: "Arrange multiple elements in a pattern",
    input_schema: {
      type: "object",
      properties: {
        elementIds: { type: "array", items: { type: "string" } },
        pattern: { type: "string", enum: ["horizontal", "vertical", "grid"] },
        spacing: { type: "number", description: "Spacing between elements (optional, default 50)" }
      },
      required: ["pattern"]
    }
  },
  {
    name: "align_elements",
    description: "Align multiple elements",
    input_schema: {
      type: "object",
      properties: {
        elementIds: { type: "array", items: { type: "string" } },
        alignment: { type: "string", enum: ["left", "center", "right", "top", "middle", "bottom"] }
      },
      required: ["alignment"]
    }
  },
  {
    name: "create_flowchart",
    description: "Create a flowchart with connected nodes",
    input_schema: {
      type: "object",
      properties: {
        x: { type: "number", description: "Starting X position" },
        y: { type: "number", description: "Starting Y position" },
        nodes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["start", "process", "decision", "end"] },
              label: { type: "string" }
            }
          }
        }
      },
      required: ["x", "y"]
    }
  },
  {
    name: "create_ui_component",
    description: "Create a UI component like a form or navbar",
    input_schema: {
      type: "object",
      properties: {
        componentType: { type: "string", enum: ["login_form", "nav_bar", "card"] },
        x: { type: "number" },
        y: { type: "number" },
        items: { type: "array", items: { type: "string" }, description: "Menu items for nav_bar (optional)" }
      },
      required: ["componentType", "x", "y"]
    }
  },
  {
    name: "create_diagram",
    description: "Create a structured diagram",
    input_schema: {
      type: "object",
      properties: {
        diagramType: { type: "string", enum: ["org_chart", "mind_map", "timeline"] },
        x: { type: "number" },
        y: { type: "number" }
      },
      required: ["diagramType", "x", "y"]
    }
  }
]
```

---

## Testing Checklist

### Unit Tests
- [ ] AI Lock system
- [ ] Tool schema validation
- [ ] Shape identification
- [ ] Smart positioning
- [ ] Layout calculations
- [ ] Complex command helpers
- [ ] Canvas query utility

### Integration Tests
- [ ] Claude API connection
- [ ] Tool call execution
- [ ] Multi-step commands
- [ ] Layout commands
- [ ] Creation commands

### Manual Tests
- [ ] All 11 commands work
- [ ] Multi-user lock prevents conflicts
- [ ] Response time < 2s
- [ ] Cmd+K focuses input
- [ ] Error handling
- [ ] Success feedback
- [ ] Undo functionality

---

**Total: 11 Commands, 8 Hours, Production-Ready AI Agent** 🚀
