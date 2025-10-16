import { rtdb } from './firebase'
import {
  ref,
  set,
  onValue,
  onDisconnect,
  remove,
  type DataSnapshot,
  serverTimestamp,
} from 'firebase/database'
import type { CursorPosition, Presence } from '@/types/user'

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

/**
 * Set user presence in Firebase RTDB
 * Path: presence/{canvasId}/{userId}
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 * @param userName - User's display name
 * @param color - User's color
 * @param isActive - Whether user is active
 */
export async function setUserPresence(
  canvasId: string,
  userId: string,
  userName: string,
  color: string,
  isActive: boolean
): Promise<void> {
  console.log('🟢 setUserPresence called:', { canvasId, userId, userName, isActive })
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`)
  const presenceData = {
    userId,
    userName,
    color,
    isActive,
    lastSeen: serverTimestamp(),
  }
  await set(presenceRef, presenceData)
  console.log('✅ Presence set successfully')
}

/**
 * Setup automatic presence cleanup on disconnect
 * Sets isActive to false when user disconnects
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 */
export async function setupPresenceCleanup(
  canvasId: string,
  userId: string
): Promise<void> {
  console.log('🟡 setupPresenceCleanup called:', { canvasId, userId })
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`)
  // Set isActive to false on disconnect (ORIGINAL WORKING VERSION)
  await onDisconnect(presenceRef).update({
    isActive: false,
    lastSeen: serverTimestamp(),
  })
  console.log('✅ onDisconnect().update({ isActive: false }) handler set up')
}

/**
 * Subscribe to presence updates on a canvas
 * Path: presence/{canvasId}
 *
 * @param canvasId - ID of the canvas
 * @param callback - Called when presence updates
 * @returns Unsubscribe function
 */
export function subscribeToPresence(
  canvasId: string,
  callback: (presence: Presence[]) => void
): () => void {
  const presenceRef = ref(rtdb, `presence/${canvasId}`)

  const handleValue = (snapshot: DataSnapshot) => {
    const presenceData = snapshot.val() || {}
    const presenceList: Presence[] = Object.values(presenceData).map((data: any) => ({
      userId: data.userId,
      userName: data.userName,
      color: data.color,
      isActive: data.isActive,
      lastSeen: data.lastSeen,
    }))
    callback(presenceList)
  }

  const handleError = (error: Error) => {
    console.error('Presence subscription error:', error)
  }

  const unsubscribe = onValue(presenceRef, handleValue, handleError)
  return unsubscribe
}

/**
 * Manually remove user presence
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 */
export async function removePresence(
  canvasId: string,
  userId: string
): Promise<void> {
  console.log('🔴 removePresence called:', { canvasId, userId })
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`)
  try {
    await remove(presenceRef)
    console.log('✅ Presence removed successfully:', { canvasId, userId })
  } catch (error) {
    console.error('❌ Failed to remove presence:', error)
    throw error
  }
}

/**
 * Remove all presence entries for a user across all canvases
 * This is useful for cleanup when signing out
 *
 * @param userId - ID of the user
 */
export async function removeAllUserPresence(userId: string): Promise<void> {
  // We need to query all canvases to find this user's presence
  // For now, we'll rely on onDisconnect handlers
  // This is a placeholder for future enhancement if needed
  console.debug('removeAllUserPresence called for user:', userId)
}
