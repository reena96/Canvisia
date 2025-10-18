import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { acquireAILock, releaseAILock, onAILockChange } from '@/services/ai/lock'
import { sendMessage } from '@/services/ai/client'
import { AI_TOOLS, SYSTEM_PROMPT } from '@/services/ai/tools'
// import { buildContext } from '@/services/ai/context'
import { executeToolCalls } from '@/services/ai/executor'
// import { useFirestore } from '@/hooks/useFirestore'

export function useAI(canvasId: string, onMessage?: (userMsg: string, aiResponse: string) => void) {
  const { user } = useAuth()
  // const { shapes} = useFirestore(canvasId)
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
      // Build context (will be used in future PRs for context-aware commands)
      // const context = buildContext(shapes)

      // Call Claude
      const response = await sendMessage(command, AI_TOOLS, SYSTEM_PROMPT)

      if (response.error) {
        onMessage?.(command, `❌ AI Error: ${response.error}`)
        return
      }

      // Execute tool calls
      if (response.tool_calls && response.tool_calls.length > 0) {
        await executeToolCalls(response.tool_calls, canvasId)
        const aiResponse = `✅ Created ${response.tool_calls.length} element(s)`
        onMessage?.(command, aiResponse)
      } else {
        const aiResponse = response.content || 'No actions taken'
        onMessage?.(command, aiResponse)
      }

    } catch (error) {
      console.error('AI command error:', error)
      onMessage?.(command, '❌ Failed to execute command')
    } finally {
      setIsProcessing(false)
      await releaseAILock(canvasId)
    }
  }

  return { sendCommand, isProcessing, isLocked, lockOwner }
}
