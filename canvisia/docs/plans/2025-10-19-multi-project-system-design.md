# Multi-Project System Design

**Date:** 2025-10-19
**Feature:** Projects Page with Multiple Canvases per Project
**Status:** Design Complete, Ready for Implementation

## Overview

Transform Canvisia from a single-canvas application to a multi-project system similar to Figma, where users can:
- Create and manage multiple projects
- Have multiple canvases (pages) within each project
- Share projects via URL with granular permissions
- Navigate between projects and canvases seamlessly

## Design Decisions

### Project-Canvas Relationship
**Chosen Model:** 1 project = multiple canvases (Option B)
- Each project can contain multiple independent canvases/pages
- Similar to Figma's file structure
- Allows users to organize related work within a single project

### Navigation Pattern
**Chosen Model:** Sidebar list (Option B)
- Canvases listed in a collapsible left sidebar
- Shows canvas thumbnails and names
- Can hide/show for more canvas space
- More scalable than tabs for many canvases

### Permission Model
**Chosen Model:** Per-user permissions with roles (Option C)
- Owner can invite specific users by email
- Three roles: Owner, Editor, Viewer
- Most secure and flexible approach
- Supports collaborative workflows

### URL Structure
**Chosen Model:** `/p/:projectId/:canvasId?` (Option B)
- Clean, shareable URLs
- `/p/` prefix indicates project
- Canvas ID optional (defaults to first canvas)
- Example: `/p/abc123` or `/p/abc123/page-5`

### Project Metadata
**Chosen Model:** Standard metadata (Option B)
- Name, owner, timestamps
- Canvas IDs list
- Thumbnail/preview image
- Last accessed date
- Collaborators managed separately

### Canvas Metadata
**Chosen Model:** Standard metadata (Option B)
- Name, timestamps
- Thumbnail preview
- Canvas settings (background, grid)
- Order/position in project

### First-Time User Experience
**Chosen Model:** Empty projects page (Option A)
- Show empty state with "Create Project" button
- User explicitly creates first project
- More intentional, clear empty state

### Migration Strategy
**Chosen Model:** Archive existing data (Option B)
- Leave old `canvases/default-canvas/objects` in Firestore
- Don't display in UI
- All users start with clean projects page
- Old data preserved for potential future import

## Data Model

### Firestore Structure

```
projects/{projectId}
  - id: string
  - name: string
  - ownerId: string
  - thumbnail: string | null
  - createdAt: Timestamp
  - lastModified: Timestamp
  - lastAccessed: Timestamp

projects/{projectId}/canvases/{canvasId}
  - id: string
  - name: string
  - order: number
  - thumbnail: string | null
  - settings: {
      backgroundColor: string
      gridEnabled: boolean
    }
  - createdAt: Timestamp
  - lastModified: Timestamp

projects/{projectId}/canvases/{canvasId}/objects/{objectId}
  - (existing Shape structure)

permissions/{projectId}_{userId}
  - projectId: string
  - userId: string
  - userEmail: string
  - role: 'owner' | 'editor' | 'viewer'
  - invitedBy: string
  - invitedAt: Timestamp
  - acceptedAt: Timestamp | null
```

### RTDB Structure (unchanged)

```
live-positions/{canvasId}/{shapeId}
cursors/{canvasId}/{userId}
presence/{canvasId}/{userId}
```

Note: canvasId references the nested canvas ID. Each canvas has independent RTDB data.

### TypeScript Types

```typescript
interface Project {
  id: string
  name: string
  ownerId: string
  thumbnail: string | null
  createdAt: Date
  lastModified: Date
  lastAccessed: Date
}

interface Canvas {
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

interface Permission {
  projectId: string
  userId: string
  userEmail: string
  role: 'owner' | 'editor' | 'viewer'
  invitedBy: string
  invitedAt: Date
  acceptedAt: Date | null
}

type PermissionRole = 'owner' | 'editor' | 'viewer'
```

## Routing Structure

### URL Routes

```
/projects                    // Projects list page (after login)
/p/:projectId                // Opens project with first canvas
/p/:projectId/:canvasId      // Opens specific canvas in project
```

### React Router Setup

```typescript
<Routes>
  <Route path="/projects" element={<ProjectsPage />} />
  <Route path="/p/:projectId" element={<ProjectView />}>
    <Route path=":canvasId" element={<Canvas />} />
    <Route index element={<Canvas />} /> {/* defaults to first canvas */}
  </Route>
</Routes>
```

### Navigation Flow

1. User logs in → redirect to `/projects`
2. User clicks project card → navigate to `/p/{projectId}` (loads first canvas)
3. User clicks canvas in sidebar → navigate to `/p/{projectId}/{canvasId}`
4. Browser back/forward works naturally
5. Direct URL sharing: `/p/abc123/page-5` opens exactly that canvas

### Component Hierarchy

```
App
  └─ AuthProvider
      ├─ ProjectsPage (if on /projects)
      │   └─ ProjectGrid
      │       └─ ProjectCard (click → navigate to /p/:projectId)
      └─ ProjectView (if on /p/:projectId)
          ├─ Header (with project name)
          ├─ CanvasSidebar (list of canvases, click → navigate)
          └─ Canvas (existing component, receives canvasId from URL)
```

## Projects Page UI

### Layout

**Header Section:**
- User avatar dropdown (top-left) with sign-out option
- Search bar for filtering projects
- "New Project" button (primary action)

**Tab Navigation:**
- "Recently viewed" (default tab)
- "Shared with me"
- "Owned by me"

**Project Grid:**
- Card-based layout, responsive (3-4 columns on desktop)
- Each card shows:
  - Thumbnail preview (canvas snapshot)
  - Project name (editable on hover)
  - Last modified timestamp ("Edited 2 hours ago")
  - Owner info (if shared)
  - Hover: Right-click menu with options:
    - Open
    - Open in new tab
    - Rename
    - Duplicate
    - Share (opens share modal)
    - Delete/Move to trash

**Empty States:**
- No projects: Large "Create your first project" button with illustration
- No search results: "No projects found" message

### Project Creation Flow

1. User clicks "New Project" button
2. Create project document with name "Untitled Project"
3. Auto-create first canvas named "Page 1"
4. Create owner permission document
5. Navigate to `/p/{newProjectId}`
6. User can rename project from header

### Data Fetching

- Query `permissions` collection where `userId == currentUser.id`
- Load all accessible project metadata
- Real-time updates using Firestore `onSnapshot`
- Sort by `lastAccessed` for "Recently viewed" tab

## Canvas Sidebar & Navigation

### Sidebar Layout

**Structure:**
- Collapsible left sidebar (toggle button to hide/show)
- Width: ~240px when open
- Sections:
  - Project name at top (editable, click to rename)
  - "Pages" section with list of canvases
  - "+ New Page" button at bottom of list

**Canvas/Page List Items:**
- Small thumbnail preview (50x50px)
- Canvas name (editable inline)
- Order indicator
- Active state (highlight current canvas)
- Right-click context menu:
  - Rename
  - Duplicate
  - Delete (with confirmation if has objects)

### Canvas Switching Behavior

1. User clicks canvas in sidebar
2. Navigate to `/p/{projectId}/{canvasId}`
3. URL changes, Canvas component unmounts/remounts
4. Unsubscribe from old canvas's Firestore/RTDB subscriptions
5. Subscribe to new canvas's Firestore objects and RTDB data
6. Presence/cursors update to new canvas

### New Canvas Creation

1. User clicks "+ New Page" button
2. Create new canvas document in Firestore
3. Set name: "Page {N}" (auto-numbered)
4. Set order: last position + 1
5. Navigate to `/p/{projectId}/{newCanvasId}`

### State Management

- Project-level state (metadata, canvas list) in `ProjectView` component
- Canvas-level state (shapes, viewport, selection) stays in existing `Canvas` component
- Each canvas is independent with its own data subscriptions

## Permissions & Sharing System

### Share Modal UI

**Triggered from:**
- Project card context menu → "Share"
- Header button when viewing project

**Modal Contents:**

1. **Header:** "Share {Project Name}"

2. **Link Sharing Section:**
   - Copy link button (copies full URL: `/p/{projectId}`)
   - Link access dropdown: "Anyone with link can view/edit"

3. **Invite Section:**
   - Email input field
   - Role dropdown: Viewer | Editor | Owner
   - "Invite" button

4. **Current Collaborators List:**
   - Avatar, email, role
   - Role dropdown (owner can change)
   - Remove button (owner only, can't remove self)

### Permission Roles

```typescript
'owner'  → Full access: edit, delete, share, transfer ownership
'editor' → Can edit canvases, create pages, but not share or delete project
'viewer' → Read-only: see all canvases, cursors, but cannot edit
```

### Permission Flow

1. Owner opens share modal and enters collaborator email + role
2. Create `permissions/{projectId}_{userId}` document
3. Invited user logs in and sees project in "Shared with me" tab
4. User clicks project → System checks permissions doc → Loads with appropriate access level

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check permission
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
  }
}
```

### Permission Enforcement

**Backend:** Firestore security rules (shown above)

**Frontend:**
- Hide/disable UI elements based on role
- Check permission before showing "Share", "Delete", "Edit" buttons
- Real-time listener on permissions doc to detect role changes
- Downgrade capabilities immediately if permission changes

## Migration Strategy

### Handling Existing "default-canvas"

**Approach:** Archive and start fresh

- Old `canvases/default-canvas/objects` collection remains in Firestore
- Not displayed in new UI
- All users see empty projects page on first login
- Old data preserved for potential future "import from legacy" feature

### First Login Experience

1. User logs in after deployment
2. Redirected to `/projects`
3. Projects page is empty (no auto-created project)
4. Shows empty state: "Create your first project" button
5. User clicks button → creates first project → navigates to canvas

## Edge Cases & Error Handling

### Invalid Project URL

**Scenario:** User visits `/p/nonexistent-id`

**Handling:**
1. Attempt to load project document
2. Check if project exists and user has permission
3. If no access: Show "Project not found or you don't have access" page
4. Offer "Go to Projects" button to return to safety

### Invalid Canvas URL

**Scenario:** User visits `/p/valid-project/invalid-canvas`

**Handling:**
1. Detect canvas doesn't exist in project
2. Redirect to `/p/{projectId}` (first canvas)
3. Show toast notification: "Canvas not found, showing first page"

### No Canvases in Project

**Scenario:** User deletes all canvases in a project

**Handling:**
1. Auto-create new "Page 1" when last canvas is deleted
2. Prevents empty project state
3. OR: Show empty project state with "Create first page" button

### Project with No Owner

**Scenario:** Owner account is deleted

**Handling:**
1. Transfer ownership to another collaborator (first editor in list)
2. Update permissions doc to reflect new owner
3. OR: Mark project as orphaned and archive it

### Concurrent Project Name Edits

**Scenario:** Two users rename project simultaneously

**Handling:**
- Use Firestore's optimistic updates
- Last write wins (standard Firestore behavior)
- Both users see the final state after sync

### Permission Changes While Viewing

**Scenario:** User's permission changes while viewing project

**Handling:**
1. Real-time listener on permissions doc detects change
2. Immediately update UI capabilities (hide edit buttons if downgraded to viewer)
3. If permission removed entirely: Redirect to `/projects` with toast message
4. Show notification: "Your access level has changed"

## Implementation Phases

### Phase 1: Data Layer
- Create TypeScript types (Project, Canvas, Permission)
- Implement Firestore service functions (CRUD for projects, canvases, permissions)
- Update existing Canvas component to accept `projectId` and `canvasId` props
- Test data operations in isolation

### Phase 2: Routing & Navigation
- Set up React Router with new routes
- Create ProjectView wrapper component
- Update App.tsx to handle routing
- Implement redirect logic (login → /projects)

### Phase 3: Projects Page
- Create ProjectsPage component
- Implement ProjectGrid and ProjectCard components
- Add project creation flow
- Implement search and filtering
- Add empty states

### Phase 4: Canvas Sidebar
- Create CanvasSidebar component
- Implement canvas list with thumbnails
- Add canvas creation and navigation
- Implement canvas rename/delete

### Phase 5: Permissions & Sharing
- Create ShareModal component
- Implement invite flow (create permission docs)
- Add collaborator management UI
- Implement Firestore security rules
- Test permission enforcement

### Phase 6: Polish & Migration
- Generate thumbnails for projects and canvases
- Add loading states and error boundaries
- Implement duplicate project/canvas
- Add keyboard shortcuts
- Testing and bug fixes

## Success Criteria

- [ ] Users can create multiple projects from /projects page
- [ ] Each project can have multiple canvases with independent data
- [ ] Canvas switching works seamlessly with correct data isolation
- [ ] Direct URLs work: `/p/{projectId}/{canvasId}` loads correct canvas
- [ ] Sharing: Users can invite collaborators with specific roles
- [ ] Permissions enforced: Viewers can't edit, editors can't delete/share
- [ ] Real-time collaboration works per-canvas (presence, cursors, live updates)
- [ ] Empty states guide users to create first project/canvas
- [ ] Edge cases handled gracefully (404s, permission changes, etc.)

## Future Enhancements (Out of Scope)

- Drag-to-reorder canvases
- Canvas templates
- Project folders/organization
- Team workspaces
- Version history per canvas
- Export project as ZIP
- Canvas duplication across projects
- Public gallery of projects

---

**Next Steps:** Proceed to implementation plan creation using writing-plans skill.
