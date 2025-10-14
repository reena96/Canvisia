import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCursors } from '@/hooks/useCursors'
import * as rtdb from '@/services/rtdb'
import type { CursorPosition } from '@/types/user'

// Mock the RTDB service
vi.mock('@/services/rtdb', () => ({
  updateCursorPosition: vi.fn(),
  subscribeToCursors: vi.fn(),
  setupCursorCleanup: vi.fn(),
  removeCursor: vi.fn(),
}))

describe('useCursors', () => {
  const mockCanvasId = 'canvas-123'
  const mockUserId = 'user-456'
  const mockUserName = 'Test User'
  const mockUserColor = '#ff0000'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with empty cursors map', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(rtdb.subscribeToCursors).mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    expect(result.current.cursors).toEqual({})
  })

  it('should setup cursor cleanup on mount', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(rtdb.subscribeToCursors).mockReturnValue(mockUnsubscribe)

    renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    expect(rtdb.setupCursorCleanup).toHaveBeenCalledWith(mockCanvasId, mockUserId)
  })

  it('should subscribe to cursors on mount', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(rtdb.subscribeToCursors).mockReturnValue(mockUnsubscribe)

    renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    expect(rtdb.subscribeToCursors).toHaveBeenCalledWith(
      mockCanvasId,
      expect.any(Function)
    )
  })

  it('should update cursor position when updateCursor is called', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(rtdb.subscribeToCursors).mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    act(() => {
      result.current.updateCursor(100, 200)
    })

    // Should call immediately on first call
    expect(rtdb.updateCursorPosition).toHaveBeenCalledWith(
      mockCanvasId,
      mockUserId,
      expect.objectContaining({
        x: 100,
        y: 200,
        userId: mockUserId,
        userName: mockUserName,
        color: mockUserColor,
      })
    )
  })

  it('should throttle cursor updates', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(rtdb.subscribeToCursors).mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    // Call updateCursor multiple times rapidly
    act(() => {
      result.current.updateCursor(10, 20)
      result.current.updateCursor(30, 40)
      result.current.updateCursor(50, 60)
    })

    // Should only call updateCursorPosition once immediately
    expect(rtdb.updateCursorPosition).toHaveBeenCalledTimes(1)

    // Wait for throttle period
    act(() => {
      vi.advanceTimersByTime(60)
    })

    // Should call again with latest position
    expect(rtdb.updateCursorPosition).toHaveBeenCalledTimes(2)
    expect(rtdb.updateCursorPosition).toHaveBeenLastCalledWith(
      mockCanvasId,
      mockUserId,
      expect.objectContaining({
        x: 50,
        y: 60,
      })
    )
  })

  it('should filter out own cursor from cursors map', () => {
    let subscribedCallback: ((cursors: Record<string, CursorPosition>) => void) | null = null
    const mockUnsubscribe = vi.fn()

    vi.mocked(rtdb.subscribeToCursors).mockImplementation((canvasId, callback) => {
      subscribedCallback = callback
      return mockUnsubscribe
    })

    const { result } = renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    // Simulate receiving cursors including own cursor
    const allCursors: Record<string, CursorPosition> = {
      [mockUserId]: {
        x: 100,
        y: 200,
        userId: mockUserId,
        userName: mockUserName,
        color: mockUserColor,
        timestamp: Date.now(),
      },
      'other-user-1': {
        x: 300,
        y: 400,
        userId: 'other-user-1',
        userName: 'Other User',
        color: '#00ff00',
        timestamp: Date.now(),
      },
    }

    act(() => {
      subscribedCallback?.(allCursors)
    })

    // Should only contain other user's cursor
    expect(result.current.cursors).toEqual({
      'other-user-1': allCursors['other-user-1'],
    })
    expect(result.current.cursors[mockUserId]).toBeUndefined()
  })

  it('should cleanup on unmount', () => {
    const mockUnsubscribe = vi.fn()
    vi.mocked(rtdb.subscribeToCursors).mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    expect(rtdb.removeCursor).toHaveBeenCalledWith(mockCanvasId, mockUserId)
  })

  it('should update cursors map when new cursors arrive', () => {
    let subscribedCallback: ((cursors: Record<string, CursorPosition>) => void) | null = null
    const mockUnsubscribe = vi.fn()

    vi.mocked(rtdb.subscribeToCursors).mockImplementation((canvasId, callback) => {
      subscribedCallback = callback
      return mockUnsubscribe
    })

    const { result } = renderHook(() =>
      useCursors(mockCanvasId, mockUserId, mockUserName, mockUserColor)
    )

    const cursor1: CursorPosition = {
      x: 100,
      y: 200,
      userId: 'user-1',
      userName: 'User 1',
      color: '#ff0000',
      timestamp: Date.now(),
    }

    const cursor2: CursorPosition = {
      x: 300,
      y: 400,
      userId: 'user-2',
      userName: 'User 2',
      color: '#00ff00',
      timestamp: Date.now(),
    }

    // Simulate receiving first cursor
    act(() => {
      subscribedCallback?.({ 'user-1': cursor1 })
    })

    expect(result.current.cursors).toEqual({ 'user-1': cursor1 })

    // Simulate receiving second cursor
    act(() => {
      subscribedCallback?.({ 'user-1': cursor1, 'user-2': cursor2 })
    })

    expect(result.current.cursors).toEqual({
      'user-1': cursor1,
      'user-2': cursor2,
    })
  })
})
