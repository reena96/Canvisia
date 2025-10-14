import { useState, useEffect } from 'react'
import {
  setUserPresence,
  subscribeToPresence,
  setupPresenceCleanup,
  removePresence,
} from '@/services/rtdb'
import type { Presence } from '@/types/user'

/**
 * Hook for managing user presence in a canvas
 * Uses RTDB for real-time presence with automatic onDisconnect cleanup
 *
 * @param canvasId - Canvas ID
 * @param userId - Current user ID
 * @param userName - Current user name
 * @param userColor - Current user color
 * @returns Object with activeUsers array
 */
export function usePresence(
  canvasId: string,
  userId: string,
  userName: string,
  userColor: string
) {
  const [activeUsers, setActiveUsers] = useState<Presence[]>([])

  useEffect(() => {
    if (!canvasId || !userId) {
      return
    }

    // Set current user as active
    setUserPresence(canvasId, userId, userName, userColor, true).catch((error) => {
      console.error('Failed to set user presence:', error)
    })

    // Setup automatic cleanup on disconnect
    setupPresenceCleanup(canvasId, userId).catch((error) => {
      console.error('Failed to setup presence cleanup:', error)
    })

    // Subscribe to presence updates
    const unsubscribe = subscribeToPresence(canvasId, (presenceList) => {
      setActiveUsers(presenceList)
    })

    // Cleanup: remove presence on unmount
    return () => {
      unsubscribe()
      removePresence(canvasId, userId).catch((error) => {
        console.debug('Manual presence cleanup failed (onDisconnect will handle it):', error)
      })
    }
  }, [canvasId, userId, userName, userColor])

  return {
    activeUsers,
  }
}
