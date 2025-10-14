import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePresence } from '@/hooks/usePresence'

// Mock the RTDB service
vi.mock('@/services/rtdb', () => ({
  setUserPresence: vi.fn().mockResolvedValue(undefined),
  setupPresenceCleanup: vi.fn().mockResolvedValue(undefined),
  removePresence: vi.fn().mockResolvedValue(undefined),
  subscribeToPresence: vi.fn((canvasId, callback) => {
    // Call callback immediately with test data
    callback([
      {
        userId: 'user-1',
        userName: 'Test User',
        isActive: true,
        lastSeen: new Date().toISOString(),
        color: '#FF6B6B',
      },
    ])
    // Return unsubscribe function
    return vi.fn()
  }),
}))

describe('Presence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set user as active on mount and setup cleanup', async () => {
    const { result } = renderHook(() =>
      usePresence('test-canvas-id', 'test-user-id', 'Test User', '#FF6B6B')
    )

    await waitFor(() => {
      expect(result.current.activeUsers).toBeDefined()
    })

    // Verify setUserPresence was called
    const { setUserPresence, setupPresenceCleanup } = await import('@/services/rtdb')
    expect(setUserPresence).toHaveBeenCalledWith(
      'test-canvas-id',
      'test-user-id',
      'Test User',
      '#FF6B6B',
      true
    )

    // Verify onDisconnect cleanup was setup
    expect(setupPresenceCleanup).toHaveBeenCalledWith('test-canvas-id', 'test-user-id')
  })

  it('should return list of active users', async () => {
    const { result } = renderHook(() =>
      usePresence('test-canvas-id', 'test-user-id', 'Test User', '#FF6B6B')
    )

    await waitFor(() => {
      expect(result.current.activeUsers.length).toBeGreaterThan(0)
    })

    expect(result.current.activeUsers).toContainEqual(
      expect.objectContaining({
        userId: 'user-1',
        userName: 'Test User',
        isActive: true,
      })
    )
  })

  it('should expose activeUsers array', () => {
    const { result } = renderHook(() =>
      usePresence('test-canvas-id', 'test-user-id', 'Test User', '#FF6B6B')
    )

    expect(result.current.activeUsers).toBeDefined()
    expect(Array.isArray(result.current.activeUsers)).toBe(true)
  })
})
