import { useState, useEffect, useCallback, useRef } from 'react'
import {
  addUserConnection,
  subscribeToPresence,
  monitorUserConnections,
} from '@/services/rtdb'
import type { Presence } from '@/types/user'

/**
 * Hook for managing user presence in a project
 * Uses connection-based tracking for multi-tab/multi-device support
 * One presence entry per user, but tracks individual connections
 *
 * User is "active" as long as ANY tab/window/device has a connection.
 * When all connections close, isActive automatically becomes false.
 *
 * @param projectId - Project ID
 * @param userId - Current user ID
 * @param userName - Current user name
 * @param userColor - Current user color
 * @returns Object with activeUsers array and cleanup function
 */
export function usePresence(
  projectId: string,
  userId: string,
  userName: string,
  userColor: string
) {
  const [activeUsers, setActiveUsers] = useState<Presence[]>([])
  const setupDone = useRef(false)
  const lastUserId = useRef<string>('')
  const isMounted = useRef(false)
  const connectionCleanup = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    console.log('[usePresence] Effect triggered', { projectId, userId, setupDone: setupDone.current, isMounted: isMounted.current })

    // Reset setupDone if userId changed (new user logged in) OR if we were previously unmounted
    if (userId && (userId !== lastUserId.current || !isMounted.current)) {
      console.log('[usePresence] Resetting setupDone', {
        reason: userId !== lastUserId.current ? 'userId changed' : 'was unmounted',
        oldUserId: lastUserId.current,
        newUserId: userId
      })
      setupDone.current = false
      lastUserId.current = userId
    }

    isMounted.current = true

    if (!projectId || !userId || setupDone.current) {
      console.log('[usePresence] Skipping setup', { projectId, userId, setupDone: setupDone.current })
      return
    }

    console.log('🟢 [usePresence] Setting up presence for project', { projectId, userId, userName })
    setupDone.current = true

    // Setup ONE connection monitor per user (not per tab)
    const unsubscribeMonitor = monitorUserConnections(projectId, userId)

    // Add a connection for this tab/window
    addUserConnection(projectId, userId, userName, userColor)
      .then(({ cleanup, connectionId }) => {
        console.log(`✅ Connection ${connectionId} added, cleanup function stored`)
        connectionCleanup.current = cleanup
      })
      .catch((error) => {
        console.error('❌ Failed to add user connection:', error)
      })

    // Subscribe to presence updates
    const unsubscribePresence = subscribeToPresence(projectId, (presenceList) => {
      console.log('📥 Received presence update, count:', presenceList.length)
      setActiveUsers(presenceList)
    })

    // Handle page visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📴 [Visibility] Tab hidden/backgrounded')
      } else {
        console.log('📱 [Visibility] Tab visible/foregrounded')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Handle beforeunload for INSTANT cleanup (with onDisconnect as fallback)
    const handleBeforeUnload = () => {
      console.log('🚪 [beforeunload] Window closing - immediate cleanup')
      // Try immediate synchronous cleanup
      // onDisconnect handlers will still fire as a backup if this fails
      if (connectionCleanup.current) {
        // Call cleanup but don't await - must be synchronous
        connectionCleanup.current().catch(err => {
          console.log('⚠️ [beforeunload] Immediate cleanup failed (expected) - onDisconnect will handle it:', err)
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup: unsubscribe from presence and remove connection
    return () => {
      console.log('🧹 [usePresence] Cleanup running (component unmounting)', { projectId, userId })

      // Remove event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      console.log('[usePresence] Unsubscribing monitor')
      unsubscribeMonitor()

      console.log('[usePresence] Unsubscribing from presence updates')
      unsubscribePresence()

      // IMMEDIATE cleanup when component unmounts (navigation, sign out, etc.)
      if (connectionCleanup.current) {
        console.log('[usePresence] Removing connection immediately')
        connectionCleanup.current()
          .then(() => console.log('✅ [usePresence] Connection removed successfully'))
          .catch(err => {
            console.log('⚠️ [usePresence] Immediate cleanup failed - onDisconnect will handle it:', err)
          })
        connectionCleanup.current = null
      } else {
        console.log('[usePresence] No connection cleanup to run')
      }

      isMounted.current = false
      console.log('[usePresence] Cleanup complete', { projectId, userId })
    }
  // Only re-run when projectId or userId changes, not when userName/userColor changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, userId])

  // Return cleanup function that can be called before sign out
  const cleanup = useCallback(async () => {
    console.log('🔴 [usePresence] Manual presence cleanup called (e.g., before sign out)')
    if (connectionCleanup.current) {
      try {
        await connectionCleanup.current()
        console.log('✅ [usePresence] Manual cleanup completed successfully')
      } catch (error) {
        console.log('⚠️ [usePresence] Manual cleanup failed - onDisconnect will handle it:', error)
      }
    } else {
      console.log('[usePresence] No connection to clean up')
    }
  }, [])

  return {
    activeUsers,
    cleanup,
  }
}
