import type { AIToolCall } from '@/types/ai'
import type { Viewport } from '@/types/canvas'
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
} from '@/utils/aiHelpers'

/**
 * Execute AI tool calls sequentially
 * This is the main entry point for all AI command execution
 */
export async function executeToolCalls(
  toolCalls: AIToolCall[],
  canvasId: string,
  userId: string,
  viewport: Viewport
): Promise<void> {
  console.log('Executing tool calls:', toolCalls, 'for canvas:', canvasId, 'userId:', userId, 'viewport:', viewport)

  for (const toolCall of toolCalls) {
    try {
      console.log(`[Executor] Executing tool: ${toolCall.name}`)

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
          await executeChangeColor(canvasId, userId, toolCall.input as any)
          console.log('[Executor] change_color completed successfully')
          break

        case 'delete_elements':
          await executeDeleteElements(canvasId, userId, toolCall.input as any)
          console.log('[Executor] delete_elements completed successfully')
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

        default:
          console.warn(`Unknown tool: ${toolCall.name}`)
      }
    } catch (error) {
      console.error(`Error executing tool '${toolCall.name}':`, error)
      throw error
    }
  }
}
