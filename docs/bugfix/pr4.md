# PR #4 Bug Fixes: Multiplayer Cursor Tracking

## Overview

This document details all bugs encountered during PR #4 implementation and the systematic debugging process used to resolve them. PR #4 implemented real-time multiplayer cursor tracking using Firebase Realtime Database (RTDB).

## Initial Problem

**Symptom**: Cursor tracking worked initially in localhost but then stopped working. Cursors never worked in production (https://canvisia-ab47b.web.app).

**Impact**: Users could not see each other's cursor positions in real-time collaboration.

## Debugging Approach

Applied systematic debugging methodology with 4 phases:
1. Root cause investigation (error messages, reproduction, evidence gathering)
2. Pattern analysis
3. Hypothesis testing
4. Implementation

---

## Bug #1: Database Rules Not Deployed

### Symptom
```
FIREBASE WARNING: set at /cursors/default-canvas/{userId} failed: permission_denied
Error: PERMISSION_DENIED: Permission denied
```

### Root Cause
Database security rules existed in `database.rules.json` but were never deployed to Firebase. The rules were only in the codebase, not in the actual Firebase project.

### Fix
```bash
firebase deploy --only database
```

This deployed the rules to production. For local development, emulators needed restart to load the rules.

### Lesson Learned
**Database rules are deployed separately from application code.** Always verify that:
- Rules exist in `database.rules.json`
- Rules are deployed with `firebase deploy --only database`
- Local emulators are restarted after rule changes

---

## Bug #2: Wrong Unsubscribe Method (Legacy API vs v9+ Modular SDK)

### Symptom
- `onValue` listener attached successfully
- Callback never fired
- `cursorsCount: 0` always reported
- No data received from subscription

### Root Cause
Code used legacy Firebase SDK unsubscribe pattern (`off()`) instead of v9+ modular SDK pattern (function returned by `onValue()`).

### Original Code (Broken)
```typescript
// src/services/rtdb.ts
export function subscribeToCursors(
  canvasId: string,
  callback: (cursors: Record<string, CursorPosition>) => void
): () => void {
  const cursorsRef = ref(rtdb, `cursors/${canvasId}`)

  const handleValue = (snapshot: DataSnapshot) => {
    const cursors = snapshot.val() || {}
    callback(cursors)
  }

  const handleError = (error: Error) => {
    console.error('RTDB subscription error:', error)
  }

  onValue(cursorsRef, handleValue, handleError)
  return () => off(cursorsRef, 'value', handleValue)  // WRONG!
}
```

### Fixed Code
```typescript
export function subscribeToCursors(
  canvasId: string,
  callback: (cursors: Record<string, CursorPosition>) => void
): () => void {
  const cursorsRef = ref(rtdb, `cursors/${canvasId}`)

  const handleValue = (snapshot: DataSnapshot) => {
    const cursors = snapshot.val() || {}
    callback(cursors)
  }

  const handleError = (error: Error) => {
    console.error('RTDB subscription error:', error)
  }

  // v9+ modular SDK: onValue returns an unsubscribe function
  const unsubscribe = onValue(cursorsRef, handleValue, handleError)

  // Return the unsubscribe function directly
  return unsubscribe
}
```

### Lesson Learned
**Firebase v9+ modular SDK has different patterns than legacy SDK:**
- `onValue()` returns an unsubscribe function
- DO NOT use `off()` - that's legacy API
- Store and return the unsubscribe function directly

---

## Bug #3: Database Rules at Wrong Nesting Level

### Symptom
- Writes to `/cursors/{canvasId}/{userId}` succeeded
- Reads from `/cursors/{canvasId}` failed with PERMISSION_DENIED
- Subscription callback never fired

### Root Cause
Database rules had `.read: true` nested under `$userId`, but the subscription was reading at the `$canvasId` level. **Firebase rules don't cascade down** - they must be at the exact level where data is accessed.

### Original Rules (Broken)
```json
{
  "rules": {
    "cursors": {
      "$canvasId": {
        "$userId": {
          ".read": true,        // Too deeply nested!
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

This allowed:
- ✅ Read: `/cursors/canvas-123/user-456` (individual cursor)
- ❌ Read: `/cursors/canvas-123` (all cursors on canvas)
- ✅ Write: `/cursors/canvas-123/user-456` (own cursor)

### Fixed Rules
```json
{
  "rules": {
    "cursors": {
      "$canvasId": {
        ".read": true,          // Moved up one level!
        "$userId": {
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```

This allows:
- ✅ Read: `/cursors/canvas-123` (all cursors on canvas)
- ✅ Read: `/cursors/canvas-123/user-456` (individual cursor)
- ✅ Write: `/cursors/canvas-123/user-456` (own cursor)

### Lesson Learned
**Firebase RTDB rules don't cascade like filesystem permissions:**
- Rules must be at the EXACT level where data is accessed
- If subscribing to `/path/to/data`, `.read` must be at `/path/to/data`, not deeper
- Test rules at both individual item and collection levels

---

## Bug #4: Java Runtime Not Installed

### Symptom
```
Process 'java -version' has exited with code 1.
Unable to locate a Java Runtime.
```

### Root Cause
Firebase emulators require Java runtime, but it wasn't installed on the system.

### Fix
```bash
# Install OpenJDK 17
brew install openjdk@17

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Create system symlink (requires sudo)
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk \
  /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Lesson Learned
**Firebase emulator dependencies:**
- RTDB emulator requires Java runtime
- Install Java before first emulator use
- Document Java requirement in setup instructions

---

## Bug #5: Permission Denied on Cursor Removal (Cleanup)

### Symptom
```
Error: PERMISSION_DENIED at rtdb.ts:87
// Line 87: await remove(cursorRef)
```

Error occurred when React component unmounted and tried to remove cursor.

### Root Cause
Database rules didn't have explicit `.delete` or `.write` permission for removal. The `removeCursor()` call was attempting manual cleanup, but this isn't critical because `onDisconnect().remove()` handles cleanup automatically.

### Original Code (Noisy Errors)
```typescript
// src/hooks/useCursors.ts
return () => {
  unsubscribe()
  removeCursor(canvasId, userId)  // Throws unhandled error
}
```

### Fixed Code
```typescript
return () => {
  unsubscribe()
  // Try to remove cursor on unmount, but don't fail if permission denied
  removeCursor(canvasId, userId).catch((error) => {
    console.debug('Manual cursor cleanup failed (onDisconnect will handle it):', error)
  })
}
```

### Lesson Learned
**Graceful error handling for non-critical operations:**
- Not all async operations are critical to success
- Manual cleanup is redundant when `onDisconnect()` is set up
- Use `.catch()` to handle permission errors gracefully
- Log at `debug` level for non-critical failures

---

## Bug #6: Test Failures After Fix

### Symptom
```
TypeError: Cannot read properties of undefined (reading 'catch')
```

Tests failed after adding `.catch()` to `removeCursor()` call.

### Root Cause
Test mocks returned `undefined` instead of Promises. When code called `.catch()` on the result, it tried to call `.catch()` on `undefined`.

### Original Mocks (Broken)
```typescript
vi.mock('@/services/rtdb', () => ({
  updateCursorPosition: vi.fn(),              // Returns undefined
  subscribeToCursors: vi.fn(),
  setupCursorCleanup: vi.fn(),                // Returns undefined
  removeCursor: vi.fn(),                      // Returns undefined
}))
```

### Fixed Mocks
```typescript
vi.mock('@/services/rtdb', () => ({
  updateCursorPosition: vi.fn().mockResolvedValue(undefined),
  subscribeToCursors: vi.fn(),
  setupCursorCleanup: vi.fn().mockResolvedValue(undefined),
  removeCursor: vi.fn().mockResolvedValue(undefined),
}))
```

### Lesson Learned
**Mock async functions must return Promises:**
- Use `.mockResolvedValue()` for async functions
- Use `.mockRejectedValue()` to test error paths
- Even if function returns `void`, mock must return `Promise<void>`
- Match the signature of the real function

---

## Summary of Files Changed

### Production Code
1. **`database.rules.json`** - Fixed rule nesting level
2. **`src/services/rtdb.ts`** - Fixed unsubscribe pattern
3. **`src/hooks/useCursors.ts`** - Added error handling for cleanup

### Test Code
1. **`tests/unit/useCursors.test.ts`** - Fixed async mocks

### Deployment
- Deployed database rules with `firebase deploy --only database`
- Restarted emulators to load new rules

---

## Commits

1. **`ab36e09`** - PR #4: Multiplayer Cursor Tracking with Firebase RTDB
2. **`5e1ac28`** - Fix: Handle PERMISSION_DENIED error on cursor cleanup

---

## Key Takeaways for Future PRs

### 1. Firebase Security Rules
- Rules are deployed separately: `firebase deploy --only database`
- Rules don't cascade - must be at exact access level
- Test both individual and collection-level access
- Restart emulators after rule changes

### 2. Firebase SDK Version Differences
- v9+ modular SDK: `onValue()` returns unsubscribe function
- Don't use legacy `off()` method
- Check Firebase docs for correct v9+ patterns

### 3. Error Handling
- Not all operations are critical
- Use `.catch()` for graceful degradation
- Log non-critical errors at `debug` level
- Distinguish between fatal and recoverable errors

### 4. Testing Async Code
- Mock async functions with `.mockResolvedValue()`
- Test error paths with `.mockRejectedValue()`
- Ensure mocks match real function signatures
- Test both success and failure cases

### 5. Development Environment
- Document all runtime dependencies (Java for emulators)
- Provide setup instructions for new developers
- Test in both development (emulator) and production

### 6. Debugging Methodology
- Use browser console for client-side errors
- Check Firebase console for deployed rules
- Use Firebase Emulator UI to inspect data
- Apply systematic debugging (4 phases)
- Don't skip to solutions - find root causes

---

## References

- Firebase v9+ Modular SDK: https://firebase.google.com/docs/web/modular-upgrade
- RTDB Security Rules: https://firebase.google.com/docs/database/security
- Vitest Mocking: https://vitest.dev/api/vi.html#vi-fn
