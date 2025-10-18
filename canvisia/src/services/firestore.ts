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
  arrayUnion,
  getDoc,
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
        // TODO: This is legacy Firestore-based presence, now using RTDB
        const presence: Presence = {
          userId: data.userId,
          userName: data.userName,
          color: data.color,
          isActive: data.isActive || true,
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

/**
 * Add a message to a chat tab
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param message - Message data
 */
export async function addChatMessage(
  canvasId: string,
  tabId: string,
  message: {
    id: string
    text: string
    sender: 'user' | 'ai'
    timestamp: number
    userName?: string
    userEmail?: string
  }
): Promise<void> {
  const messageRef = doc(db, 'canvases', canvasId, 'chats', tabId, 'messages', message.id)

  const messageData = {
    ...message,
    createdAt: Timestamp.fromMillis(message.timestamp),
    readBy: message.userEmail ? [message.userEmail] : [] // Sender has "read" their own message
  }

  await setDoc(messageRef, messageData)
}

/**
 * Subscribe to chat messages for a tab
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param callback - Callback function with messages array
 * @returns Unsubscribe function
 */
export function subscribeToChatMessages(
  canvasId: string,
  tabId: string,
  callback: (messages: any[]) => void
): () => void {
  const messagesRef = collection(db, 'canvases', canvasId, 'chats', tabId, 'messages')
  const q = query(messagesRef)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const messagesList: any[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        messagesList.push({
          id: data.id,
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp,
          userName: data.userName,
          userEmail: data.userEmail,
          readBy: data.readBy || []
        })
      })

      // Sort by timestamp
      messagesList.sort((a, b) => a.timestamp - b.timestamp)

      callback(messagesList)
    },
    (error) => {
      console.error('Chat messages subscription error:', error)
    }
  )

  return unsubscribe
}

/**
 * Mark a message as read by a user
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param messageId - Message ID
 * @param userEmail - User email to add to readBy array
 */
export async function markMessageAsRead(
  canvasId: string,
  tabId: string,
  messageId: string,
  userEmail: string
): Promise<void> {
  const messageRef = doc(db, 'canvases', canvasId, 'chats', tabId, 'messages', messageId)

  await updateDoc(messageRef, {
    readBy: arrayUnion(userEmail)
  })
}

/**
 * Create a new chat tab
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param tabName - Tab name
 */
export async function createChatTab(
  canvasId: string,
  tabId: string,
  tabName: string
): Promise<void> {
  const tabRef = doc(db, 'canvases', canvasId, 'chatTabs', tabId)

  await setDoc(tabRef, {
    id: tabId,
    name: tabName,
    createdAt: Timestamp.now(),
    hiddenBy: [] // Array of user emails who have hidden this tab
  })
}

/**
 * Rename a chat tab
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param newName - New tab name
 */
export async function renameChatTab(
  canvasId: string,
  tabId: string,
  newName: string
): Promise<void> {
  const tabRef = doc(db, 'canvases', canvasId, 'chatTabs', tabId)

  await updateDoc(tabRef, {
    name: newName
  })
}

/**
 * Hide a chat tab for a specific user
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param userEmail - User email to hide tab for
 */
export async function hideChatTab(
  canvasId: string,
  tabId: string,
  userEmail: string
): Promise<void> {
  const tabRef = doc(db, 'canvases', canvasId, 'chatTabs', tabId)
  await updateDoc(tabRef, {
    hiddenBy: arrayUnion(userEmail)
  })
}

/**
 * Unhide a chat tab for a specific user
 * @param canvasId - Canvas ID
 * @param tabId - Tab ID
 * @param userEmail - User email to unhide tab for
 */
export async function unhideChatTab(
  canvasId: string,
  tabId: string,
  userEmail: string
): Promise<void> {
  const tabRef = doc(db, 'canvases', canvasId, 'chatTabs', tabId)

  // Get current hiddenBy array
  const tabDoc = await getDoc(tabRef)
  if (tabDoc.exists()) {
    const hiddenBy = tabDoc.data().hiddenBy || []
    const newHiddenBy = hiddenBy.filter((email: string) => email !== userEmail)

    await updateDoc(tabRef, {
      hiddenBy: newHiddenBy
    })
  }
}

/**
 * Subscribe to chat tabs
 * @param canvasId - Canvas ID
 * @param callback - Callback function with tabs array
 * @returns Unsubscribe function
 */
export function subscribeToChatTabs(
  canvasId: string,
  callback: (tabs: any[]) => void
): () => void {
  const tabsRef = collection(db, 'canvases', canvasId, 'chatTabs')
  const q = query(tabsRef)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const tabsList: any[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        tabsList.push({
          id: data.id,
          name: data.name,
          createdAt: data.createdAt,
          hiddenBy: data.hiddenBy || []
        })
      })

      // Sort by creation time
      tabsList.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return aTime - bTime
      })

      callback(tabsList)
    },
    (error) => {
      console.error('Chat tabs subscription error:', error)
    }
  )

  return unsubscribe
}
