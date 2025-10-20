# Multi-Project System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Canvisia from single-canvas to multi-project system where users can create/manage multiple projects, each containing multiple canvases, with Figma-like UI and URL-based sharing.

**Architecture:** Firestore hybrid nested structure (projects/{projectId}/canvases/{canvasId}/objects), separate permissions collection for efficient queries, React Router for navigation, existing Canvas component reused with dynamic IDs.

**Tech Stack:** React 19, TypeScript, Firebase (Firestore + RTDB), React Router 7, Zustand (if needed for state)

---

## Task 1: Create TypeScript Types

**Files:**
- Create: `src/types/project.ts`
- Modify: `src/types/canvas.ts:1-11`

**Step 1: Create project types file**

Create `src/types/project.ts`:

```typescript
import type { Timestamp } from 'firebase/firestore'

export interface Project {
  id: string
  name: string
  ownerId: string
  thumbnail: string | null
  createdAt: Date
  lastModified: Date
  lastAccessed: Date
}

export interface ProjectMetadata {
  id: string
  name: string
  order: number
  thumbnail: string | null
  settings: {
    backgroundColor: string
    gridEnabled: boolean
  }
  createdAt: Date
  lastModified: Date
}

export type PermissionRole = 'owner' | 'editor' | 'viewer'

export interface Permission {
  projectId: string
  userId: string
  userEmail: string
  role: PermissionRole
  invitedBy: string
  invitedAt: Date
  acceptedAt: Date | null
}
```

**Step 2: Update Canvas type to include projectId**

Modify `src/types/canvas.ts`:

```typescript
// Canvas Types
import type { Shape } from './shapes';

export interface Canvas {
  id: string;
  name: string;
  createdAt: Date | string;
  ownerId: string;
  lastModified: Date | string;
  order: number;
  thumbnail: string | null;
  settings: {
    backgroundColor: string;
    gridEnabled: boolean;
  };
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasState {
  shapes: Shape[];
  selectedIds: string[];
  viewport: Viewport;
}

// Re-export Shape type for convenience
export type { Shape };
```

**Step 3: Commit types**

```bash
git add src/types/project.ts src/types/canvas.ts
git commit -m "feat: add Project, Permission, and Canvas types for multi-project system"
```

---

## Task 2: Create Firestore Service Functions for Projects

**Files:**
- Modify: `src/services/firestore.ts` (add after existing functions)

**Step 1: Add project CRUD functions**

Add to `src/services/firestore.ts`:

```typescript
// Add imports at top
import type { Project, Permission, ProjectMetadata } from '@/types/project'

// Add at end of file, before exports

/**
 * Create a new project with default canvas
 * @param userId - Owner user ID
 * @param projectName - Project name
 * @returns Project ID
 */
export async function createProject(
  userId: string,
  projectName: string = 'Untitled Project'
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
    userEmail: '', // Will be filled by caller if available
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
    name: 'Page 1',
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
```

**Step 2: Commit**

```bash
git add src/services/firestore.ts
git commit -m "feat: add Firestore functions for projects, canvases, and permissions"
```

---

## Task 3: Update Existing Shape CRUD to Support Dynamic Canvas Paths

**Files:**
- Modify: `src/services/firestore.ts:25-96` (existing shape functions)

**Step 1: Update createShape to use dynamic path**

Modify `src/services/firestore.ts`:

```typescript
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
}
```

**Step 2: Update updateShape**

```typescript
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
}
```

**Step 3: Update deleteShape**

```typescript
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
}
```

**Step 4: Update getShapes**

```typescript
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
```

**Step 5: Update subscribeToShapes**

```typescript
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
```

**Step 6: Commit**

```bash
git add src/services/firestore.ts
git commit -m "refactor: update shape CRUD to support dynamic canvas paths"
```

---

## Task 4: Install and Configure React Router

**Files:**
- Modify: `package.json`
- Create: `src/routes.tsx`

**Step 1: Install React Router**

Run:
```bash
npm install react-router-dom@7
```

Expected: Package installed successfully

**Step 2: Create routes configuration**

Create `src/routes.tsx`:

```typescript
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectView } from './pages/ProjectView'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'p/:projectId',
        element: <ProjectView />,
        children: [
          {
            path: ':canvasId',
            element: null, // Canvas is rendered by ProjectView
          },
        ],
      },
    ],
  },
])
```

**Step 3: Commit**

```bash
git add package.json package-lock.json src/routes.tsx
git commit -m "feat: add React Router and routes configuration"
```

---

## Task 5: Create Projects Page Component

**Files:**
- Create: `src/pages/ProjectsPage.tsx`
- Create: `src/pages/ProjectsPage.css`

**Step 1: Create ProjectsPage component**

Create `src/pages/ProjectsPage.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { getUserProjects, createProject } from '@/services/firestore'
import type { Project } from '@/types/project'
import './ProjectsPage.css'

export function ProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recent' | 'shared' | 'owned'>('recent')

  useEffect(() => {
    if (!user) return

    const loadProjects = async () => {
      try {
        const userProjects = await getUserProjects(user.uid)
        setProjects(userProjects)
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [user])

  const handleCreateProject = async () => {
    if (!user) return

    try {
      const projectId = await createProject(user.uid, 'Untitled Project')
      navigate(`/p/${projectId}`)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/p/${projectId}`)
  }

  const filteredProjects = projects.filter(project => {
    if (activeTab === 'owned') return project.ownerId === user?.uid
    if (activeTab === 'shared') return project.ownerId !== user?.uid
    return true // recent shows all
  }).sort((a, b) => {
    const aTime = a.lastAccessed instanceof Date ? a.lastAccessed.getTime() : new Date(a.lastAccessed).getTime()
    const bTime = b.lastAccessed instanceof Date ? b.lastAccessed.getTime() : new Date(b.lastAccessed).getTime()
    return bTime - aTime
  })

  if (loading) {
    return (
      <div className="projects-page">
        <div className="projects-loading">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="projects-header-left">
          <h1>Projects</h1>
        </div>
        <div className="projects-header-right">
          <button className="btn-primary" onClick={handleCreateProject}>
            New Project
          </button>
        </div>
      </header>

      <div className="projects-tabs">
        <button
          className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recently viewed
        </button>
        <button
          className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
          onClick={() => setActiveTab('shared')}
        >
          Shared with me
        </button>
        <button
          className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          Owned by me
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="projects-empty">
          <p>No projects found</p>
          <button className="btn-primary" onClick={handleCreateProject}>
            Create your first project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => handleOpenProject(project.id)}
            >
              <div className="project-thumbnail">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} />
                ) : (
                  <div className="project-thumbnail-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="project-info">
                <h3>{project.name}</h3>
                <p className="project-meta">
                  {project.ownerId === user?.uid ? 'Owned by you' : 'Shared'}
                  {' · '}
                  Edited {formatTimestamp(project.lastModified)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTimestamp(timestamp: Date | string): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}
```

**Step 2: Create ProjectsPage styles**

Create `src/pages/ProjectsPage.css`:

```css
.projects-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.projects-header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
}

.btn-primary {
  background: #3B82F6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563EB;
}

.projects-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 2rem;
}

.tab {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: #6B7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: #1F2937;
  border-bottom-color: #3B82F6;
}

.tab:hover {
  color: #1F2937;
}

.projects-loading {
  text-align: center;
  padding: 4rem;
  color: #6B7280;
}

.projects-empty {
  text-align: center;
  padding: 4rem;
}

.projects-empty p {
  color: #6B7280;
  font-size: 1.25rem;
  margin-bottom: 2rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.project-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3B82F6;
}

.project-thumbnail {
  aspect-ratio: 16 / 9;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-thumbnail-placeholder {
  color: #9CA3AF;
}

.project-info {
  padding: 1rem;
}

.project-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1F2937;
}

.project-meta {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}
```

**Step 3: Commit**

```bash
git add src/pages/ProjectsPage.tsx src/pages/ProjectsPage.css
git commit -m "feat: create ProjectsPage component with project grid"
```

---

## Task 6: Create ProjectView Component

**Files:**
- Create: `src/pages/ProjectView.tsx`
- Create: `src/components/canvas/CanvasSidebar.tsx`
- Create: `src/components/canvas/CanvasSidebar.css`

**Step 1: Create CanvasSidebar component**

Create `src/components/canvas/CanvasSidebar.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCanvas, deleteCanvas } from '@/services/firestore'
import type { ProjectMetadata } from '@/types/project'
import './CanvasSidebar.css'

interface CanvasSidebarProps {
  projectId: string
  canvases: ProjectMetadata[]
  activeCanvasId: string | undefined
  onCanvasesChange: () => void
}

export function CanvasSidebar({ projectId, canvases, activeCanvasId, onCanvasesChange }: CanvasSidebarProps) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleCreateCanvas = async () => {
    try {
      const canvasId = await createCanvas(projectId, `Page ${canvases.length + 1}`)
      onCanvasesChange()
      navigate(`/p/${projectId}/${canvasId}`)
    } catch (error) {
      console.error('Error creating canvas:', error)
    }
  }

  const handleSelectCanvas = (canvasId: string) => {
    navigate(`/p/${projectId}/${canvasId}`)
  }

  const handleDeleteCanvas = async (canvasId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    if (canvases.length === 1) {
      alert('Cannot delete the last canvas in a project')
      return
    }

    if (!confirm('Are you sure you want to delete this canvas?')) {
      return
    }

    try {
      await deleteCanvas(projectId, canvasId)
      onCanvasesChange()

      // Navigate to first canvas if deleting active canvas
      if (canvasId === activeCanvasId) {
        const remainingCanvas = canvases.find(c => c.id !== canvasId)
        if (remainingCanvas) {
          navigate(`/p/${projectId}/${remainingCanvas.id}`)
        }
      }
    } catch (error) {
      console.error('Error deleting canvas:', error)
    }
  }

  if (isCollapsed) {
    return (
      <div className="canvas-sidebar collapsed">
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(false)}
        >
          →
        </button>
      </div>
    )
  }

  return (
    <div className="canvas-sidebar">
      <div className="sidebar-header">
        <h3>Pages</h3>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(true)}
        >
          ←
        </button>
      </div>

      <div className="canvas-list">
        {canvases.map((canvas) => (
          <div
            key={canvas.id}
            className={`canvas-item ${canvas.id === activeCanvasId ? 'active' : ''}`}
            onClick={() => handleSelectCanvas(canvas.id)}
          >
            <div className="canvas-thumbnail">
              {canvas.thumbnail ? (
                <img src={canvas.thumbnail} alt={canvas.name} />
              ) : (
                <div className="canvas-thumbnail-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                  </svg>
                </div>
              )}
            </div>
            <span className="canvas-name">{canvas.name}</span>
            <button
              className="canvas-delete"
              onClick={(e) => handleDeleteCanvas(canvas.id, e)}
              title="Delete canvas"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="btn-add-canvas" onClick={handleCreateCanvas}>
        + New Page
      </button>
    </div>
  )
}
```

**Step 2: Create CanvasSidebar styles**

Create `src/components/canvas/CanvasSidebar.css`:

```css
.canvas-sidebar {
  width: 240px;
  background: #F9FAFB;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.canvas-sidebar.collapsed {
  width: 48px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.sidebar-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  color: #6B7280;
}

.sidebar-toggle:hover {
  color: #1F2937;
}

.canvas-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.canvas-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.canvas-item:hover {
  background: #E5E7EB;
}

.canvas-item.active {
  background: #DBEAFE;
}

.canvas-thumbnail {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.canvas-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.canvas-thumbnail-placeholder {
  color: #9CA3AF;
}

.canvas-name {
  flex: 1;
  font-size: 0.875rem;
  color: #1F2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.canvas-delete {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: none;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  border-radius: 4px;
}

.canvas-item:hover .canvas-delete {
  display: flex;
}

.canvas-delete:hover {
  background: #FEE2E2;
  color: #DC2626;
}

.btn-add-canvas {
  margin: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  color: #3B82F6;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-add-canvas:hover {
  background: #F3F4F6;
  border-color: #3B82F6;
}
```

**Step 3: Create ProjectView component**

Create `src/pages/ProjectView.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { getProject, getProjectCanvases, updateProject } from '@/services/firestore'
import { Canvas } from '@/components/canvas/Canvas'
import { CanvasSidebar } from '@/components/canvas/CanvasSidebar'
import type { Project, ProjectMetadata } from '@/types/project'
import type { Presence } from '@/types/user'

export function ProjectView() {
  const { projectId, canvasId } = useParams<{ projectId: string; canvasId?: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [canvases, setCanvases] = useState<ProjectMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUsers, setActiveUsers] = useState<Presence[]>([])
  const [presenceCleanup, setPresenceCleanup] = useState<{ fn: (() => Promise<void>) | null }>({ fn: null })
  const [isVegaOpen, setIsVegaOpen] = useState(false)

  const loadProjectData = async () => {
    if (!projectId) return

    try {
      const [projectData, projectCanvases] = await Promise.all([
        getProject(projectId),
        getProjectCanvases(projectId),
      ])

      setProject(projectData)
      setCanvases(projectCanvases)

      // Update last accessed
      if (projectData) {
        await updateProject(projectId, { lastAccessed: new Date() })
      }

      // Navigate to first canvas if no canvas specified
      if (!canvasId && projectCanvases.length > 0) {
        navigate(`/p/${projectId}/${projectCanvases[0].id}`, { replace: true })
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjectData()
  }, [projectId, canvasId])

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading project...</div>
  }

  if (!project || !projectId) {
    return <div style={{ padding: '2rem' }}>Project not found</div>
  }

  if (!canvasId || canvases.length === 0) {
    return <div style={{ padding: '2rem' }}>No canvases found</div>
  }

  const canvasPath = `projects/${projectId}/canvases/${canvasId}`

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <CanvasSidebar
        projectId={projectId}
        canvases={canvases}
        activeCanvasId={canvasId}
        onCanvasesChange={loadProjectData}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          key={canvasId}
          canvasPath={canvasPath}
          onPresenceChange={setActiveUsers}
          onMountCleanup={(fn) => setPresenceCleanup({ fn })}
          onAskVega={() => setIsVegaOpen(true)}
          isVegaOpen={isVegaOpen}
        />
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add src/pages/ProjectView.tsx src/components/canvas/CanvasSidebar.tsx src/components/canvas/CanvasSidebar.css
git commit -m "feat: create ProjectView and CanvasSidebar components"
```

---

## Task 7: Update Canvas Component to Support Dynamic Canvas Paths

**Files:**
- Modify: `src/components/canvas/Canvas.tsx:40-45` and throughout

**Step 1: Update Canvas component props**

Modify `src/components/canvas/Canvas.tsx`:

Find the Canvas component props (around line 45) and update:

```typescript
interface CanvasProps {
  canvasPath: string  // Changed from canvasId
  onPresenceChange?: (users: Presence[]) => void
  onMountCleanup?: (cleanup: () => Promise<void>) => void
  onAskVega?: () => void
  isVegaOpen?: boolean
}

export function Canvas({
  canvasPath,  // Changed from canvasId
  onPresenceChange,
  onMountCleanup,
  onAskVega,
  isVegaOpen = false
}: CanvasProps) {
```

**Step 2: Update all Firestore calls to use canvasPath**

Find and replace throughout the Canvas component:

- Replace `createShape(canvasId,` with `createShape(canvasPath,`
- Replace `updateShape(canvasId,` with `updateShape(canvasPath,`
- Replace `deleteShape(canvasId,` with `deleteShape(canvasPath,`
- Replace `getShapes(canvasId)` with `getShapes(canvasPath)`
- Replace `subscribeToShapes(canvasId,` with `subscribeToShapes(canvasPath,`

**Step 3: Extract canvasId from canvasPath for RTDB**

Add this near the top of the Canvas component:

```typescript
// Extract canvasId from path for RTDB (projects/x/canvases/y -> y)
const canvasId = canvasPath.includes('/')
  ? canvasPath.split('/').pop() || canvasPath
  : canvasPath
```

**Step 4: Keep RTDB calls using canvasId**

RTDB calls should continue using the extracted `canvasId`:
- `writeBatchShapePositions(canvasId,`
- `clearShapePositions(canvasId,`
- `subscribeToLivePositions(canvasId,`
- `updateCursorPosition(canvasId,`
- `subscribeToCursors(canvasId,`
- etc.

**Step 5: Commit**

```bash
git add src/components/canvas/Canvas.tsx
git commit -m "refactor: update Canvas component to use dynamic canvasPath"
```

---

## Task 8: Update App.tsx to Use React Router

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

**Step 1: Update main.tsx to use RouterProvider**

Modify `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './components/auth/AuthProvider'
import { router } from './routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
```

**Step 2: Update App.tsx to be a layout component**

Modify `src/App.tsx`:

```typescript
import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from './components/auth/AuthProvider'
import { LoginButton } from './components/auth/LoginButton'
import { DevLogin } from './components/auth/DevLogin'

function App() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      // Redirect logged-in users to projects page
      navigate('/projects')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-container">
        {/* Keep existing login UI */}
        <div className="stars-background">
          {/* All existing star/planet animations */}
          {/* ... (keep as is) ... */}
        </div>
        <div className="login-content">
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            maxWidth: '420px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img
                src="/canvisia-logo.png"
                alt="Canvisia Logo"
                style={{
                  width: '180px',
                  height: '180px',
                  filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.4))'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              color: 'white',
              fontWeight: '300',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4), 0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              letterSpacing: '2px',
              textRendering: 'optimizeLegibility'
            }}>
              Canvisia
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2.5rem',
              textAlign: 'center',
              fontWeight: '400'
            }}>
              Realize your shared visions
            </p>
            <LoginButton />
            <DevLogin />
          </div>
        </div>
      </div>
    )
  }

  // Render nested routes
  return <Outlet />
}

export default App
```

**Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "refactor: update App to use React Router with nested routes"
```

---

## Task 9: Update AIChat Component to Use Canvas Path

**Files:**
- Modify: `src/components/ai/AIChat.tsx` (update canvasId prop to canvasPath)

**Step 1: Update AIChat props**

Modify `src/components/ai/AIChat.tsx`:

```typescript
interface AIChatProps {
  canvasPath: string  // Changed from canvasId
  isOpen: boolean
  onClose: () => void
}

export function AIChat({ canvasPath, isOpen, onClose }: AIChatProps) {
  // Extract canvasId for RTDB if needed
  const canvasId = canvasPath.includes('/')
    ? canvasPath.split('/').pop() || canvasPath
    : canvasPath

  // ... rest of component
}
```

**Step 2: Update ProjectView to pass canvasPath**

Modify `src/pages/ProjectView.tsx`:

```typescript
// Add AIChat import at top
import { AIChat } from '@/components/ai/AIChat'

// In the return statement, add AIChat
return (
  <div style={{ display: 'flex', height: '100vh' }}>
    <CanvasSidebar
      projectId={projectId}
      canvases={canvases}
      activeCanvasId={canvasId}
      onCanvasesChange={loadProjectData}
    />
    <div style={{ flex: 1, position: 'relative' }}>
      <Canvas
        key={canvasId}
        canvasPath={canvasPath}
        onPresenceChange={setActiveUsers}
        onMountCleanup={(fn) => setPresenceCleanup({ fn })}
        onAskVega={() => setIsVegaOpen(true)}
        isVegaOpen={isVegaOpen}
      />
      <AIChat
        canvasPath={canvasPath}
        isOpen={isVegaOpen}
        onClose={() => setIsVegaOpen(false)}
      />
    </div>
  </div>
)
```

**Step 3: Commit**

```bash
git add src/components/ai/AIChat.tsx src/pages/ProjectView.tsx
git commit -m "refactor: update AIChat to use canvasPath"
```

---

## Task 10: Update All AI Helper Functions

**Files:**
- Modify: `src/utils/aiHelpers.ts` (all execute functions)

**Step 1: Update function signatures to use canvasPath**

Find all execute functions and update their first parameter:

```typescript
export async function executeCreateShape(
  canvasPath: string,  // Changed from canvasId
  userId: string,
  input: { ... },
  viewport: Viewport
): Promise<void> {
  // Extract canvasId for RTDB if needed
  const canvasId = canvasPath.includes('/')
    ? canvasPath.split('/').pop() || canvasPath
    : canvasPath

  // Use canvasPath for Firestore calls
  await createShape(canvasPath, shape)
}
```

**Step 2: Apply to all execute functions**

Update these functions:
- `executeCreateMultipleShapes`
- `executeCreateShape`
- `executeCreateText`
- `executeCreateArrow`
- `executeMoveElement`
- `executeResizeElement`
- `executeRotateElement`
- `executeArrangeElements`
- `executeAlignElements`

Pattern for each:
1. Change parameter from `canvasId` to `canvasPath`
2. Extract `canvasId` for RTDB calls
3. Use `canvasPath` for Firestore calls
4. Use `canvasId` for RTDB calls

**Step 3: Commit**

```bash
git add src/utils/aiHelpers.ts
git commit -m "refactor: update AI helper functions to use canvasPath"
```

---

## Task 11: Add Firestore Security Rules

**Files:**
- Create: `firestore.rules`

**Step 1: Create security rules file**

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user has permission
    function hasPermission(projectId, role) {
      let permDoc = get(/databases/$(database)/documents/permissions/$(projectId + '_' + request.auth.uid));
      return permDoc != null && permDoc.data.role == role;
    }

    function hasAnyPermission(projectId) {
      return exists(/databases/$(database)/documents/permissions/$(projectId + '_' + request.auth.uid));
    }

    // Projects: read if has permission, write if owner
    match /projects/{projectId} {
      allow read: if hasAnyPermission(projectId);
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if hasPermission(projectId, 'owner');

      // Canvases: inherit project permissions
      match /canvases/{canvasId} {
        allow read: if hasAnyPermission(projectId);
        allow write: if hasPermission(projectId, 'owner') || hasPermission(projectId, 'editor');

        // Objects: inherit canvas permissions
        match /objects/{objectId} {
          allow read: if hasAnyPermission(projectId);
          allow write: if hasPermission(projectId, 'owner') || hasPermission(projectId, 'editor');
        }
      }
    }

    // Permissions: owner can manage, users can read their own
    match /permissions/{permissionId} {
      allow read: if request.auth != null && permissionId.matches('.*_' + request.auth.uid);
      allow create, update, delete: if request.auth != null &&
        hasPermission(resource.data.projectId, 'owner');
    }

    // Legacy canvases collection (read-only for backward compatibility)
    match /canvases/{canvasId} {
      allow read: if request.auth != null;
      allow write: if false;  // Prevent new writes to old structure

      match /objects/{objectId} {
        allow read: if request.auth != null;
        allow write: if false;
      }
    }
  }
}
```

**Step 2: Deploy security rules**

Run:
```bash
firebase deploy --only firestore:rules
```

Expected: Rules deployed successfully

**Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat: add Firestore security rules for multi-project system"
```

---

## Task 12: Add Header Component with Project Name

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Step 1: Update Header to show project name**

Modify `src/components/layout/Header.tsx` to accept project name:

```typescript
import { useNavigate } from 'react-router-dom'
// ... existing imports ...

interface HeaderProps {
  activeUsers: Presence[]
  onSignOut?: (() => Promise<void>) | undefined
  projectName?: string  // Add this
}

export function Header({ activeUsers, onSignOut, projectName }: HeaderProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut()
    }
    await signOut()
  }

  const handleBackToProjects = () => {
    navigate('/projects')
  }

  return (
    <header style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      background: 'white',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={handleBackToProjects}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.25rem',
          }}
          title="Back to projects"
        >
          ←
        </button>
        {projectName && (
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            {projectName}
          </h1>
        )}
      </div>

      {/* Existing active users and sign out UI */}
      {/* ... */}
    </header>
  )
}
```

**Step 2: Update ProjectView to pass project name**

Modify `src/pages/ProjectView.tsx`:

```typescript
import { Header } from '@/components/layout/Header'

// In the return statement
return (
  <div style={{ display: 'flex', height: '100vh' }}>
    <CanvasSidebar
      projectId={projectId}
      canvases={canvases}
      activeCanvasId={canvasId}
      onCanvasesChange={loadProjectData}
    />
    <div style={{ flex: 1, position: 'relative' }}>
      <Header
        activeUsers={activeUsers}
        onSignOut={presenceCleanup.fn || undefined}
        projectName={project.name}
      />
      <Canvas
        key={canvasId}
        canvasPath={canvasPath}
        onPresenceChange={setActiveUsers}
        onMountCleanup={(fn) => setPresenceCleanup({ fn })}
        onAskVega={() => setIsVegaOpen(true)}
        isVegaOpen={isVegaOpen}
      />
      <AIChat
        canvasPath={canvasPath}
        isOpen={isVegaOpen}
        onClose={() => setIsVegaOpen(false)}
      />
    </div>
  </div>
)
```

**Step 3: Commit**

```bash
git add src/components/layout/Header.tsx src/pages/ProjectView.tsx
git commit -m "feat: add project name to header and back button"
```

---

## Task 13: Test End-to-End Flow

**Files:**
- None (manual testing)

**Step 1: Start development server**

Run:
```bash
npm run dev
```

Expected: Server starts on http://localhost:5173

**Step 2: Test user flow**

1. Navigate to http://localhost:5173
2. Login with test account
3. Should redirect to `/projects`
4. Click "New Project"
5. Should navigate to `/p/{projectId}` with one canvas
6. Canvas should load and allow drawing
7. Click "+ New Page" in sidebar
8. Should create second canvas and navigate to it
9. Click first canvas in sidebar
10. Should switch back to first canvas
11. Click back arrow in header
12. Should return to projects page

**Step 3: Verify data in Firestore**

1. Open Firebase console
2. Navigate to Firestore
3. Verify `projects` collection has your project
4. Verify nested `canvases` subcollection
5. Verify nested `objects` subcollection
6. Verify `permissions` collection has owner permission

**Step 4: If tests pass, commit**

```bash
git add -A
git commit -m "test: verify end-to-end multi-project flow"
```

---

## Task 14: Final Cleanup and Documentation

**Files:**
- Update: `README.md`
- Create: `docs/multi-project-architecture.md`

**Step 1: Update README**

Add to `README.md`:

```markdown
## Multi-Project System

Canvisia now supports multiple projects, each with multiple canvases (pages).

### URL Structure

- `/projects` - Projects list page
- `/p/:projectId` - Open project (first canvas)
- `/p/:projectId/:canvasId` - Open specific canvas

### Data Structure

```
projects/{projectId}
  ├── metadata (name, owner, timestamps)
  └── canvases/{canvasId}
      ├── metadata (name, order, settings)
      └── objects/{objectId}

permissions/{projectId}_{userId}
  └── role (owner|editor|viewer)
```

### Key Features

- Create and manage multiple projects
- Each project can have multiple canvases
- Share projects via URL with per-user permissions
- Canvas sidebar for easy navigation
- Backward compatible with legacy single-canvas structure
```

**Step 2: Create architecture documentation**

Create `docs/multi-project-architecture.md`:

```markdown
# Multi-Project System Architecture

## Overview

This document describes the multi-project system architecture for Canvisia.

## Data Model

### Firestore Collections

#### `projects/{projectId}`
- `id`: Project ID
- `name`: Project name
- `ownerId`: Owner user ID
- `thumbnail`: Preview image (nullable)
- `createdAt`: Creation timestamp
- `lastModified`: Last modification timestamp
- `lastAccessed`: Last access timestamp

#### `projects/{projectId}/canvases/{canvasId}`
- `id`: Canvas ID
- `name`: Canvas name
- `order`: Display order
- `thumbnail`: Preview image (nullable)
- `settings`: Canvas settings (background, grid)
- `createdAt`: Creation timestamp
- `lastModified`: Last modification timestamp

#### `projects/{projectId}/canvases/{canvasId}/objects/{objectId}`
- Same as existing shape structure

#### `permissions/{projectId}_{userId}`
- `projectId`: Project ID
- `userId`: User ID
- `userEmail`: User email
- `role`: 'owner' | 'editor' | 'viewer'
- `invitedBy`: Inviter user ID
- `invitedAt`: Invitation timestamp
- `acceptedAt`: Acceptance timestamp

### RTDB Structure (unchanged)

```
live-positions/{canvasId}/{shapeId}
cursors/{canvasId}/{userId}
presence/{canvasId}/{userId}
```

## Component Architecture

```
App (layout)
├── ProjectsPage
│   └── ProjectGrid
│       └── ProjectCard
└── ProjectView
    ├── Header
    ├── CanvasSidebar
    │   └── CanvasItem
    ├── Canvas (existing)
    └── AIChat
```

## Routing

- `/` - Root (redirects to /projects)
- `/projects` - Projects list
- `/p/:projectId` - Project view (redirects to first canvas)
- `/p/:projectId/:canvasId` - Canvas view

## Migration Strategy

- Legacy `canvases/{canvasId}/objects` remains read-only
- New projects use `projects/{projectId}/canvases/{canvasId}/objects`
- Firestore service functions support both formats for backward compatibility
- RTDB structure unchanged

## Security

- Firestore rules enforce per-user permissions
- Permission checks at project level cascade to canvases and objects
- Viewers can read, Editors can write, Owners can manage permissions
```

**Step 3: Final commit**

```bash
git add README.md docs/multi-project-architecture.md
git commit -m "docs: add multi-project system documentation"
```

---

## Completion Checklist

- [ ] All TypeScript types created
- [ ] Firestore service functions implemented
- [ ] React Router configured
- [ ] ProjectsPage component created
- [ ] ProjectView and CanvasSidebar created
- [ ] Canvas component updated to use dynamic paths
- [ ] App.tsx refactored for routing
- [ ] AIChat updated
- [ ] AI helpers updated
- [ ] Firestore security rules deployed
- [ ] Header updated with project name
- [ ] End-to-end testing completed
- [ ] Documentation updated

## Success Criteria

✅ Users can create multiple projects from /projects page
✅ Each project can have multiple canvases with independent data
✅ Canvas switching works seamlessly
✅ Direct URLs work: `/p/{projectId}/{canvasId}`
✅ Sharing works with per-user permissions
✅ Real-time collaboration works per-canvas
✅ Empty states guide users
✅ Edge cases handled gracefully

---

**Next Steps:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.
