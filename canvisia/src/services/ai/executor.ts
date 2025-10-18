import type { AIToolCall } from '@/types/ai'
import { executeCreateShape, executeCreateText, executeCreateArrow } from '@/utils/aiHelpers'

/**
 * Execute AI tool calls sequentially
 * This is the main entry point for all AI command execution
 */
export async function executeToolCalls(
  toolCalls: AIToolCall[],
  canvasId: string
): Promise<void> {
  console.log('Executing tool calls:', toolCalls, 'for canvas:', canvasId)

  for (const toolCall of toolCalls) {
    try {
      switch (toolCall.name) {
        case 'create_shape':
          await executeCreateShape(canvasId, toolCall.input as any)
          break

        case 'create_text':
          await executeCreateText(canvasId, toolCall.input as any)
          break

        case 'create_arrow':
          await executeCreateArrow(canvasId, toolCall.input as any)
          break

        // TODO: Implement in PR 15 (Manipulation Commands)
        case 'move_element':
        case 'resize_element':
        case 'rotate_element':
          console.log(`Tool '${toolCall.name}' will be implemented in PR 15`)
          break

        // TODO: Implement in PR 16 (Layout Commands)
        case 'arrange_elements':
        case 'align_elements':
          console.log(`Tool '${toolCall.name}' will be implemented in PR 16`)
          break

        // TODO: Implement in PR 17 (Complex Commands)
        case 'create_flowchart':
        case 'create_ui_component':
        case 'create_diagram':
          console.log(`Tool '${toolCall.name}' will be implemented in PR 17`)
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
