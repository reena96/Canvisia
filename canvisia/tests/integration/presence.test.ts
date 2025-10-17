import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePresence } from '@/hooks/usePresence'
import type { Presence } from '@/types/user'

// Mock presence data store
let mockPresenceData: Record<string, Presence> = {}
let mockConnections: Record<string, Record<string, any>> = {}
let presenceCallbacks: Array<(presence: Presence[]) => void> = []
let connectionCallbacks: Record<string, (snapshot: any) => void> = {}

// Helper to simulate Firebase connection changes
const simulateConnectionChange = (canvasId: string, userId: string) => {
  const key = `${canvasId}:${userId}`
  const callback = connectionCallbacks[key]
  if (callback) {
    const connections = mockConnections[key] || {}
    callback({
      val: () => connections,
    })
  }
}

// Helper to trigger presence updates
const triggerPresenceUpdate = () => {
  const activeUsers = Object.values(mockPresenceData).filter((p) => p.isActive)
  presenceCallbacks.forEach((cb) => cb(activeUsers))
}

// Mock the RTDB service
vi.mock('@/services/rtdb', () => ({
  addUserConnection: vi.fn(
    async (canvasId: string, userId: string, userName: string, color: string) => {
      // Generate a unique connection ID
      const connectionId = `conn_${Date.now()}_${Math.random()}`
      const key = `${canvasId}:${userId}`

      // Initialize connections for this user if not exists
      if (!mockConnections[key]) {
        mockConnections[key] = {}
      }

      // Add this connection
      mockConnections[key][connectionId] = {
        connectedAt: Date.now(),
        userName,
        color,
      }

      // Update presence to active
      mockPresenceData[userId] = {
        userId,
        userName,
        color,
        isActive: true,
        lastSeen: new Date().toISOString(),
      }

      // Trigger presence update
      triggerPresenceUpdate()

      // Return cleanup function and connectionId
      const cleanup = async () => {
        // Remove this connection
        if (mockConnections[key]) {
          delete mockConnections[key][connectionId]

          // If no connections remain, set inactive
          if (Object.keys(mockConnections[key]).length === 0) {
            if (mockPresenceData[userId]) {
              mockPresenceData[userId].isActive = false
            }
            delete mockConnections[key]
          }

          // Trigger presence update
          triggerPresenceUpdate()
        }
      }

      return { cleanup, connectionId }
    }
  ),

  monitorUserConnections: vi.fn((canvasId: string, userId: string) => {
    // Return a no-op unsubscribe function
    // The connection monitoring logic is tested via addUserConnection
    return () => {
      // No-op
    }
  }),

  subscribeToPresence: vi.fn((canvasId: string, callback: (presence: Presence[]) => void) => {
    // Store callback
    presenceCallbacks.push(callback)

    // Call immediately with current data
    const activeUsers = Object.values(mockPresenceData).filter((p) => p.isActive)
    callback(activeUsers)

    // Return unsubscribe function
    return () => {
      const index = presenceCallbacks.indexOf(callback)
      if (index > -1) {
        presenceCallbacks.splice(index, 1)
      }
    }
  }),

  removePresence: vi.fn(async (canvasId: string, userId: string) => {
    if (mockPresenceData[userId]) {
      mockPresenceData[userId].isActive = false
      mockPresenceData[userId].lastSeen = new Date().toISOString()
    }
    triggerPresenceUpdate()
  }),
}))

describe('Presence Integration - Multi-User & Multi-Window', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPresenceData = {}
    mockConnections = {}
    presenceCallbacks = []
    connectionCallbacks = {}
  })

  afterEach(() => {
    mockPresenceData = {}
    mockConnections = {}
    presenceCallbacks = []
    connectionCallbacks = {}
  })

  it('should add a connection and set user as active on mount', async () => {
    const { result } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(result.current.activeUsers.length).toBe(1)
    })

    expect(result.current.activeUsers[0]).toMatchObject({
      userId: 'user-1',
      userName: 'Alice',
      isActive: true,
      color: '#FF6B6B',
    })

    const { addUserConnection } = await import('@/services/rtdb')
    expect(addUserConnection).toHaveBeenCalledWith('canvas-1', 'user-1', 'Alice', '#FF6B6B')
  })

  it('should handle multiple users on different devices', async () => {
    // User 1 connects
    const { result: result1 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(result1.current.activeUsers.length).toBe(1)
    })

    // User 2 connects
    const { result: result2 } = renderHook(() =>
      usePresence('canvas-1', 'user-2', 'Bob', '#4ECDC4')
    )

    await waitFor(() => {
      expect(result2.current.activeUsers.length).toBe(2)
    })

    // Both users should see the same active users list
    expect(result1.current.activeUsers.length).toBe(2)
    expect(result2.current.activeUsers.length).toBe(2)

    const userIds = result1.current.activeUsers.map((u) => u.userId).sort()
    expect(userIds).toEqual(['user-1', 'user-2'])
  })

  it('should handle single user with multiple tabs/windows (one presence)', async () => {
    // User 1 opens first tab
    const { result: tab1 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(tab1.current.activeUsers.length).toBe(1)
    })

    // Same user opens second tab
    const { result: tab2 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      // Should still show only 1 user (not 2), because it's the same user
      expect(tab2.current.activeUsers.length).toBe(1)
    })

    expect(tab1.current.activeUsers.length).toBe(1)
    expect(tab1.current.activeUsers[0].userId).toBe('user-1')

    // Verify addUserConnection was called twice (once per tab)
    const { addUserConnection } = await import('@/services/rtdb')
    expect(addUserConnection).toHaveBeenCalledTimes(2)
  })

  it('should keep user active when closing one tab but other tabs remain', async () => {
    // User opens first tab
    const { result: tab1, unmount: unmountTab1 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(tab1.current.activeUsers.length).toBe(1)
    })

    // User opens second tab
    const { result: tab2 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(tab2.current.activeUsers.length).toBe(1)
    })

    // Close first tab
    await act(async () => {
      unmountTab1()
    })

    // User should still be active because second tab is open
    await waitFor(() => {
      expect(tab2.current.activeUsers.length).toBe(1)
      expect(tab2.current.activeUsers[0].isActive).toBe(true)
    })
  })

  it('should set user inactive when all tabs/windows are closed', async () => {
    // User opens first tab
    const { result: tab1, unmount: unmountTab1 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(tab1.current.activeUsers.length).toBe(1)
    })

    // User opens second tab
    const { result: tab2, unmount: unmountTab2 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(tab2.current.activeUsers.length).toBe(1)
    })

    // Another user for observing
    const { result: observer } = renderHook(() =>
      usePresence('canvas-1', 'user-2', 'Bob', '#4ECDC4')
    )

    await waitFor(() => {
      expect(observer.current.activeUsers.length).toBe(2)
    })

    // Close first tab
    await act(async () => {
      unmountTab1()
    })

    // Should still show 2 active users
    await waitFor(() => {
      expect(observer.current.activeUsers.length).toBe(2)
    })

    // Close second tab (last tab for user-1)
    await act(async () => {
      unmountTab2()
    })

    // Now user-1 should be inactive, so only user-2 should be active
    await waitFor(() => {
      expect(observer.current.activeUsers.length).toBe(1)
      expect(observer.current.activeUsers[0].userId).toBe('user-2')
    })
  })

  it('should handle user signing in on multiple devices simultaneously', async () => {
    // User 1 on desktop
    const { result: desktop } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(desktop.current.activeUsers.length).toBe(1)
    })

    // Same user on mobile
    const { result: mobile } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      // Should still show only 1 unique user
      expect(mobile.current.activeUsers.length).toBe(1)
    })

    expect(desktop.current.activeUsers.length).toBe(1)
    expect(desktop.current.activeUsers[0].userId).toBe('user-1')
  })

  it('should properly cleanup on manual sign out', async () => {
    const { result, unmount } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    await waitFor(() => {
      expect(result.current.activeUsers.length).toBe(1)
    })

    // Call manual cleanup (simulates sign out)
    await act(async () => {
      await result.current.cleanup()
    })

    // Verify removePresence was called
    const { removePresence } = await import('@/services/rtdb')
    expect(removePresence).toHaveBeenCalledWith('canvas-1', 'user-1')

    // Unmount to trigger cleanup
    unmount()
  })

  it('should expose activeUsers array and cleanup function', () => {
    const { result } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    expect(result.current.activeUsers).toBeDefined()
    expect(Array.isArray(result.current.activeUsers)).toBe(true)
    expect(result.current.cleanup).toBeDefined()
    expect(typeof result.current.cleanup).toBe('function')
  })

  it('should update presence count correctly with complex multi-user multi-tab scenario', async () => {
    // User 1 opens 2 tabs
    const { result: u1tab1 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )
    const { result: u1tab2 } = renderHook(() =>
      usePresence('canvas-1', 'user-1', 'Alice', '#FF6B6B')
    )

    // User 2 opens 1 tab
    const { result: u2tab1, unmount: unmountU2 } = renderHook(() =>
      usePresence('canvas-1', 'user-2', 'Bob', '#4ECDC4')
    )

    // User 3 opens 3 tabs
    const { result: u3tab1 } = renderHook(() =>
      usePresence('canvas-1', 'user-3', 'Charlie', '#95E1D3')
    )
    const { result: u3tab2 } = renderHook(() =>
      usePresence('canvas-1', 'user-3', 'Charlie', '#95E1D3')
    )
    const { result: u3tab3, unmount: unmountU3Tab3 } = renderHook(() =>
      usePresence('canvas-1', 'user-3', 'Charlie', '#95E1D3')
    )

    // Should show 3 unique users
    await waitFor(() => {
      expect(u1tab1.current.activeUsers.length).toBe(3)
    })

    // Close one tab of user 3 - should still show 3 users
    await act(async () => {
      unmountU3Tab3()
    })

    await waitFor(() => {
      expect(u1tab1.current.activeUsers.length).toBe(3)
    })

    // User 2 signs out completely - should show 2 users
    await act(async () => {
      unmountU2()
    })

    await waitFor(() => {
      expect(u1tab1.current.activeUsers.length).toBe(2)
    })

    const activeUserIds = u1tab1.current.activeUsers.map((u) => u.userId).sort()
    expect(activeUserIds).toEqual(['user-1', 'user-3'])
  })
})
