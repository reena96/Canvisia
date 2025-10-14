import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
} from 'firebase/firestore'
import type { Shape } from '@/types/shapes'
import type { Presence } from '@/types/user'

export { db }

/**
 * Create a new shape in Firestore
 * @param canvasId - Canvas ID
 * @param shape - Shape data
 */
export async function createShape(canvasId: string, shape: Shape): Promise<void> {
  const shapeRef = doc(db, 'canvases', canvasId, 'objects', shape.id)

  // Convert Date to Firestore Timestamp
  const shapeData = {
    ...shape,
    updatedAt: shape.updatedAt instanceof Date
      ? Timestamp.fromDate(shape.updatedAt)
      : Timestamp.fromDate(new Date(shape.updatedAt)),
  }

  await setDoc(shapeRef, shapeData)
}

/**
 * Update an existing shape in Firestore
 * @param canvasId - Canvas ID
 * @param shapeId - Shape ID
 * @param updates - Partial shape data to update
 */
export async function updateShape(
  canvasId: string,
  shapeId: string,
  updates: Partial<Shape>
): Promise<void> {
  const shapeRef = doc(db, 'canvases', canvasId, 'objects', shapeId)

  // Add updatedAt timestamp
  const updateData = {
    ...updates,
    updatedAt: Timestamp.now(),
  }

  await updateDoc(shapeRef, updateData)
}

/**
 * Delete a shape from Firestore
 * @param canvasId - Canvas ID
 * @param shapeId - Shape ID
 */
export async function deleteShape(canvasId: string, shapeId: string): Promise<void> {
  const shapeRef = doc(db, 'canvases', canvasId, 'objects', shapeId)
  await deleteDoc(shapeRef)
}

/**
 * Subscribe to shapes collection with real-time updates
 * @param canvasId - Canvas ID
 * @param callback - Callback function with shapes array
 * @returns Unsubscribe function
 */
export function subscribeToShapes(
  canvasId: string,
  callback: (shapes: Shape[]) => void
): () => void {
  const objectsRef = collection(db, 'canvases', canvasId, 'objects')
  const q = query(objectsRef)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const shapes: Shape[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()

        // Convert Firestore Timestamp back to ISO string
        const shape = {
          ...data,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Shape

        shapes.push(shape)
      })

      callback(shapes)
    },
    (error) => {
      console.error('Firestore subscription error:', error)
    }
  )

  return unsubscribe
}

/**
 * Set user presence in Firestore
 * @param canvasId - Canvas ID
 * @param userId - User ID
 * @param userName - User display name
 * @param color - User color
 * @param isActive - Whether user is active
 */
export async function setUserPresence(
  canvasId: string,
  userId: string,
  userName: string,
  color: string,
  isActive: boolean
): Promise<void> {
  const presenceRef = doc(db, 'canvases', canvasId, 'presence', userId)

  const presenceData = {
    userId,
    userName,
    color,
    isActive,
    lastSeen: Timestamp.now(),
  }

  await setDoc(presenceRef, presenceData)
}

/**
 * Subscribe to presence updates
 * @param canvasId - Canvas ID
 * @param callback - Callback function with presence array
 * @returns Unsubscribe function
 */
export function subscribeToPresence(
  canvasId: string,
  callback: (presence: Presence[]) => void
): () => void {
  const presenceRef = collection(db, 'canvases', canvasId, 'presence')
  const q = query(presenceRef)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const presenceList: Presence[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()

        // Convert Firestore Timestamp back to ISO string
        const presence: Presence = {
          userId: data.userId,
          userName: data.userName,
          color: data.color,
          isActive: data.isActive,
          lastSeen: data.lastSeen?.toDate?.()?.toISOString() || data.lastSeen,
        }

        presenceList.push(presence)
      })

      callback(presenceList)
    },
    (error) => {
      console.error('Presence subscription error:', error)
    }
  )

  return unsubscribe
}
