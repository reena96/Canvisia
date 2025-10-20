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
  getDocs,
} from 'firebase/firestore'
import type { Shape } from '@/types/shapes'
import type { Presence } from '@/types/user'
import type { Project, Permission, ProjectMetadata } from '@/types/project'

export { db }

/**
 * Create a new shape in Firestore
 * @param canvasPath - Full canvas path (e.g., "projects/abc/canvases/xyz" or "default-canvas")
 * @param shape - Shape data
 */
export async function createShape(canvasPath: string, shape: Shape): Promise<void> {
  // Support both old format "canvasId" and new format "projects/x/canvases/y"
  const objectsPath = canvasPath.includes('/')
    ? `${canvasPath}/objects`
    : `canvases/${canvasPath}/objects`

  const shapeRef = doc(db, objectsPath, shape.id)

  // Convert Date to Firestore Timestamp
  const shapeData = {
    ...shape,
    updatedAt: shape.updatedAt instanceof Date
      ? Timestamp.fromDate(shape.updatedAt)
      : Timestamp.fromDate(new Date(shape.updatedAt)),
  }

  await setDoc(shapeRef, shapeData)

  // Update project lastModified if this is a new project format
  if (canvasPath.includes('projects/')) {
    const projectId = canvasPath.split('/')[1]
    const canvasId = canvasPath.split('/')[3]
    if (projectId && canvasId) {
      await updateCanvas(projectId, canvasId, {})
    }
  }
}

/**
 * Update an existing shape in Firestore
 * @param canvasPath - Full canvas path
 * @param shapeId - Shape ID
 * @param updates - Partial shape data to update
 */
export async function updateShape(
  canvasPath: string,
  shapeId: string,
  updates: Partial<Shape>
): Promise<void> {
  const objectsPath = canvasPath.includes('/')
    ? `${canvasPath}/objects`
    : `canvases/${canvasPath}/objects`

  const shapeRef = doc(db, objectsPath, shapeId)

  // Add updatedAt timestamp
  const updateData = {
    ...updates,
    updatedAt: Timestamp.now(),
  }

  await updateDoc(shapeRef, updateData)

  // Update project lastModified if this is a new project format
  if (canvasPath.includes('projects/')) {
    const projectId = canvasPath.split('/')[1]
    const canvasId = canvasPath.split('/')[3]
    if (projectId && canvasId) {
      await updateCanvas(projectId, canvasId, {})
    }
  }
}

/**
 * Delete a shape from Firestore
 * @param canvasPath - Full canvas path
 * @param shapeId - Shape ID
 */
export async function deleteShape(canvasPath: string, shapeId: string): Promise<void> {
  const objectsPath = canvasPath.includes('/')
    ? `${canvasPath}/objects`
    : `canvases/${canvasPath}/objects`

  const shapeRef = doc(db, objectsPath, shapeId)
  await deleteDoc(shapeRef)

  // Update project lastModified if this is a new project format
  if (canvasPath.includes('projects/')) {
    const projectId = canvasPath.split('/')[1]
    const canvasId = canvasPath.split('/')[3]
    if (projectId && canvasId) {
      await updateCanvas(projectId, canvasId, {})
    }
  }
}

/**
 * Get all shapes from a canvas (one-time fetch)
 * @param canvasPath - Full canvas path
 * @returns Promise with array of shapes
 */
export async function getShapes(canvasPath: string): Promise<Shape[]> {
  const objectsPath = canvasPath.includes('/')
    ? `${canvasPath}/objects`
    : `canvases/${canvasPath}/objects`

  const objectsRef = collection(db, objectsPath)
  const q = query(objectsRef)

  const snapshot = await getDocs(q)
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

  return shapes
}

/**
 * Subscribe to shapes collection with real-time updates
 * @param canvasPath - Full canvas path
 * @param callback - Callback function called with shapes array when data changes
 * @returns Unsubscribe function
 */
export function subscribeToShapes(
  canvasPath: string,
  callback: (shapes: Shape[]) => void
): () => void {
  const objectsPath = canvasPath.includes('/')
    ? `${canvasPath}/objects`
    : `canvases/${canvasPath}/objects`

  const objectsRef = collection(db, objectsPath)
  const q = query(objectsRef)

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const shapes: Shape[] = []

      // Log subscription updates for debugging
      console.log(`[Firestore SUBSCRIPTION - ${new Date().toISOString()}] Received ${snapshot.size} shapes, ${snapshot.docChanges().length} changes`)
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data()
          console.log(`[Firestore SUBSCRIPTION - ${new Date().toISOString()}] Shape ${change.doc.id} modified: x=${data.x}, y=${data.y}`)
        }
      })

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

/**
 * Create a new project with default canvas
 * @param userId - Owner user ID
 * @param projectName - Project name
 * @param userEmail - Optional user email
 * @returns Project ID
 */
export async function createProject(
  userId: string,
  projectName: string = 'Untitled Project',
  userEmail: string = ''
): Promise<string> {
  const projectId = doc(collection(db, 'projects')).id
  const now = Timestamp.now()

  // Create project document
  const projectData: Omit<Project, 'createdAt' | 'lastModified' | 'lastAccessed'> & {
    createdAt: Timestamp
    lastModified: Timestamp
    lastAccessed: Timestamp
  } = {
    id: projectId,
    name: projectName,
    ownerId: userId,
    thumbnail: null,
    createdAt: now,
    lastModified: now,
    lastAccessed: now,
  }

  await setDoc(doc(db, 'projects', projectId), projectData)

  // Create owner permission
  const permissionId = `${projectId}_${userId}`
  const permissionData: Omit<Permission, 'invitedAt' | 'acceptedAt'> & {
    invitedAt: Timestamp
    acceptedAt: Timestamp | null
  } = {
    projectId,
    userId,
    userEmail: userEmail,
    role: 'owner',
    invitedBy: userId,
    invitedAt: now,
    acceptedAt: now,
  }

  await setDoc(doc(db, 'permissions', permissionId), permissionData)

  // Create default canvas
  const canvasId = doc(collection(db, 'projects', projectId, 'canvases')).id
  const canvasData = {
    id: canvasId,
    name: 'Canvas 1',
    order: 0,
    thumbnail: null,
    settings: {
      backgroundColor: '#ffffff',
      gridEnabled: true,
    },
    createdAt: now,
    lastModified: now,
  }

  await setDoc(doc(db, 'projects', projectId, 'canvases', canvasId), canvasData)

  return projectId
}

/**
 * Get all projects accessible by user
 * @param userId - User ID
 * @returns Array of projects
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  // Query permissions collection for user's accessible projects
  const permissionsRef = collection(db, 'permissions')
  const q = query(permissionsRef)
  const snapshot = await getDocs(q)

  const projectIds: string[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    if (doc.id.endsWith(`_${userId}`)) {
      projectIds.push(data.projectId)
    }
  })

  if (projectIds.length === 0) return []

  // Fetch all projects
  const projects: Project[] = []
  for (const projectId of projectIds) {
    const projectDoc = await getDoc(doc(db, 'projects', projectId))
    if (projectDoc.exists()) {
      const data = projectDoc.data()
      projects.push({
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        lastModified: data.lastModified?.toDate?.() || data.lastModified,
        lastAccessed: data.lastAccessed?.toDate?.() || data.lastAccessed,
      } as Project)
    }
  }

  return projects
}

/**
 * Get a single project by ID
 * @param projectId - Project ID
 * @returns Project or null
 */
export async function getProject(projectId: string): Promise<Project | null> {
  const projectDoc = await getDoc(doc(db, 'projects', projectId))
  if (!projectDoc.exists()) return null

  const data = projectDoc.data()
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    lastModified: data.lastModified?.toDate?.() || data.lastModified,
    lastAccessed: data.lastAccessed?.toDate?.() || data.lastAccessed,
  } as Project
}

/**
 * Update project metadata
 * @param projectId - Project ID
 * @param updates - Fields to update
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>
): Promise<void> {
  const updateData = {
    ...updates,
    lastModified: Timestamp.now(),
  }

  await updateDoc(doc(db, 'projects', projectId), updateData)
}

/**
 * Delete a project and all its canvases
 * @param projectId - Project ID
 */
export async function deleteProject(projectId: string): Promise<void> {
  // Delete all canvases and their objects
  const canvasesRef = collection(db, 'projects', projectId, 'canvases')
  const canvasesSnapshot = await getDocs(canvasesRef)

  for (const canvasDoc of canvasesSnapshot.docs) {
    // Delete all objects in canvas
    const objectsRef = collection(db, 'projects', projectId, 'canvases', canvasDoc.id, 'objects')
    const objectsSnapshot = await getDocs(objectsRef)
    for (const objectDoc of objectsSnapshot.docs) {
      await deleteDoc(objectDoc.ref)
    }
    // Delete canvas
    await deleteDoc(canvasDoc.ref)
  }

  // Delete project
  await deleteDoc(doc(db, 'projects', projectId))
}

/**
 * Get all canvases in a project
 * @param projectId - Project ID
 * @returns Array of canvas metadata
 */
export async function getProjectCanvases(projectId: string): Promise<ProjectMetadata[]> {
  const canvasesRef = collection(db, 'projects', projectId, 'canvases')
  const q = query(canvasesRef)
  const snapshot = await getDocs(q)

  const canvases: ProjectMetadata[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    canvases.push({
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      lastModified: data.lastModified?.toDate?.() || data.lastModified,
    } as ProjectMetadata)
  })

  // Sort by order
  canvases.sort((a, b) => a.order - b.order)

  return canvases
}

/**
 * Create a new canvas in a project
 * @param projectId - Project ID
 * @param canvasName - Canvas name
 * @returns Canvas ID
 */
export async function createCanvas(
  projectId: string,
  canvasName: string = 'New Page'
): Promise<string> {
  // Get existing canvases to determine order
  const canvases = await getProjectCanvases(projectId)
  const maxOrder = canvases.length > 0 ? Math.max(...canvases.map(c => c.order)) : -1

  const canvasId = doc(collection(db, 'projects', projectId, 'canvases')).id
  const now = Timestamp.now()

  const canvasData = {
    id: canvasId,
    name: canvasName,
    order: maxOrder + 1,
    thumbnail: null,
    settings: {
      backgroundColor: '#ffffff',
      gridEnabled: true,
    },
    createdAt: now,
    lastModified: now,
  }

  await setDoc(doc(db, 'projects', projectId, 'canvases', canvasId), canvasData)

  // Update project lastModified
  await updateProject(projectId, {})

  return canvasId
}

/**
 * Update canvas metadata
 * @param projectId - Project ID
 * @param canvasId - Canvas ID
 * @param updates - Fields to update
 */
export async function updateCanvas(
  projectId: string,
  canvasId: string,
  updates: Partial<{ name: string; thumbnail: string | null; settings: any }>
): Promise<void> {
  const updateData = {
    ...updates,
    lastModified: Timestamp.now(),
  }

  await updateDoc(doc(db, 'projects', projectId, 'canvases', canvasId), updateData)

  // Update project lastModified
  await updateProject(projectId, {})
}

/**
 * Delete a canvas from a project
 * @param projectId - Project ID
 * @param canvasId - Canvas ID
 */
export async function deleteCanvas(projectId: string, canvasId: string): Promise<void> {
  // Delete all objects in canvas
  const objectsRef = collection(db, 'projects', projectId, 'canvases', canvasId, 'objects')
  const snapshot = await getDocs(objectsRef)
  for (const objectDoc of snapshot.docs) {
    await deleteDoc(objectDoc.ref)
  }

  // Delete canvas
  await deleteDoc(doc(db, 'projects', projectId, 'canvases', canvasId))

  // Update project lastModified
  await updateProject(projectId, {})
}

/**
 * Check user permission for a project
 * @param projectId - Project ID
 * @param userId - User ID
 * @returns Permission or null
 */
export async function getUserProjectPermission(
  projectId: string,
  userId: string
): Promise<Permission | null> {
  const permissionId = `${projectId}_${userId}`
  const permissionDoc = await getDoc(doc(db, 'permissions', permissionId))

  if (!permissionDoc.exists()) return null

  const data = permissionDoc.data()
  return {
    ...data,
    invitedAt: data.invitedAt?.toDate?.() || data.invitedAt,
    acceptedAt: data.acceptedAt?.toDate?.() || data.acceptedAt,
  } as Permission
}

/**
 * Invite a user to collaborate on a project by email
 * Note: This creates a pending invitation. The user must be registered in Firebase Auth.
 * @param projectId - Project ID
 * @param userEmail - Email of user to invite
 * @param userId - User ID (required for now; in production this would be looked up)
 * @param role - Permission role (editor or viewer)
 * @param invitedBy - User ID of inviter
 */
export async function inviteUserByEmail(
  projectId: string,
  userEmail: string,
  userId: string,
  role: 'editor' | 'viewer',
  invitedBy: string
): Promise<void> {
  const permissionId = `${projectId}_${userId}`
  const now = Timestamp.now()

  const permissionData: Omit<Permission, 'invitedAt' | 'acceptedAt'> & {
    invitedAt: Timestamp
    acceptedAt: Timestamp | null
  } = {
    projectId,
    userId,
    userEmail,
    role,
    invitedBy,
    invitedAt: now,
    acceptedAt: null, // Pending acceptance
  }

  await setDoc(doc(db, 'permissions', permissionId), permissionData)
}

/**
 * Get all collaborators for a project
 * @param projectId - Project ID
 * @returns Array of permissions with user info
 */
export async function getProjectCollaborators(
  projectId: string
): Promise<(Permission & { userName?: string })[]> {
  const permissionsRef = collection(db, 'permissions')
  const snapshot = await getDocs(permissionsRef)

  const collaborators: (Permission & { userName?: string })[] = []

  snapshot.forEach((doc) => {
    const data = doc.data()
    if (data.projectId === projectId) {
      collaborators.push({
        projectId: data.projectId,
        userId: data.userId,
        userEmail: data.userEmail,
        role: data.role,
        invitedBy: data.invitedBy,
        invitedAt: data.invitedAt?.toDate?.() || data.invitedAt,
        acceptedAt: data.acceptedAt?.toDate?.() || data.acceptedAt,
        userName: data.userName || data.userEmail, // Fallback to email if no name
      })
    }
  })

  return collaborators
}

/**
 * Update a user's permission role for a project
 * @param projectId - Project ID
 * @param userId - User ID
 * @param newRole - New permission role
 */
export async function updatePermissionRole(
  projectId: string,
  userId: string,
  newRole: 'editor' | 'viewer'
): Promise<void> {
  const permissionId = `${projectId}_${userId}`
  await updateDoc(doc(db, 'permissions', permissionId), {
    role: newRole,
  })
}

/**
 * Remove a collaborator from a project
 * @param projectId - Project ID
 * @param userId - User ID to remove
 */
export async function removeProjectCollaborator(
  projectId: string,
  userId: string
): Promise<void> {
  const permissionId = `${projectId}_${userId}`
  await deleteDoc(doc(db, 'permissions', permissionId))
}
