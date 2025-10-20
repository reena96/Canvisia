import { rtdb } from '@/services/firebase'
import { ref, set, get, remove, onValue } from 'firebase/database'
import type { AILock } from '@/types/ai'

const AI_LOCK_TIMEOUT = 10000 // 10 seconds

export async function acquireAILock(
  canvasId: string,
  userId: string,
  userName: string,
  command: string
): Promise<boolean> {
  console.log('🔒 [acquireAILock] Called with:', { canvasId, userId, userName, command })
  const lockPath = `canvases/${canvasId}/aiLock`
  console.log('🔒 [acquireAILock] Lock path:', lockPath)
  const lockRef = ref(rtdb, lockPath)

  try {
    const snapshot = await get(lockRef)

    if (snapshot.exists()) {
      const lock: AILock = snapshot.val()
      const age = Date.now() - lock.timestamp

      // Allow same user to re-acquire lock
      if (lock.userId === userId) {
        await set(lockRef, {
          userId,
          userName,
          timestamp: Date.now(),
          command
        })
        return true
      }

      // Break stale lock from other user
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
    console.error('❌ [acquireAILock] Error acquiring AI lock:', error)
    if (error instanceof Error) {
      console.error('❌ [acquireAILock] Error message:', error.message)
      console.error('❌ [acquireAILock] Error stack:', error.stack)
    }
    // Re-throw to see the actual error
    throw error
  }
}

export async function releaseAILock(canvasId: string): Promise<void> {
  const lockRef = ref(rtdb, `canvases/${canvasId}/aiLock`)
  await remove(lockRef)
}

export function onAILockChange(
  canvasId: string,
  callback: (lock: AILock | null) => void
): () => void {
  const lockRef = ref(rtdb, `canvases/${canvasId}/aiLock`)

  const unsubscribe = onValue(lockRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as AILock)
    } else {
      callback(null)
    }
  })

  return unsubscribe
}
