import { rtdb } from './firebase'
import {
  ref,
  set,
  update,
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
    // Structure is already flat: {userId: CursorPosition}
    callback(cursors as Record<string, CursorPosition>)
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
 * Add a connection for a user using Firebase's recommended presence pattern
 * Path: connections/{canvasId}/{userId}/{connectionId} (tracks individual connections)
 * Path: presence/{canvasId}/{userId} (aggregated presence status)
 *
 * Strategy: Use Firebase Database triggers (via onValue at the hook level)
 * to monitor connections and update presence. Each tab creates a connection
 * entry that auto-removes on disconnect. A SINGLE global listener per user
 * monitors all their connections.
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 * @param userName - User's display name
 * @param color - User's color
 * @returns Cleanup function to call on unmount
 */
export async function addUserConnection(
  canvasId: string,
  userId: string,
  userName: string,
  color: string
): Promise<{ cleanup: () => Promise<void>; connectionId: string }> {
  console.log('🟢 addUserConnection called:', { canvasId, userId, userName })

  // Generate a unique connection ID for this tab/window
  const connectionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Separate paths for connections and presence
  const connectionRef = ref(rtdb, `connections/${canvasId}/${userId}/${connectionId}`)
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`)

  try {
    // Set this connection as active
    await set(connectionRef, {
      connectedAt: serverTimestamp(),
      userName,
      color,
    })

    // Setup automatic removal of this connection on disconnect
    // This works in production Firebase, but not reliably in emulator
    await onDisconnect(connectionRef).remove()

    console.log(`✅ Set up onDisconnect for connection ${connectionId}`)

    // Update the aggregated presence status to active
    // NOTE: Setting isActive to false is handled by the monitorUserConnections function
    await update(presenceRef, {
      userId,
      userName,
      color,
      isActive: true,
      lastSeen: serverTimestamp(),
    } as any)

    console.log('✅ Connection added successfully, connectionId:', connectionId)

    // Return cleanup function
    const cleanup = async () => {
      console.log('🧹 Cleaning up connection:', connectionId)
      try {
        await remove(connectionRef)
        console.log(`✅ Connection ${connectionId} removed`)
      } catch (error) {
        console.error(`❌ Failed to remove connection ${connectionId}:`, error)
      }
      // The monitorUserConnections listener will handle setting isActive to false if needed
    }

    return { cleanup, connectionId }
  } catch (error) {
    console.error('❌ Failed to add user connection:', error)
    throw error
  }
}

// Global registry to ensure only ONE monitor per user across all tabs
const connectionMonitors = new Map<string, { unsubscribe: () => void; refCount: number }>()

/**
 * Monitor all connections for a specific user and update their presence status
 * Uses a singleton pattern to ensure only ONE monitor per user across ALL tabs
 *
 * @param canvasId - ID of the canvas
 * @param userId - ID of the user
 * @returns Unsubscribe function
 */
export function monitorUserConnections(
  canvasId: string,
  userId: string
): () => void {
  const monitorKey = `${canvasId}:${userId}`

  // If monitor already exists, increment ref count and return existing unsubscribe
  if (connectionMonitors.has(monitorKey)) {
    const monitor = connectionMonitors.get(monitorKey)!
    monitor.refCount++
    console.log(`📊 Reusing existing connection monitor for ${userId}, refCount: ${monitor.refCount}`)

    // Return a wrapper that decrements ref count
    return () => {
      monitor.refCount--
      console.log(`📊 Decrementing monitor refCount for ${userId}, refCount: ${monitor.refCount}`)
      if (monitor.refCount <= 0) {
        monitor.unsubscribe()
        connectionMonitors.delete(monitorKey)
        console.log(`📊 Removed connection monitor for ${userId}`)
      }
    }
  }

  // Create new monitor
  console.log(`📊 Creating new connection monitor for ${userId}`)
  const userConnectionsRef = ref(rtdb, `connections/${canvasId}/${userId}`)
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`)

  const unsubscribe = onValue(userConnectionsRef, async (snapshot) => {
    const connections = snapshot.val()
    const hasConnections = connections && Object.keys(connections).length > 0

    console.log(`📊 Connection count for ${userId}:`, connections ? Object.keys(connections).length : 0)

    // Update presence based on whether connections exist
    await update(presenceRef, {
      isActive: hasConnections,
      lastSeen: serverTimestamp(),
    } as any)
  })

  // Store monitor with ref count
  connectionMonitors.set(monitorKey, { unsubscribe, refCount: 1 })

  // Return wrapper that manages ref count
  return () => {
    const monitor = connectionMonitors.get(monitorKey)
    if (monitor) {
      monitor.refCount--
      console.log(`📊 Decrementing monitor refCount for ${userId}, refCount: ${monitor.refCount}`)
      if (monitor.refCount <= 0) {
        monitor.unsubscribe()
        connectionMonitors.delete(monitorKey)
        console.log(`📊 Removed connection monitor for ${userId}`)
      }
    }
  }
}

/**
 * Set user presence in Firebase RTDB (legacy - prefer addUserConnection)
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
  const presenceData: Presence = {
    userId,
    userName,
    color,
    isActive,
    lastSeen: serverTimestamp() as any,
  }
  try {
    await set(presenceRef, presenceData)
    console.log('✅ Presence set successfully')
  } catch (error) {
    console.error('❌ Failed to set presence:', error)
    throw error
  }
}

/**
 * Setup automatic presence cleanup on disconnect (legacy - prefer addUserConnection)
 * Sets isActive to false when connection is lost
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
  try {
    // Set isActive to false on disconnect (don't remove the entry)
    await onDisconnect(presenceRef).update({ isActive: false, lastSeen: serverTimestamp() })
    console.log('✅ onDisconnect().update() handler set up for user')
  } catch (error) {
    console.error('❌ Failed to setup presence cleanup:', error)
    throw error
  }
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
    const userPresence = snapshot.val() || {}
    console.log('👥 Presence snapshot received:', userPresence)
    // Convert object to array of Presence entries and filter for active users only
    const presenceList: Presence[] = Object.values(userPresence)
      .map((data: any) => ({
        userId: data.userId,
        userName: data.userName,
        color: data.color,
        isActive: data.isActive,
        lastSeen: data.lastSeen,
      }))
      .filter((p) => p.isActive) // Only show active users
    console.log('👥 Active presence list:', presenceList)
    callback(presenceList)
  }

  const handleError = (error: Error) => {
    console.error('Presence subscription error:', error)
  }

  const unsubscribe = onValue(presenceRef, handleValue, handleError)
  return unsubscribe
}

/**
 * Manually set user presence to inactive
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
    // Use update to modify only isActive and lastSeen, keeping other fields
    await update(presenceRef, {
      isActive: false,
      lastSeen: serverTimestamp()
    } as any)
    console.log('✅ Presence set to inactive successfully:', { canvasId, userId })
  } catch (error) {
    console.error('❌ Failed to set presence inactive:', error)
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

/**
 * ============================================================================
 * LIVE POSITION UPDATES (for real-time collaborative shape dragging)
 * ============================================================================
 *
 * These functions provide low-latency position updates (10-50ms) for shapes
 * being dragged in real-time collaboration. RTDB is used for temporary live
 * updates during drag, while Firestore remains the source of truth for
 * persistent data.
 */

/**
 * Position data structure for live updates
 */
export interface LivePosition {
  x: number
  y: number
  x2?: number // For lines, arrows, connectors
  y2?: number
  bendX?: number // For bent connectors
  bendY?: number
  updatedBy: string // User ID who made the update
  updatedAt: number // Timestamp
}

/**
 * Write a shape's position to RTDB for live collaboration
 * Called during shape drag to broadcast position updates to other users
 *
 * @param canvasId - Canvas ID
 * @param shapeId - Shape ID
 * @param position - Position data to write
 */
export async function writeShapePosition(
  canvasId: string,
  shapeId: string,
  position: Omit<LivePosition, 'updatedAt'>
): Promise<void> {
  const positionRef = ref(rtdb, `live-positions/${canvasId}/${shapeId}`)

  const positionData: LivePosition = {
    ...position,
    updatedAt: Date.now(),
  }

  await set(positionRef, positionData)
}

/**
 * Write multiple shapes' positions to RTDB in a single batch update
 * This is MUCH more efficient for multi-select drag operations
 *
 * @param canvasId - Canvas ID
 * @param positions - Map of shapeId -> position data
 */
export async function writeBatchShapePositions(
  canvasId: string,
  positions: Map<string, Omit<LivePosition, 'updatedAt'>>
): Promise<void> {
  if (positions.size === 0) return

  const timestamp = Date.now()

  // Build update object with all positions
  // Firebase update() accepts an object with paths as keys
  const updates: Record<string, LivePosition> = {}

  positions.forEach((position, shapeId) => {
    // Each key is a path relative to the root
    updates[`live-positions/${canvasId}/${shapeId}`] = {
      ...position,
      updatedAt: timestamp,
    }
  })

  // Single atomic write for all positions
  const rootRef = ref(rtdb, '/')
  await update(rootRef, updates)
}

/**
 * Subscribe to live position updates for all shapes in a canvas
 * Other users' drag operations will trigger this callback with updated positions
 *
 * @param canvasId - Canvas ID
 * @param callback - Callback function called with positions map when data changes
 * @returns Unsubscribe function
 */
export function subscribeToLivePositions(
  canvasId: string,
  callback: (positions: Map<string, LivePosition>) => void
): () => void {
  const positionsRef = ref(rtdb, `live-positions/${canvasId}`)

  const handleValue = (snapshot: DataSnapshot) => {
    const positions = new Map<string, LivePosition>()

    if (snapshot.exists()) {
      const data = snapshot.val()

      // Convert object to Map
      Object.entries(data).forEach(([shapeId, positionData]) => {
        positions.set(shapeId, positionData as LivePosition)
      })
    }

    callback(positions)
  }

  const handleError = (error: Error) => {
    console.error('[RTDB] Live positions subscription error:', error)
  }

  // Listen for all position updates under this canvas
  const unsubscribe = onValue(positionsRef, handleValue, handleError)

  // Return unsubscribe function
  return unsubscribe
}

/**
 * Clear a shape's position from RTDB (called when drag ends)
 * This removes temporary live position data and allows Firestore to be the source of truth
 *
 * @param canvasId - Canvas ID
 * @param shapeId - Shape ID
 */
export async function clearShapePosition(
  canvasId: string,
  shapeId: string
): Promise<void> {
  const positionRef = ref(rtdb, `live-positions/${canvasId}/${shapeId}`)
  await remove(positionRef)
}

/**
 * Clear all positions for a canvas (cleanup on unmount or reset)
 *
 * @param canvasId - Canvas ID
 */
export async function clearAllPositions(canvasId: string): Promise<void> {
  const positionsRef = ref(rtdb, `live-positions/${canvasId}`)
  await remove(positionsRef)
}

/**
 * Clear positions for multiple shapes (batch cleanup)
 * Used when multiple shapes finish dragging at once
 *
 * @param canvasId - Canvas ID
 * @param shapeIds - Array of shape IDs to clear
 */
export async function clearShapePositions(
  canvasId: string,
  shapeIds: string[]
): Promise<void> {
  // Clear all positions in parallel for performance
  await Promise.all(
    shapeIds.map((shapeId) => clearShapePosition(canvasId, shapeId))
  )
}
