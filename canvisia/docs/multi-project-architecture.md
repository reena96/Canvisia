# Multi-Project System Architecture

## Overview

This document describes the multi-project system architecture for Canvisia, which enables users to create and manage multiple projects, each containing multiple canvases (pages).

## Data Model

### Firestore Collections

#### `projects/{projectId}`
- `id`: Project ID (string)
- `name`: Project name (string)
- `ownerId`: Owner user ID (string)
- `thumbnail`: Preview image URL (string | null)
- `createdAt`: Creation timestamp (Date)
- `lastModified`: Last modification timestamp (Date)
- `lastAccessed`: Last access timestamp (Date)

#### `projects/{projectId}/canvases/{canvasId}`
- `id`: Canvas ID (string)
- `name`: Canvas name (string)
- `order`: Display order (number)
- `thumbnail`: Preview image URL (string | null)
- `settings`: Canvas settings object
  - `backgroundColor`: Background color (string)
  - `gridEnabled`: Grid visibility (boolean)
- `createdAt`: Creation timestamp (Date)
- `lastModified`: Last modification timestamp (Date)

#### `projects/{projectId}/canvases/{canvasId}/objects/{objectId}`
- Same as existing shape structure (Rectangle, Ellipse, Arrow, Text, etc.)
- All shape properties preserved from original implementation

#### `permissions/{projectId}_{userId}`
- `projectId`: Project ID (string)
- `userId`: User ID (string)
- `userEmail`: User email (string)
- `role`: Permission role - 'owner' | 'editor' | 'viewer'
- `invitedBy`: Inviter user ID (string)
- `invitedAt`: Invitation timestamp (Date)
- `acceptedAt`: Acceptance timestamp (Date | null)

### RTDB Structure (Unchanged)

The Real-time Database structure remains unchanged to maintain real-time collaboration features:

```
live-positions/{canvasId}/{shapeId}
  - x: number
  - y: number
  - updatedBy: string
  - updatedAt: timestamp

cursors/{canvasId}/{userId}
  - x: number
  - y: number
  - color: string
  - name: string

presence/{canvasId}/{userId}
  - userId: string
  - userName: string
  - color: string
  - isActive: boolean
  - lastSeen: timestamp
```

## Component Architecture

```
App (layout component)
├── ProjectsPage
│   └── ProjectGrid
│       └── ProjectCard (for each project)
└── ProjectView
    ├── Header (with project name and back button)
    ├── CanvasSidebar
    │   └── CanvasItem (for each canvas)
    ├── Canvas (existing component, now with dynamic paths)
    └── AIChat
```

### Key Components

**ProjectsPage** (`src/pages/ProjectsPage.tsx`)
- Displays all user projects in a grid
- Tabs: Recently viewed, Shared with me, Owned by me
- Create new project button
- Click to open project

**ProjectView** (`src/pages/ProjectView.tsx`)
- Container for project and canvas navigation
- Loads project data and canvases
- Manages active canvas selection
- Renders Header, CanvasSidebar, Canvas, and AIChat

**CanvasSidebar** (`src/components/canvas/CanvasSidebar.tsx`)
- Lists all canvases in current project
- Create new canvas button
- Delete canvas functionality
- Navigate between canvases
- Collapsible sidebar

**Canvas** (`src/components/canvas/Canvas.tsx`)
- Updated to accept `canvasPath` instead of `canvasId`
- Extracts canvasId from path for RTDB operations
- Uses full path for Firestore operations

**Header** (`src/components/layout/Header.tsx`)
- Displays project name
- Back button to return to projects page
- User presence indicators
- Sign out button

## Routing

React Router configuration in `src/routes.tsx`:

- `/` - Root (redirects to /projects if authenticated)
- `/projects` - Projects list page
- `/p/:projectId` - Project view (redirects to first canvas)
- `/p/:projectId/:canvasId` - Specific canvas view

## Data Flow

### Creating a Project
1. User clicks "New Project" on ProjectsPage
2. `createProject(userId, projectName)` is called
3. Firestore creates:
   - Project document in `projects/{projectId}`
   - Owner permission in `permissions/{projectId}_{userId}`
   - Default canvas in `projects/{projectId}/canvases/{canvasId}`
4. User is navigated to `/p/{projectId}`

### Loading a Project
1. User navigates to `/p/{projectId}` or clicks project card
2. ProjectView component loads:
   - Project metadata via `getProject(projectId)`
   - Canvas list via `getProjectCanvases(projectId)`
3. If no canvas specified, redirects to first canvas
4. Canvas component loads shapes via `getShapes(canvasPath)`

### Creating a Canvas
1. User clicks "+ New Page" in CanvasSidebar
2. `createCanvas(projectId, canvasName)` is called
3. Firestore creates canvas document
4. User is navigated to new canvas

### Deleting a Canvas
1. User clicks delete button on canvas item
2. Confirmation dialog appears
3. `deleteCanvas(projectId, canvasId)` is called
4. Firestore deletes canvas and all its objects
5. If deleted canvas was active, navigates to project

## Migration Strategy

### Backward Compatibility

The system maintains backward compatibility with the legacy single-canvas structure:

**Legacy Structure** (read-only):
```
canvases/{canvasId}/objects/{objectId}
```

**New Structure**:
```
projects/{projectId}/canvases/{canvasId}/objects/{objectId}
```

### Path Resolution

All Firestore service functions (createShape, updateShape, deleteShape, etc.) support both formats:

```typescript
const objectsPath = canvasPath.includes('/')
  ? `${canvasPath}/objects`  // New format: "projects/x/canvases/y/objects"
  : `canvases/${canvasPath}/objects`  // Old format: "canvases/canvasId/objects"
```

### RTDB Compatibility

RTDB operations continue to use simple canvas IDs. When using new hierarchical paths, the canvasId is extracted:

```typescript
const canvasId = canvasPath.includes('/')
  ? canvasPath.split('/').pop() || canvasPath  // Extract "y" from "projects/x/canvases/y"
  : canvasPath  // Use as-is for legacy format
```

## Security

### Firestore Security Rules

Located in `firestore.rules`:

**Permission Checking:**
- Helper functions `hasPermission()` and `hasAnyPermission()` check user access
- Permissions stored in `permissions/{projectId}_{userId}` for efficient queries

**Project Access:**
- Read: User must have any permission (owner/editor/viewer)
- Create: Authenticated user, must set self as owner
- Update/Delete: Owner only

**Canvas Access:**
- Read: Inherits project read permission
- Write: Owner or Editor

**Object Access:**
- Read: Inherits canvas read permission
- Write: Owner or Editor

**Legacy Canvases:**
- Read: Any authenticated user
- Write: Disabled (prevents new writes to old structure)

## Key Design Decisions

### Hybrid Path System
- **Firestore**: Uses full hierarchical paths (`projects/{projectId}/canvases/{canvasId}`)
- **RTDB**: Uses simple canvas IDs for real-time operations
- **Rationale**: Firestore supports nested collections naturally, while RTDB benefits from flat structure for real-time updates

### Separate Permissions Collection
- Instead of subcollection under projects
- Enables efficient "find all projects user has access to" queries
- Document ID format: `{projectId}_{userId}` for fast lookups

### Canvas Path Propagation
- All components pass `canvasPath` string down the tree
- Each component extracts what it needs (full path or just ID)
- Maintains flexibility for future changes

### URL Structure
- Short URLs: `/p/{projectId}/{canvasId}`
- Easy to share and remember
- RESTful design

## Testing Considerations

### End-to-End Flow
1. Login
2. Create project
3. Project created with default canvas
4. Create additional canvas
5. Navigate between canvases
6. Draw shapes on canvas
7. Verify real-time updates
8. Return to projects page
9. Open existing project

### Edge Cases
- No projects (empty state)
- No canvases in project (empty state)
- Delete last canvas (prevented)
- Delete active canvas (navigates to project)
- Permission denied (handled in security rules)

## Future Enhancements

Potential improvements to consider:

1. **Canvas Reordering**: Drag-and-drop to reorder canvases in sidebar
2. **Canvas Thumbnails**: Auto-generate preview images
3. **Project Templates**: Pre-built project structures
4. **Sharing**: Invite users to projects with specific roles
5. **Project Settings**: Customize default canvas settings
6. **Canvas Duplication**: Copy canvas with all objects
7. **Project Archive**: Soft-delete for recovery
8. **Search**: Find projects by name or content
9. **Recent Projects**: Quick access to recently opened
10. **Folder Organization**: Group projects into folders
