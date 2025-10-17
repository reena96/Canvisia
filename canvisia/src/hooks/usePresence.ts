import { useState, useEffect, useCallback, useRef } from 'react'
import {
  addUserConnection,
  subscribeToPresence,
  removePresence,
  monitorUserConnections,
} from '@/services/rtdb'
import type { Presence } from '@/types/user'

/**
 * Hook for managing user presence in a canvas
 * Uses connection-based tracking for multi-tab/multi-device support
 * One presence entry per user, but tracks individual connections
 *
 * User is "active" as long as ANY tab/window/device has a connection.
 * When all connections close, isActive automatically becomes false.
 *
 * @param canvasId - Canvas ID
 * @param userId - Current user ID
 * @param userName - Current user name
 * @param userColor - Current user color
 * @returns Object with activeUsers array and cleanup function
 */
export function usePresence(
  canvasId: string,
  userId: string,
  userName: string,
  userColor: string
) {
  const [activeUsers, setActiveUsers] = useState<Presence[]>([])
  const setupDone = useRef(false)
  const lastUserId = useRef<string>('')
  const isMounted = useRef(false)
  const connectionCleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Reset setupDone if userId changed (new user logged in) OR if we were previously unmounted
    if (userId && (userId !== lastUserId.current || !isMounted.current)) {
      setupDone.current = false
      lastUserId.current = userId
    }

    isMounted.current = true

    if (!canvasId || !userId || setupDone.current) {
      return
    }

    console.log('🟢 usePresence effect running - adding connection')
    setupDone.current = true

    // Setup ONE connection monitor per user (not per tab)
    const unsubscribeMonitor = monitorUserConnections(canvasId, userId)

    // Add a connection for this tab/window
    addUserConnection(canvasId, userId, userName, userColor)
      .then(({ cleanup, connectionId }) => {
        console.log(`✅ Connection ${connectionId} added, cleanup function stored`)
        connectionCleanup.current = cleanup
      })
      .catch((error) => {
        console.error('❌ Failed to add user connection:', error)
      })

    // Subscribe to presence updates
    const unsubscribePresence = subscribeToPresence(canvasId, (presenceList) => {
      console.log('📥 Received presence update, count:', presenceList.length)
      setActiveUsers(presenceList)
    })

    // Handle browser window/tab close
    const handleBeforeUnload = () => {
      console.log('🚪 Window closing, removing connection')
      // Synchronously remove connection before window closes
      if (connectionCleanup.current) {
        connectionCleanup.current()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup: unsubscribe from presence and remove connection
    return () => {
      console.log('🧹 usePresence cleanup running')
      window.removeEventListener('beforeunload', handleBeforeUnload)
      unsubscribeMonitor()
      unsubscribePresence()
      if (connectionCleanup.current) {
        connectionCleanup.current()
        connectionCleanup.current = null
      }
      isMounted.current = false
      // This allows re-setup when component re-mounts (e.g., React Strict Mode)
    }
  // Only re-run when canvasId or userId changes, not when userName/userColor changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, userId])

  // Return cleanup function that can be called before sign out
  const cleanup = useCallback(async () => {
    console.log('🔴 Manual presence cleanup before sign out')
    if (canvasId && userId) {
      // Call the connection cleanup if it exists
      if (connectionCleanup.current) {
        connectionCleanup.current()
        connectionCleanup.current = null
      }
      // Also explicitly set presence to inactive
      await removePresence(canvasId, userId)
    }
  }, [canvasId, userId])

  return {
    activeUsers,
    cleanup,
  }
}
