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
  // executeChangeColor, // TODO: Implement
  // executeDeleteElements, // TODO: Implement
  executeArrangeElements,
  executeAlignElements,
  // executeCreateUIComponent, // TODO: Implement
  // executeCreateFlowchart, // TODO: Implement
  // executeCreateDiagram, // TODO: Implement
  // executeUndo, // TODO: Implement
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
  error?: string
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
          // TODO: Implement executeChangeColor
          console.warn('[Executor] change_color not yet implemented')
          result = { success: false, error: 'Not implemented' }
          break

        case 'delete_elements':
          // TODO: Implement executeDeleteElements
          console.warn('[Executor] delete_elements not yet implemented')
          result = { success: false, error: 'Not implemented' }
          break

        // PR 16: Layout Commands
        case 'arrange_elements':
          await executeArrangeElements(canvasId, userId, toolCall.input as any)
          console.log('[Executor] arrange_elements completed successfully')
          break

        case 'align_elements':
          await executeAlignElements(canvasId, userId, toolCall.input as any, viewport)
          console.log('[Executor] align_elements completed successfully')
          break

        // PR 17: Complex Commands
        case 'create_flowchart':
          // TODO: Implement executeCreateFlowchart
          console.warn('[Executor] create_flowchart not yet implemented')
          result = { success: false, error: 'Not implemented' }
          break

        case 'create_ui_component':
          // TODO: Implement executeCreateUIComponent
          console.warn('[Executor] create_ui_component not yet implemented')
          result = { success: false, error: 'Not implemented' }
          break

        case 'create_diagram':
          // TODO: Implement executeCreateDiagram
          console.warn('[Executor] create_diagram not yet implemented')
          result = { success: false, error: 'Not implemented' }
          break

        case 'undo':
          // TODO: Implement executeUndo
          console.warn('[Executor] undo not yet implemented')
          result = { success: false, error: 'Not implemented' }
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
