# MVP-Critical Auth Tests - Quick Reference

**Goal:** Pass these tests to complete PR #2 and move to PR #3

---

## ✅ MVP Test Subset (Must Pass)

### Test File 1: `tests/unit/auth.test.ts`
**Time:** ~20 min to write | **Duration:** <100ms to run

```typescript
describe('Authentication Service - MVP CRITICAL', () => {
  // ✅ Sign in success
  it('should sign in user successfully')

  // ✅ Sign in errors
  it('should handle sign-in error')
  it('should handle network error')

  // ✅ Sign out
  it('should sign out user successfully')
  it('should handle sign-out error')

  // ✅ Get current user
  it('should return current user when signed in')
  it('should return null when not signed in')
})
```

**What it verifies:**
- Core auth functions work
- Errors are handled properly
- User state is retrievable

---

### Test File 2: `tests/integration/authProvider.test.tsx`
**Time:** ~30 min to write | **Duration:** <200ms to run

```typescript
describe('AuthProvider Integration - MVP CRITICAL', () => {
  // ✅ Loading state
  it('should render loading state initially')

  // ✅ Signed out state
  it('should render signed out state when no user')

  // ✅ Signed in state
  it('should render user info when signed in')

  // ✅ Persistence (CRITICAL!)
  it('should persist auth state on mount')
})
```

**What it verifies:**
- AuthProvider manages state correctly
- **Auth persists on page refresh** ← MVP requirement!
- Loading/signed-in/signed-out states work

---

## 🚀 Quick Start

### 1. Install dependencies (5 min)
```bash
npm install -D @firebase/rules-unit-testing firebase-mock
```

### 2. Create mock (15 min)
Create `tests/mocks/firebaseMock.ts` with mock Firebase auth

### 3. Write tests (50 min)
- `tests/unit/auth.test.ts` - 7 tests
- `tests/integration/authProvider.test.tsx` - 4 tests

### 4. Run tests (2 min)
```bash
npm test tests/unit/auth.test.ts
npm test tests/integration/authProvider.test.tsx
```

### 5. Fix failures (15 min)
Debug any failing tests

---

## ✅ Success Criteria

```
✓ tests/unit/auth.test.ts (7 passed)
✓ tests/integration/authProvider.test.tsx (4 passed)

Total: 11 tests passed
Duration: ~300ms
```

---

## ⏱️ Total Time Budget

**MVP-Critical Tests Only:** ~85 minutes (~1.5 hours)

| Task | Time |
|------|------|
| Setup | 5 min |
| Mock | 15 min |
| Unit tests | 20 min |
| Integration tests | 30 min |
| Debug & fix | 15 min |

---

## ⚠️ Skip for MVP (Do Later)

- ❌ `tests/unit/authErrors.test.ts` - Nice error messages (post-MVP)
- ❌ `tests/unit/LoginButton.test.tsx` - Component tests (post-MVP)

These can wait until after the 24-hour checkpoint.

---

## 🎯 Why This Matters

**Without these tests:**
- 😰 Don't know if auth works until you manually test
- 😰 Might break auth when adding new features
- 😰 No confidence in AI-generated code

**With these tests:**
- ✅ Know auth works in <1 second
- ✅ Catch auth breaks immediately
- ✅ Verify AI code is correct
- ✅ Pass MVP checkpoint with confidence

---

## 📋 Checklist

Use this to track your progress:

- [ ] Install test dependencies
- [ ] Create `tests/mocks/firebaseMock.ts`
- [ ] Write `tests/unit/auth.test.ts` (7 tests)
- [ ] Write `tests/integration/authProvider.test.tsx` (4 tests)
- [ ] Run tests: `npm test auth`
- [ ] All 11 tests passing ✅
- [ ] Ready to merge PR #2 and move to PR #3!

---

**Bottom Line:** Spend ~1.5 hours on these tests now, save hours of debugging later. These 11 tests are your MVP gate for authentication!
