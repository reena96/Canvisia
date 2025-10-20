import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { acquireAILock, releaseAILock, onAILockChange } from '@/services/ai/lock'
import { sendMessage } from '@/services/ai/client'
import { AI_TOOLS, SYSTEM_PROMPT } from '@/services/ai/tools'
import { buildContext } from '@/services/ai/context'
import { executeToolCalls } from '@/services/ai/executor'
import { useFirestore } from '@/hooks/useFirestore'
import { useCanvasStore } from '@/stores/canvasStore'

// Helper function to generate descriptive responses based on tool calls
function generateToolCallResponse(toolCalls: any[]): string {
  if (toolCalls.length === 0) return 'Done!'

  const descriptions: string[] = []

  for (const call of toolCalls) {
    const input = call.input || {}

    switch (call.name) {
      case 'create_shape':
        const shapeType = input.shapeType || 'shape'
        const color = input.color ? ` in ${input.color}` : ''
        descriptions.push(`Created a ${shapeType}${color}`)
        break

      case 'create_multiple_shapes':
        const count = input.count || 0
        const multiShapeType = input.shapeType || 'shapes'
        const multiColor = input.color ? ` in ${input.color}` : ''
        const multiPattern = input.pattern || 'grid'
        descriptions.push(`Created ${count} ${multiShapeType}s${multiColor} in a ${multiPattern}`)
        break

      case 'create_text':
        const text = input.text ? `"${input.text}"` : 'text'
        descriptions.push(`Added ${text}`)
        break

      case 'create_arrow':
        const arrowType = input.arrowType === 'bidirectionalArrow' ? 'bidirectional arrow' : 'arrow'
        descriptions.push(`Drew a ${arrowType}`)
        break

      case 'create_flowchart':
        const nodeCount = input.nodes?.length || 0
        descriptions.push(`Created a flowchart with ${nodeCount} nodes`)
        break

      case 'create_ui_component':
        const componentType = input.componentType || 'component'
        descriptions.push(`Created a ${componentType}`)
        break

      case 'create_diagram':
        const diagramType = input.diagramType || 'diagram'
        descriptions.push(`Created a ${diagramType} diagram`)
        break

      case 'move_element':
        descriptions.push('Moved element')
        break

      case 'resize_element':
        descriptions.push('Resized element')
        break

      case 'rotate_element':
        descriptions.push('Rotated element')
        break

      case 'change_color':
        const newColor = input.newColor || 'new color'
        descriptions.push(`Changed color to ${newColor}`)
        break

      case 'delete_elements':
        descriptions.push('Deleted elements')
        break

      case 'arrange_elements':
        const pattern = input.pattern || 'pattern'
        descriptions.push(`Arranged elements in a ${pattern}`)
        break

      case 'align_elements':
        const alignment = input.alignment || ''
        descriptions.push(`Aligned elements ${alignment}`)
        break

      default:
        descriptions.push('Completed action')
    }
  }

  if (descriptions.length === 1) {
    return `✅ ${descriptions[0]}!`
  } else if (descriptions.length === 2) {
    return `✅ ${descriptions[0]} and ${descriptions[1].toLowerCase()}!`
  } else {
    const last = descriptions.pop()
    return `✅ ${descriptions.join(', ')}, and ${last?.toLowerCase()}!`
  }
}

export function useAI(canvasId: string, onMessage?: (userMsg: string, aiResponse: string) => void) {
  const { user } = useAuth()
  const { shapes } = useFirestore(canvasId)
  const viewport = useCanvasStore((state) => state.viewport)
  const selectedIds = useCanvasStore((state) => state.selectedIds)
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
      // Just notify via chat callback, no toast
      onMessage?.(command, `⚠️ AI is busy with ${lockOwner || 'another user'}'s command. Please wait...`)
      return
    }

    setIsProcessing(true)

    try {
      // Build context with current shapes and selection state
      const context = buildContext(shapes, selectedIds)

      // Call Claude with context
      const response = await sendMessage(command, AI_TOOLS, SYSTEM_PROMPT, context)

      if (response.error) {
        onMessage?.(command, `❌ AI Error: ${response.error}`)
        return
      }

      // Execute tool calls
      if (response.tool_calls && response.tool_calls.length > 0) {
        await executeToolCalls(response.tool_calls, canvasId, user.uid, viewport)
        const aiResponse = generateToolCallResponse(response.tool_calls)
        onMessage?.(command, aiResponse)
      } else {
        const aiResponse = response.content || 'No actions taken'
        onMessage?.(command, aiResponse)
      }

    } catch (error) {
      console.error('AI command error:', error)
      // Pass through the helpful error message if available
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute command'
      onMessage?.(command, `❌ ${errorMessage}`)
    } finally {
      setIsProcessing(false)
      await releaseAILock(canvasId)
    }
  }

  return { sendCommand, isProcessing, isLocked, lockOwner }
}
