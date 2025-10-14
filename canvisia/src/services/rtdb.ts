import { rtdb } from './firebase'
import {
  ref,
  set,
  onValue,
  onDisconnect,
  remove,
  type DataSnapshot,
} from 'firebase/database'
import type { CursorPosition } from '@/types/user'

export { rtdb }

/**
 * Update cursor position in Firebase RTDB
 * Path: cursors/{canvasId}/{userId}
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 * @param cursor - Cursor position data
 */
export async function updateCursorPosition(
  canvasId: string,
  userId: string,
  cursor: CursorPosition
): Promise<void> {
  const cursorRef = ref(rtdb, `cursors/${canvasId}/${userId}`)
  await set(cursorRef, cursor)
}

/**
 * Listen to all cursors on a canvas
 * Path: cursors/{canvasId}
 *
 * @param canvasId - ID of the canvas
 * @param callback - Called when cursors update
 * @returns Unsubscribe function
 */
export function subscribeToCursors(
  canvasId: string,
  callback: (cursors: Record<string, CursorPosition>) => void
): () => void {
  const cursorsRef = ref(rtdb, `cursors/${canvasId}`)

  const handleValue = (snapshot: DataSnapshot) => {
    const cursors = snapshot.val() || {}
    callback(cursors)
  }

  const handleError = (error: Error) => {
    console.error('RTDB subscription error:', error)
  }

  // onValue returns an unsubscribe function in v9+ modular SDK
  const unsubscribe = onValue(cursorsRef, handleValue, handleError)

  // Return the unsubscribe function directly
  return unsubscribe
}

/**
 * Remove cursor on disconnect
 * Sets up automatic cleanup when user disconnects
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 */
export async function setupCursorCleanup(
  canvasId: string,
  userId: string
): Promise<void> {
  const cursorRef = ref(rtdb, `cursors/${canvasId}/${userId}`)
  await onDisconnect(cursorRef).remove()
}

/**
 * Manually remove a cursor
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 */
export async function removeCursor(
  canvasId: string,
  userId: string
): Promise<void> {
  const cursorRef = ref(rtdb, `cursors/${canvasId}/${userId}`)
  await remove(cursorRef)
}
