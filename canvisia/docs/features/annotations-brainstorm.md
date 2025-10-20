# Annotations Feature: Brainstorming & Implementation Plan

## Overview
Add collaborative commenting/annotations on individual canvas objects. Users can comment on shapes, and comments appear as bubbles on the canvas. Clicking a comment opens the **Comments Panel on the RIGHT** side (reusing the sidebar infrastructure from AIChat).

**UI Reference**: See screenshots in `/Users/reena/Desktop/Screenshot 2025-10-20 at 2.15.*.png`

---

## What Already Exists ✅

### 1. Type Definitions (`src/types/shapes.ts`)
```typescript
export interface Annotation {
  id: string;
  shapeId: string;           // ID of the shape this annotation is attached to
  userId: string;
  userName: string;
  userColor: string;
  comment: string;
  createdAt: Date | number;
  updatedAt: Date | number;
  offsetX?: number;          // Position relative to shape (for manual repositioning)
  offsetY?: number;
  resolved?: boolean;        // Whether this annotation is resolved
}
```

**Status**: ✅ Complete - Good foundation with all necessary fields

---

### 2. Annotation Component (`src/components/canvas/Annotation.tsx`)
**What it does**:
- Renders a comment bubble on the canvas using Konva
- Shows user avatar (circular with initial)
- Displays username, timestamp ("8h ago"), and comment text
- Draws a connector line from annotation to shape
- Scales correctly with viewport zoom

**Visual Design**:
- White bubble with shadow and rounded corners
- Avatar with userColor background
- Clean typography (Inter font)
- Connector line in gray (#E5E7EB)

**Props**:
```typescript
interface AnnotationProps {
  annotation: AnnotationType
  shapeX: number       // Shape's position to attach to
  shapeY: number
  viewport: { zoom: number }
}
```

**Status**: ✅ Complete - Fully functional rendering component

---

### 3. Sidebar Infrastructure (AIChat Component)
**What exists**:
- Resizable sidebar that can be pinned left/right or floating
- Tab system with multiple tabs
- Firestore subscription for real-time updates
- User presence indicators (read/unread)
- Collapsible/expandable UI

**Structure** (`src/components/ai/AIChat.tsx`):
- Window states: `'normal'` | `'minimized'` | `'maximized'`
- Pin positions: `'floating'` | `'right'` | `'left'`
- Tab management with hide/rename/create functionality
- LocalStorage persistence for UI state

**Status**: ✅ Reusable - Can be adapted for Comments Panel

---

### 4. Toolbar Structure (`src/components/canvas/Toolbar.tsx`)
**What exists**:
- Bottom toolbar with all drawing tools
- Expandable tool groups (circles, polygons, arrows)
- "Ask Vega" button that opens AI chat

**Missing**: Comment/Annotation tool button

**Status**: ⚠️ Needs comment button added

---

## What Needs to Be Built 🏗️

### 1. Firestore Services (`src/services/firestore.ts`)

#### **Schema Structure**:
```
canvases/
  {canvasId}/
    annotations/          ← NEW COLLECTION
      {annotationId}/
        - id: string
        - shapeId: string
        - userId: string
        - userName: string
        - userColor: string
        - comment: string
        - createdAt: Timestamp
        - updatedAt: Timestamp
        - offsetX?: number
        - offsetY?: number
        - resolved: boolean
```

#### **Required Functions**:

```typescript
// Create annotation
async function addAnnotation(
  canvasId: string,
  annotation: Omit<Annotation, 'id'>
): Promise<string>

// Subscribe to annotations for a shape
function subscribeToShapeAnnotations(
  canvasId: string,
  shapeId: string,
  callback: (annotations: Annotation[]) => void
): Unsubscribe

// Subscribe to ALL annotations on canvas
function subscribeToAllAnnotations(
  canvasId: string,
  callback: (annotations: Annotation[]) => void
): Unsubscribe

// Update annotation
async function updateAnnotation(
  canvasId: string,
  annotationId: string,
  updates: Partial<Annotation>
): Promise<void>

// Delete annotation
async function deleteAnnotation(
  canvasId: string,
  annotationId: string
): Promise<void>

// Mark annotation as resolved/unresolved
async function toggleAnnotationResolved(
  canvasId: string,
  annotationId: string,
  resolved: boolean
): Promise<void>
```

---

### 2. Comments Panel Component (`src/components/canvas/CommentsPanel.tsx`)

**Purpose**: Right sidebar showing all annotations on the canvas, grouped by shape.

**UI Structure**:
```
┌─────────────────────────────┐
│ Comments            [X]      │  ← Header
├─────────────────────────────┤
│ [Search box]                 │
├─────────────────────────────┤
│                              │
│ ▼ Circle #1 (2 comments)    │  ← Shape grouping
│   ┌────────────────────┐    │
│   │ M  Reena  8h ago   │    │  ← Annotation card
│   │ This circle needs  │    │
│   │ to be bigger       │    │
│   │ [Resolve] [Reply]  │    │
│   └────────────────────┘    │
│   ┌────────────────────┐    │
│   │ J  John   2h ago   │    │
│   │ Nice circle        │    │
│   │ [Resolve] [Reply]  │    │
│   └────────────────────┘    │
│                              │
│ ▼ Rectangle #2 (1 comment)  │
│   ┌────────────────────┐    │
│   │ M  Reena  1d ago   │    │
│   │ Move this to left  │    │
│   │ [Resolve] [Reply]  │    │
│   └────────────────────┘    │
│                              │
│ [Show Resolved: 3]           │  ← Collapsed resolved section
│                              │
└─────────────────────────────┘
```

**Key Features**:
- Group annotations by shape
- Show shape name/type (from shape metadata or auto-generate)
- Collapsible shape groups
- Filter by resolved/unresolved
- Search annotations
- Click annotation to:
  - Highlight shape on canvas
  - Focus/scroll to shape
  - Show annotation bubble if hidden
- Reuse AIChat sidebar infrastructure for pinning/resizing

**Props**:
```typescript
interface CommentsPanelProps {
  canvasId: string
  isOpen: boolean
  onClose: () => void
  selectedShapeId?: string    // Auto-scroll to this shape's comments
  selectedAnnotationId?: string  // Highlight this specific annotation
}
```

---

### 3. Comment Creation UI

#### **Option A: Inline on Canvas (Simpler)**
- Click shape → Show comment button in selection box
- Click comment button → Show input overlay on canvas
- Type comment → Auto-save to Firestore
- Annotation bubble appears immediately

**UI Flow**:
```
1. Select shape → [Delete] [Duplicate] [Comment] buttons appear
2. Click [Comment] → Input box appears near shape
3. Type comment + press Enter → Annotation created
4. Bubble appears on canvas
```

#### **Option B: Via Comments Panel (More structured)**
- Open Comments Panel
- Click "+ Add Comment" at top
- Select mode activated (cursor changes)
- Click a shape on canvas
- Comment input appears in panel
- Type and submit → Annotation created

**Recommendation**: Start with **Option A** (simpler, more direct feedback)

---

### 4. Annotation Rendering on Canvas

**Integration in `Canvas.tsx`**:

```typescript
// Inside Canvas component
const [annotations, setAnnotations] = useState<Annotation[]>([])

// Subscribe to annotations
useEffect(() => {
  if (!canvasId) return

  const unsubscribe = subscribeToAllAnnotations(canvasId, (annotations) => {
    setAnnotations(annotations)
  })

  return unsubscribe
}, [canvasId])

// Render annotations on Stage
{annotations.map((annotation) => {
  const shape = shapes.find(s => s.id === annotation.shapeId)
  if (!shape || annotation.resolved) return null  // Don't show resolved

  return (
    <Annotation
      key={annotation.id}
      annotation={annotation}
      shapeX={shape.x}
      shapeY={shape.y}
      viewport={viewport}
    />
  )
})}
```

**Click Handling**:
- Make annotation bubbles clickable
- On click → Open Comments Panel
- Auto-scroll to that annotation in panel
- Highlight the annotation

---

### 5. Toolbar Integration

**Add Comment Tool Button**:

```typescript
// In Toolbar.tsx after the "Ask Vega" button

<div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

<button
  onClick={onToggleComments}
  title="Comments"
  style={{
    width: '40px',
    height: '40px',
    border: isCommentsOpen ? '2px solid #8b5cf6' : '2px solid transparent',
    borderRadius: '6px',
    backgroundColor: isCommentsOpen ? '#f5f3ff' : 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  }}
>
  <MessageCircle size={20} color={isCommentsOpen ? '#8b5cf6' : '#1F2937'} />
  {unreadCount > 0 && (
    <div style={{
      position: 'absolute',
      top: '4px',
      right: '4px',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      backgroundColor: '#ef4444',
      color: 'white',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    }}>
      {unreadCount}
    </div>
  )}
</button>
```

**Import needed**:
```typescript
import { MessageCircle } from 'lucide-react'
```

---

### 6. Canvas State Management

**Add to Canvas state**:
```typescript
const [isCommentsOpen, setIsCommentsOpen] = useState(false)
const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
const [commentingMode, setCommentingMode] = useState(false)
```

**Interaction Modes**:
- `commentingMode = true` → Cursor changes, click shape to add comment
- Click annotation bubble → `setSelectedAnnotationId(id)` + open panel
- Comments panel can be toggled independently of AI chat

---

## Interaction Flows 🔄

### Flow 1: Add Comment to Shape
```
1. User selects shape (regular selection)
2. Selection box shows [Delete] [Duplicate] [💬 Comment] buttons
3. Click [💬 Comment]
4. Input box appears near shape on canvas
   - "Type anything, @mention anyone" placeholder
   - Shows user avatar
5. User types comment
6. Press Enter or click "Post"
7. Annotation created in Firestore
8. Annotation bubble appears on canvas immediately
9. Comments panel updates (if open)
```

### Flow 2: View All Comments
```
1. User clicks [💬 Comments] button in toolbar
2. Comments panel slides in from RIGHT
3. Panel shows all annotations grouped by shape
4. User can:
   - Scroll through comments
   - Search comments
   - Filter by resolved/unresolved
   - Click comment to highlight shape
```

### Flow 3: Click Annotation Bubble
```
1. User clicks annotation bubble on canvas
2. Comments panel opens (if closed)
3. Auto-scrolls to that specific annotation
4. Annotation is highlighted in panel
5. Shape is highlighted on canvas
```

### Flow 4: Resolve Comment
```
1. In Comments Panel, click [Resolve] button
2. Annotation marked as resolved in Firestore
3. Annotation bubble disappears from canvas
4. Annotation moves to "Resolved" section in panel
5. Can be un-resolved by clicking [Unresolve]
```

### Flow 5: Reply to Comment (Future Enhancement)
```
1. Click [Reply] in Comments Panel
2. Threaded reply input appears
3. Reply saved as child annotation
4. Displayed as thread in panel
```

---

## Implementation Tasks 📋

### Phase 1: Core Infrastructure (2-3 hours)
- [ ] **1.1** Add Firestore annotation services
  - `addAnnotation()`
  - `subscribeToAllAnnotations()`
  - `subscribeToShapeAnnotations()`
  - `updateAnnotation()`
  - `deleteAnnotation()`
  - `toggleAnnotationResolved()`

- [ ] **1.2** Create CommentsPanel component skeleton
  - Reuse AIChat structure (pinning, resizing, tabs)
  - Basic layout with shape grouping
  - Firestore subscription

- [ ] **1.3** Add comment tool to Toolbar
  - MessageCircle icon from lucide-react
  - Unread count badge
  - Toggle Comments Panel

### Phase 2: Canvas Integration (2-3 hours)
- [ ] **2.1** Integrate Annotation rendering in Canvas.tsx
  - Subscribe to annotations
  - Render Annotation components
  - Filter out resolved annotations

- [ ] **2.2** Add annotation click handling
  - Make annotations clickable (Konva `onClick`)
  - Open Comments Panel on click
  - Highlight annotation in panel

- [ ] **2.3** Add comment creation UI
  - Show comment button in selection box
  - Input overlay on canvas
  - Submit to Firestore

### Phase 3: Comments Panel Features (2-3 hours)
- [ ] **3.1** Shape grouping and collapsing
  - Group annotations by shapeId
  - Show shape name/type
  - Collapsible sections

- [ ] **3.2** Annotation cards
  - Avatar, username, timestamp
  - Comment text
  - [Resolve] [Reply] buttons

- [ ] **3.3** Click-to-highlight
  - Click annotation in panel → highlight shape on canvas
  - Scroll/pan canvas to shape if needed
  - Show annotation bubble

### Phase 4: Polish & UX (1-2 hours)
- [ ] **4.1** Search and filtering
  - Search box in panel
  - Filter by resolved/unresolved
  - Filter by user (future)

- [ ] **4.2** Resolved annotations section
  - Collapsed "Show Resolved (N)" section
  - Can expand to see resolved annotations
  - [Unresolve] button

- [ ] **4.3** Visual feedback
  - Smooth transitions
  - Loading states
  - Empty states ("No comments yet")
  - Hover effects

### Phase 5: Testing & Documentation (1 hour)
- [ ] **5.1** Manual testing
  - Create/view/resolve annotations
  - Multi-user collaboration
  - Panel interactions

- [ ] **5.2** Edge cases
  - Delete shape with annotations (orphaned annotations)
  - Move shape (annotation position)
  - Zoom/pan with annotations

- [ ] **5.3** Documentation
  - Update pr18.md with implementation details
  - Document Firestore schema
  - Add to README

---

## Technical Decisions 🤔

### 1. Annotation Storage Location
**Decision**: Store in Firestore, NOT in shape metadata

**Rationale**:
- Annotations are separate entities (own lifecycle)
- Can be resolved independently
- Easier to query all annotations
- Doesn't bloat shape objects

**Schema**: `canvases/{canvasId}/annotations/{annotationId}`

---

### 2. Resolved Annotations Visibility
**Decision**: Hide resolved annotations from canvas, show in panel

**Rationale**:
- Canvas stays clean (only active comments visible)
- Resolved annotations still accessible in panel
- Matches common collaboration tool patterns (Figma, Miro)

---

### 3. Annotation Positioning
**Decision**: Store relative offset (offsetX, offsetY) from shape

**Rationale**:
- Annotations follow shape when moved
- Users can manually reposition if crowded
- Simple calculation: `annotationX = shapeX + offsetX`

**Default Position**: Above and to the right (+50, -80)

---

### 4. Comments Panel vs. AI Chat
**Decision**: Separate panels, both can be open simultaneously

**Rationale**:
- Different use cases (chat vs. annotations)
- AI Chat on left, Comments on right
- Users can work with both
- Reuse sidebar infrastructure but separate instances

**UI Layout**:
```
┌──────────┬──────────────────┬──────────┐
│          │                  │          │
│ AI Chat  │   Canvas         │ Comments │
│ (left)   │   (center)       │ (right)  │
│          │                  │          │
└──────────┴──────────────────┴──────────┘
```

---

### 5. Annotation Bubble Click Behavior
**Decision**: Click annotation → Open Comments Panel + highlight

**Rationale**:
- Provides context (see all comments on shape)
- Allows actions (resolve, reply)
- Canvas bubble is read-only (viewing)
- Editing happens in panel

---

## Future Enhancements 🚀

### 1. Threaded Replies
- Reply to annotations
- Show as nested thread in panel
- Collapse/expand threads

### 2. @Mentions
- Tag users with @username
- Sends notification (future notification system)
- Highlights mentioned user in comment

### 3. Rich Text Formatting
- Bold, italic, code blocks
- Inline images/links
- Markdown support

### 4. Annotation Types
- Comment (current)
- Suggestion (propose change)
- Issue (mark problem)
- Approval (sign-off)

### 5. Filters & Views
- Filter by user
- Filter by date range
- "My comments" view
- "Unresolved by me" view

### 6. Notifications
- Desktop notifications for new comments
- Email notifications (digest)
- In-app notification center

### 7. Annotation Export
- Export annotations to PDF
- Include in canvas exports
- Generate report of all feedback

---

## Design Considerations 🎨

### 1. Visual Hierarchy
- Unresolved annotations: Full opacity, colored avatar
- Resolved annotations: Lower opacity, gray avatar
- Selected annotation: Border highlight, slightly larger

### 2. Positioning Strategy
**Default**: Above and to the right of shape (+50, -80)

**Collision Detection** (Future):
- Detect overlapping annotations
- Auto-adjust positions to avoid overlap
- Spiral outward from default position

### 3. Mobile Considerations
- Annotations tap-able on touch devices
- Panel swipes in from right
- Simplified UI for small screens

---

## Security & Performance 🔒

### 1. Firestore Rules
```javascript
// canvases/{canvasId}/annotations/{annotationId}
match /annotations/{annotationId} {
  // Anyone with canvas access can read
  allow read: if isCanvasMember(canvasId);

  // Only authenticated users can create
  allow create: if request.auth != null && isCanvasMember(canvasId);

  // Only creator can update/delete their own annotations
  allow update, delete: if request.auth != null
    && resource.data.userId == request.auth.uid;
}
```

### 2. Performance Optimization
- **Pagination**: Load annotations in batches (50 at a time)
- **Virtualization**: Use virtual scrolling in Comments Panel for large counts
- **Indexing**: Firestore index on `shapeId` for fast queries
- **Caching**: Cache annotation counts per shape

---

## Success Metrics 📊

1. **Adoption**: % of canvases with at least 1 annotation
2. **Engagement**: Average annotations per canvas
3. **Resolution Rate**: % of annotations resolved within 24h
4. **Collaboration**: % of annotations with multiple participants
5. **Performance**: Annotation render time < 100ms

---

## Open Questions ❓

1. **Should annotations be exportable with canvas?**
   - Include in PDF export?
   - Show in printed versions?

2. **How to handle deleted shapes?**
   - Delete annotations automatically?
   - Keep as "orphaned" (shape deleted)?
   - Option to transfer to another shape?

3. **Annotation permissions?**
   - Can viewers comment?
   - Can only editors resolve?
   - Canvas-level settings?

4. **Keyboard shortcuts?**
   - `C` for comment mode?
   - `Alt + Click` to comment on shape?
   - `Esc` to cancel commenting?

---

## Summary

**Existing Foundation** ✅:
- Annotation type definitions
- Annotation rendering component (Konva)
- Sidebar infrastructure (AIChat)
- Toolbar structure

**To Build** 🏗️:
- Firestore annotation services
- Comments Panel component
- Canvas integration (rendering + clicks)
- Comment creation UI
- Toolbar comment button

**Estimated Timeline**: 8-11 hours total development time

**Priority**: High - Core collaboration feature that enhances team workflows
