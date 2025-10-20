import type { AIToolCall } from '@/types/ai'
import type { Viewport } from '@/types/canvas'
import type { Shape } from '@/types/shapes'
import {
  executeCreateShape,
  executeCreateMultipleShapes,
  executeCreateText,
  executeCreateArrow,
  executeMoveElement,
  executeResizeElement,
  executeRotateElement,
  executeChangeColor,
  executeDeleteElements,
  executeArrangeElements,
  executeAlignElements,
  executeCreateUIComponent,
  executeCreateFlowchart,
  executeCreateDiagram,
  executeUndo,
} from '@/utils/aiHelpers'
// TODO: Implement undo tracking in execution functions
// import { saveUndoAction } from './undo'
// import type { UndoAction } from './undo'
// import { v4 as uuidv4 } from 'uuid'

/**
 * Execution result with metadata for partial match detection and undo tracking
 */
export interface ExecutionResult {
  success: boolean
  partialMatch?: {
    expected?: number | string
    actual: number | string
    type: string
    clarification: string
  }
  // Undo information
  undoData?: {
    actionType: 'create' | 'modify' | 'delete'
    createdShapeIds?: string[]
    modifiedShapes?: Array<{
      id: string
      originalState: Partial<Shape>
    }>
    deletedShapes?: Shape[]
  }
}

/**
 * Execute AI tool calls sequentially
 * Returns execution results with metadata for generating helpful responses
 */
export async function executeToolCalls(
  toolCalls: AIToolCall[],
  canvasId: string,
  userId: string,
  viewport: Viewport
): Promise<ExecutionResult[]> {
  console.log('Executing tool calls:', toolCalls, 'for canvas:', canvasId, 'userId:', userId, 'viewport:', viewport)

  const results: ExecutionResult[] = []

  for (const toolCall of toolCalls) {
    try {
      console.log(`[Executor] Executing tool: ${toolCall.name}`)

      let result: ExecutionResult = { success: true }

      switch (toolCall.name) {
        case 'create_shape':
          await executeCreateShape(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_shape completed successfully')
          break

        case 'create_multiple_shapes':
          await executeCreateMultipleShapes(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_multiple_shapes completed successfully')
          break

        case 'create_text':
          await executeCreateText(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_text completed successfully')
          break

        case 'create_arrow':
          await executeCreateArrow(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_arrow completed successfully')
          break

        // PR 15: Manipulation Commands
        case 'move_element':
          await executeMoveElement(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] move_element completed successfully')
          break

        case 'resize_element':
          await executeResizeElement(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] resize_element completed successfully')
          break

        case 'rotate_element':
          await executeRotateElement(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] rotate_element completed successfully')
          break

        case 'change_color':
          result = await executeChangeColor(canvasId, userId, toolCall.input as any)
          console.log('[Executor] change_color completed successfully', result)
          break

        case 'delete_elements':
          result = await executeDeleteElements(canvasId, userId, toolCall.input as any)
          console.log('[Executor] delete_elements completed successfully', result)
          break

        // PR 16: Layout Commands
        case 'arrange_elements':
          result = await executeArrangeElements(canvasId, userId, toolCall.input as any)
          console.log('[Executor] arrange_elements completed successfully', result)
          break

        case 'align_elements':
          result = await executeAlignElements(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] align_elements completed successfully', result)
          break

        // PR 17: Complex Commands
        case 'create_flowchart':
          await executeCreateFlowchart(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_flowchart completed successfully')
          break

        case 'create_ui_component':
          await executeCreateUIComponent(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_ui_component completed successfully')
          break

        case 'create_diagram':
          await executeCreateDiagram(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] create_diagram completed successfully')
          break

        case 'undo':
          result = await executeUndo(canvasId, userId)
          console.log('[Executor] undo completed successfully', result)
          break

        default:
          console.warn(`Unknown tool: ${toolCall.name}`)
      }

      results.push(result)
    } catch (error) {
      console.error(`Error executing tool '${toolCall.name}':`, error)
      throw error
    }
  }

  return results
}
