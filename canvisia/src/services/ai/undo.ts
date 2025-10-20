import { collection, doc, setDoc, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Shape } from '@/types/shapes'

/**
 * Undo action stored in Firestore
 * Tracks AI actions so they can be reverted
 */
export interface UndoAction {
  id: string
  canvasId: string
  userId: string
  timestamp: Date
  command: string  // Original user command
  actionType: 'create' | 'modify' | 'delete'

  // For creates - just the IDs to delete on undo
  createdShapeIds?: string[]

  // For modifies - store original states to restore
  modifiedShapes?: Array<{
    id: string
    originalState: Partial<Shape>
  }>

  // For deletes - store full shapes to restore
  deletedShapes?: Shape[]
}

/**
 * Save an undo action to Firestore
 * Keeps only the most recent action per canvas
 */
export async function saveUndoAction(action: UndoAction): Promise<void> {
  try {
    // First, delete any existing undo actions for this canvas
    await clearUndoHistory(action.canvasId)

    // Save the new undo action
    const undoRef = doc(db, `canvases/${action.canvasId}/undoHistory`, action.id)
    await setDoc(undoRef, {
      ...action,
      timestamp: action.timestamp.toISOString()
    })

    console.log('[Undo] Saved undo action:', action.id)
  } catch (error) {
    console.error('[Undo] Error saving undo action:', error)
    throw error
  }
}

/**
 * Get the most recent undo action for a canvas
 */
export async function getLastUndoAction(canvasId: string): Promise<UndoAction | null> {
  try {
    const undoHistoryRef = collection(db, `canvases/${canvasId}/undoHistory`)
    const q = query(undoHistoryRef, orderBy('timestamp', 'desc'), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    return {
      ...data,
      timestamp: new Date(data.timestamp)
    } as UndoAction
  } catch (error) {
    console.error('[Undo] Error getting last undo action:', error)
    return null
  }
}

/**
 * Clear undo history for a canvas
 */
export async function clearUndoHistory(canvasId: string): Promise<void> {
  try {
    const undoHistoryRef = collection(db, `canvases/${canvasId}/undoHistory`)
    const snapshot = await getDocs(undoHistoryRef)

    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    console.log('[Undo] Cleared undo history for canvas:', canvasId)
  } catch (error) {
    console.error('[Undo] Error clearing undo history:', error)
    throw error
  }
}

/**
 * Delete a specific undo action (after it's been used)
 */
export async function deleteUndoAction(canvasId: string, actionId: string): Promise<void> {
  try {
    const undoRef = doc(db, `canvases/${canvasId}/undoHistory`, actionId)
    await deleteDoc(undoRef)
    console.log('[Undo] Deleted undo action:', actionId)
  } catch (error) {
    console.error('[Undo] Error deleting undo action:', error)
    throw error
  }
}
