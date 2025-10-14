# PR #7: Presence Awareness & MVP Polish - Learnings & Bug Fixes

**Date:** October 14, 2025
**Status:** ✅ Completed
**Commits:**
- `5df1be2` - Real-time presence awareness with header integration
- `0b79e3d` - UX polish with keyboard shortcuts, error handling, loading states

---

## Overview

PR #7 implemented real-time user presence tracking and completed MVP polish with keyboard shortcuts, error handling, and loading states. This PR focused on making the application feel professional and complete.

**Total tests:** 63 passing (3 new presence tests added)

---

## Key Learnings

### 1. RTDB vs Firestore for Presence (Architectural Decision)

**Lesson Applied from PR #4:**
We chose Firebase Realtime Database (RTDB) over Firestore for presence tracking based on learnings from PR #4.

**Why RTDB is Better for Presence:**
- **Built-in onDisconnect:** RTDB has native `onDisconnect()` for automatic cleanup
- **Lower latency:** RTDB optimized for real-time ephemeral data
- **Simpler structure:** Flat JSON structure perfect for presence data
- **Cost-effective:** Better pricing for high-frequency updates

**Implementation:**
```typescript
// Setup presence with automatic cleanup
await setUserPresence(canvasId, userId, userName, userColor, true)
await setupPresenceCleanup(canvasId, userId) // onDisconnect() configured

// Subscribe to presence updates
const unsubscribe = subscribeToPresence(canvasId, (presenceList) => {
  setActiveUsers(presenceList)
})
```

**Path Structure:**
```
presence/
  {canvasId}/
    {userId}/
      userId: string
      userName: string
      color: string
      isActive: boolean
      lastSeen: ServerValue.TIMESTAMP
```

### 2. Database Rules Configuration (CRITICAL)

**Bug:** Initial deployment showed `PERMISSION_DENIED` errors for presence operations.

**Root Cause:** Database rules only included `/cursors` path from PR #4, missing `/presence` path.

**Fix:** Added presence rules to `database.rules.json`:
```json
{
  "rules": {
    "cursors": {
      "$canvasId": {
        ".read": true,
        "$userId": {
          ".write": "$userId === auth.uid"
        }
      }
    },
    "presence": {
      "$canvasId": {
        ".read": true,
        "$userId": {
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

**Deployment:**
```bash
firebase deploy --only database
```

**Lesson:** Always deploy database rules immediately after adding new RTDB paths. Test with actual Firebase (not just mocks) to catch permission issues early.

### 3. UI Component Integration Strategy

**Challenge:** Integrating DevLogin and Presence panels without cluttering the canvas workspace.

**Initial Attempts:**
1. ❌ Both panels as fixed positioned overlays (covered canvas tools)
2. ❌ Presence on left side (covered toolbar)
3. ❌ Presence below DevLogin (too much vertical space)

**Final Solution:** Integrated both into Header component
- DevLogin: Dropdown button (compact, on-demand)
- Presence: Inline display with colored avatars (always visible, minimal space)
- Result: Clean header, unobstructed canvas workspace

**Implementation Pattern:**
```typescript
// App.tsx - State lifting pattern
const [activeUsers, setActiveUsers] = useState<Presence[]>([])

<Header activeUsers={activeUsers} />
<Canvas onPresenceChange={setActiveUsers} />
```

**Why This Works:**
- Single source of truth (App.tsx state)
- Unidirectional data flow (Canvas → App → Header)
- No prop drilling through multiple levels
- Easy to test each component independently

### 4. Keyboard Event Handling Best Practices

**Implementation:**
```typescript
useEffect(() => {
  const handleKeyDown = async (e: KeyboardEvent) => {
    // Delete/Backspace - remove shape
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedShapeId) {
        e.preventDefault() // Prevent browser back navigation
        await deleteShape(selectedShapeId)
        setSelectedShapeId(null)
      }
    }

    // Escape - deselect
    if (e.key === 'Escape') {
      if (selectedShapeId) {
        e.preventDefault()
        setSelectedShapeId(null)
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [selectedShapeId, deleteShape])
```

**Key Points:**
- ✅ Use `window` for global keyboard shortcuts
- ✅ Always call `e.preventDefault()` to prevent default browser behavior
- ✅ Clean up event listener in useEffect return
- ✅ Include dependencies in dependency array
- ✅ Only respond to shortcuts when relevant (e.g., only delete if shape selected)

### 5. Error Handling Pattern with Toast Notifications

**Pattern:**
```typescript
// State for error messages
const [error, setError] = useState<string | null>(null)

// Auto-dismiss after 5 seconds
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(timer)
  }
}, [error])

// Error toast UI
{error && (
  <div style={{ /* toast styles */ }}>
    <span>⚠️</span>
    <span>{error}</span>
    <button onClick={() => setError(null)}>×</button>
  </div>
)}
```

**Benefits:**
- User-friendly error messages (not technical jargon)
- Auto-dismiss prevents permanent clutter
- Manual dismiss option for user control
- Non-blocking (doesn't require user action)

### 6. Loading States for Better UX

**Implementation:**
```typescript
// Hook already provides loading state
const { shapes, loading } = useFirestore(canvasId)

// Conditional rendering
{loading && (
  <div>
    <div style={{ animation: 'spin 0.8s linear infinite' }} />
    <span>Loading shapes...</span>
  </div>
)}
```

**CSS Animations:**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

**Why This Matters:**
- Reduces user uncertainty during data fetches
- Professional polish that makes app feel responsive
- Prevents user from thinking app is frozen
- Smooth animations enhance perceived performance

---

## Bug Fixes

### Bug #1: PERMISSION_DENIED for Presence Operations

**Symptoms:**
```
Error: permission_denied at /presence/default-canvas:
Client doesn't have permission to access the desired data.
```

**Root Cause:** Database rules didn't include `/presence` path.

**Fix:**
1. Added presence rules to `database.rules.json`
2. Deployed rules: `firebase deploy --only database`
3. Restarted emulators to pick up new rules

**Prevention:** Always deploy database rules when adding new RTDB paths. Add rule deployment to PR checklist.

### Bug #2: Presence Panel Covering Toolbar

**Symptoms:** User couldn't see toolbar buttons with presence panel overlapping.

**Root Cause:** Both panels positioned on left side at overlapping coordinates.

**Fix:** Moved presence panel to header, integrated DevLogin as dropdown.

**Lesson:** Consider all UI elements when positioning overlays. Header integration is better than floating panels for persistent UI.

### Bug #3: DevLogin Taking Too Much Space

**Symptoms:** DevLogin panel was large and always visible, cluttering the UI.

**Root Cause:** Fixed positioned panel with full button list always expanded.

**Fix:**
1. Added dropdown toggle state: `const [showMenu, setShowMenu] = useState(false)`
2. Show compact button, dropdown on click
3. Integrated into header for consistent placement

**Benefits:**
- Saves screen space when not in use
- Still easily accessible when needed
- Cleaner, more professional appearance

---

## Technical Patterns

### Pattern #1: State Lifting for Shared Data

**Problem:** Presence data needed in both Canvas (for tracking) and Header (for display).

**Solution:** Lift state to common parent (App.tsx):
```typescript
// App.tsx
const [activeUsers, setActiveUsers] = useState<Presence[]>([])

// Canvas manages presence, notifies parent
<Canvas onPresenceChange={setActiveUsers} />

// Header displays presence from parent
<Header activeUsers={activeUsers} />
```

**Benefits:**
- Single source of truth
- No circular dependencies
- Easy to debug data flow
- Components remain independent

### Pattern #2: Auto-Dismiss Timers

**Pattern:**
```typescript
useEffect(() => {
  if (stateVariable) {
    const timer = setTimeout(() => clearState(), delay)
    return () => clearTimeout(timer)
  }
}, [stateVariable])
```

**Use Cases:**
- Error toast auto-dismiss (5 seconds)
- Success notifications
- Temporary UI hints
- Loading state timeouts

**Key Points:**
- Always clear timer in cleanup function
- Don't set timer if state is already cleared
- Include state in dependency array

### Pattern #3: Conditional preventDefault

**Pattern:**
```typescript
if (e.key === 'Delete' && selectedShapeId) {
  e.preventDefault() // Only prevent if we're handling it
  // Handle delete
}
```

**Why:**
- Prevents browser default behavior
- Only when we're actually handling the event
- Doesn't interfere with other keyboard interactions

---

## Testing Strategy

### Integration Tests Added

**File:** `tests/integration/presence.test.ts`

**Coverage:**
1. ✅ User marked as active on mount
2. ✅ onDisconnect cleanup configured
3. ✅ Active users list updates in real-time
4. ✅ Hook exposes activeUsers array

**Test Pattern:**
```typescript
it('should set user as active on mount and setup cleanup', async () => {
  const { result } = renderHook(() =>
    usePresence('test-canvas-id', 'test-user-id', 'Test User', '#FF6B6B')
  )

  await waitFor(() => {
    expect(result.current.activeUsers).toBeDefined()
  })

  expect(setUserPresence).toHaveBeenCalledWith(
    'test-canvas-id', 'test-user-id', 'Test User', '#FF6B6B', true
  )
  expect(setupPresenceCleanup).toHaveBeenCalledWith('test-canvas-id', 'test-user-id')
})
```

---

## Performance Considerations

### Presence Updates

**Frequency:** Presence updates are infrequent (only on join/leave), so no throttling needed.

**Optimization:** RTDB automatically batches nearby updates, reducing bandwidth.

### Loading State

**Timing:** Loading indicator only shows during initial fetch, not for real-time updates.

**Why:** After initial load, shapes update via subscription without showing loading state.

### Error Handling

**User Impact:** Error toasts don't block user workflow, allowing continued use even if operations fail.

---

## Best Practices Established

### 1. Database Rules Deployment

- ✅ Always deploy rules immediately after adding new paths
- ✅ Test with actual Firebase, not just emulator
- ✅ Include rules deployment in PR checklist
- ✅ Document rule changes in commit message

### 2. UI Component Organization

- ✅ Persistent UI elements go in header
- ✅ Dropdown menus for infrequent actions
- ✅ Inline displays for continuous status
- ✅ Keep canvas workspace unobstructed

### 3. Error Handling

- ✅ User-friendly error messages (not technical)
- ✅ Auto-dismiss after 5 seconds
- ✅ Manual dismiss option (×  button)
- ✅ Non-blocking toasts at bottom-right

### 4. Keyboard Shortcuts

- ✅ Use window-level listeners for global shortcuts
- ✅ Always preventDefault to avoid browser conflicts
- ✅ Clean up event listeners properly
- ✅ Only respond when contextually relevant

### 5. Loading States

- ✅ Show loading indicators for initial data fetches
- ✅ Animated spinners for better UX
- ✅ Clear "Loading..." text (not ambiguous)
- ✅ Non-blocking position (top center)

---

## Files Modified

### Core Implementation
- `src/hooks/usePresence.ts` (new) - Presence management hook
- `src/services/rtdb.ts` - Added presence functions with onDisconnect
- `database.rules.json` - Added presence path rules
- `tests/integration/presence.test.ts` (new) - Presence integration tests

### UI Integration
- `src/components/layout/Header.tsx` - Integrated presence display and DevLogin
- `src/components/auth/DevLogin.tsx` - Converted to dropdown button
- `src/App.tsx` - State lifting for presence data

### Polish Features
- `src/components/canvas/Canvas.tsx` - Added keyboard shortcuts, error handling, loading states
- `src/index.css` - Added spin and slideIn animations

---

## Metrics

**Before PR #7:**
- No presence tracking
- No user feedback for errors
- No loading indicators
- No keyboard shortcuts

**After PR #7:**
- ✅ Real-time presence for unlimited users
- ✅ Automatic ghost user cleanup (onDisconnect)
- ✅ User-friendly error toasts with auto-dismiss
- ✅ Loading indicators for data fetches
- ✅ Keyboard shortcuts (Delete, Escape)
- ✅ Professional UI with header integration
- ✅ 63 tests passing (3 new tests added)

**Performance:**
- Presence updates: Real-time with RTDB
- Ghost user cleanup: Automatic (no manual intervention)
- Error recovery: Graceful (doesn't break workflow)
- UI responsiveness: Instant (optimistic updates maintained)

---

## Future Improvements

### Potential Enhancements

1. **Presence Avatars:**
   - Show user profile pictures instead of colored dots
   - Hover tooltip showing user info

2. **Keyboard Shortcuts:**
   - Ctrl+Z / Cmd+Z for undo
   - Ctrl+D / Cmd+D for duplicate shape
   - Arrow keys for fine position adjustment

3. **Error Recovery:**
   - Retry failed operations automatically
   - Queue failed operations for later sync
   - Show network status indicator

4. **Loading States:**
   - Skeleton screens for shapes
   - Progress indicators for large operations
   - Optimistic deletions (remove immediately, rollback on error)

5. **Presence Enhancements:**
   - Show what each user is currently doing ("editing rectangle")
   - User follow mode (follow another user's viewport)
   - Active shape indicators (show who's editing what)

---

## Conclusion

PR #7 successfully completed the MVP with professional polish. The presence system works reliably with automatic cleanup, the UI is clean and unobtrusive, and the user experience feels complete with error handling, loading states, and keyboard shortcuts.

**Key Achievements:**
- ✅ Reliable presence tracking with RTDB and onDisconnect
- ✅ Professional UI with header integration
- ✅ Complete error handling and user feedback
- ✅ Keyboard shortcuts for power users
- ✅ All tests passing (63/63)
- ✅ Zero blocking issues

**Lessons for Future PRs:**
1. Always deploy database rules when adding new RTDB paths
2. Integrate persistent UI into header, not as floating overlays
3. Use RTDB for ephemeral real-time data (presence, cursors)
4. Implement user feedback for all async operations
5. Test with actual Firebase, not just emulators

The MVP is now feature-complete and ready for user testing! 🎉
