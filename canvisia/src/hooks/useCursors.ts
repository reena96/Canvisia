import { useState, useEffect, useCallback, useRef } from 'react'
import {
  updateCursorPosition,
  subscribeToCursors,
  setupCursorCleanup,
  removeCursor,
} from '@/services/rtdb'
import { throttle } from '@/utils/throttle'
import type { CursorPosition } from '@/types/user'

const CURSOR_UPDATE_THROTTLE = 50 // 20 updates per second

export function useCursors(
  canvasId: string,
  userId: string,
  userName: string,
  color: string
) {
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({})
  const throttledUpdateRef = useRef<((x: number, y: number) => void) | undefined>(undefined)

  // Create throttled update function
  useEffect(() => {
    const updatePosition = async (x: number, y: number) => {
      const cursor: CursorPosition = {
        x,
        y,
        userId,
        userName,
        color,
        timestamp: Date.now(),
      }
      await updateCursorPosition(canvasId, userId, cursor)
    }

    throttledUpdateRef.current = throttle(updatePosition, CURSOR_UPDATE_THROTTLE)
  }, [canvasId, userId, userName, color])

  // Subscribe to cursor updates and setup cleanup
  useEffect(() => {
    // Setup automatic cleanup on disconnect
    void setupCursorCleanup(canvasId, userId)

    // Subscribe to all cursors
    const unsubscribe = subscribeToCursors(canvasId, (allCursors) => {
      // Filter out own cursor
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [userId]: _ownCursor, ...otherCursors } = allCursors
      setCursors(otherCursors)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      removeCursor(canvasId, userId)
    }
  }, [canvasId, userId])

  // Public API to update cursor position
  const updateCursor = useCallback(
    (x: number, y: number) => {
      throttledUpdateRef.current?.(x, y)
    },
    []
  )

  return {
    cursors,
    updateCursor,
  }
}
