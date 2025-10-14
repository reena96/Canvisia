# Canvisia - Implementation Task List (With Tests)

**📝 NOTE:** This file requires similar updates as TASK_LIST.md for:
- PR #2: Add routing (/canvas/new), security rules, React Router
- PR #8: Use Firebase Hosting instead of Vercel
- PR #13: Use Firebase Cloud Functions (NOT Vercel Functions) for AI security

**Key Changes Needed:**
- Security rules must be in PR #2 (not PR #18)
- No dashboard in MVP - use /canvas/new for canvas creation
- AI commands go through Firebase Cloud Functions with JWT verification
- **Use Firebase Hosting + Cloud Functions (ONE platform, not Vercel)**
- No .env.production file - configure via `firebase functions:config:set`

For detailed updates, refer to TASK_LIST.md which has been fully updated.

**Organized by Pull Requests (PRs)**

Each PR represents a complete, testable feature that can be merged independently.

**✅ Testing Strategy:** Unit and integration tests are included to verify AI-generated code is correct.

---

## Project File Structure

```
collabcanvas/
├── public/
│   └── index.html
├── src/
│   ├── stores/
│   │   ├── canvasStore.ts
│   │   ├── authStore.ts (optional - can use React Context)
│   │   └── presenceStore.ts
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx
│   │   │   ├── CanvasControls.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   └── ShapeRenderer.tsx
│   │   ├── collaboration/
│   │   │   ├── CursorOverlay.tsx
│   │   │   ├── PresenceIndicator.tsx
│   │   │   └── UserList.tsx
│   │   ├── ai/
│   │   │   ├── AIPanel.tsx
│   │   │   ├── AIInput.tsx
│   │   │   └── AIStatusIndicator.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── hooks/
│   │   ├── useCanvas.ts
│   │   ├── useFirestore.ts
│   │   ├── useCursors.ts
│   │   ├── usePresence.ts
│   │   └── useAI.ts
│   ├── services/
│   │   ├── firebase.ts
│   │   ├── auth.ts
│   │   ├── firestore.ts
│   │   ├── rtdb.ts (Realtime Database for cursors)
│   │   └── claude.ts
│   ├── types/
│   │   ├── canvas.ts
│   │   ├── shapes.ts
│   │   ├── user.ts
│   │   └── ai.ts
│   ├── utils/
│   │   ├── canvasUtils.ts
│   │   ├── shapeDefaults.ts
│   │   └── aiHelpers.ts
│   ├── config/
│   │   ├── firebase.config.ts
│   │   └── canvas.config.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/                    # ⭐ Test directory
│   ├── mocks/
│   │   └── firebaseMock.ts
│   ├── unit/
│   │   ├── auth.test.ts       # MVP CRITICAL
│   │   ├── authErrors.test.ts
│   │   ├── LoginButton.test.tsx
│   │   ├── canvasUtils.test.ts
│   │   ├── shapeDefaults.test.ts
│   │   ├── aiHelpers.test.ts
│   │   └── ...
│   ├── integration/
│   │   ├── authProvider.test.tsx  # MVP CRITICAL
│   │   ├── cursorSync.test.ts
│   │   ├── objectSync.test.ts
│   │   ├── aiCommands.test.ts
│   │   └── ...
│   └── setup.ts
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts          # ⭐ Test configuration
├── README.md
├── CollabCanvas-PRD.md
└── TASK_LIST.md
```

---

## MVP Phase (24 Hours) - PRs 1-8

### PR #1: Project Setup & Configuration

**Goal:** Initialize React + TypeScript + Vite project with Firebase integration

**Branch:** `feature/project-setup`

#### Subtasks:
- [ ] **1.1 Initialize Vite + React + TypeScript project**
  - Run: `npm create vite@latest collabcanvas -- --template react-ts`
  - Files created: All base Vite files

- [ ] **1.2 Install core dependencies**
  - Run: `npm install firebase react-router-dom`
  - Run: `npm install -D @types/node`
  - Files modified: `package.json`, `package-lock.json`

- [ ] **1.3 Install Konva.js and react-konva**
  - Run: `npm install konva react-konva`
  - Run: `npm install -D @types/react-konva`
  - Files modified: `package.json`
  - **Why Konva.js:** Declarative React integration, built-in drag/resize/hit detection, saves 10-15 hours vs PixiJS manual integration

- [ ] **1.4 Install state management and UI dependencies**
  - Run: `npm install zustand lucide-react`
  - Files modified: `package.json`
  - **Why Zustand:** Better performance with 500+ objects via selective subscriptions, simpler than Context+useReducer

- [ ] **🧪 1.5 Install testing framework (Vitest + Testing Library)**
  - Run: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
  - Files created: `vitest.config.ts`, `tests/setup.ts`
  - Files modified: `package.json` (add test scripts)
  - Content:
    ```json
    "scripts": {
      "test": "vitest",
      "test:ui": "vitest --ui",
      "test:coverage": "vitest --coverage"
    }
    ```

- [ ] **🧪 1.6 Install and configure Firebase Emulator**
  - Run: `npm install -D firebase-tools`
  - Run: `npx firebase init emulators` (select Auth, Firestore, Realtime Database)
  - Files created: `firebase.json`, `.firebaserc`
  - Files modified: `package.json` (add emulator scripts)
  - Content:
    ```json
    "scripts": {
      "emulators": "firebase emulators:start",
      "test:integration": "firebase emulators:exec --only auth,firestore,database 'vitest run tests/integration'"
    }
    ```
  - Configure emulator ports: Auth (9099), Firestore (8080), RTDB (9000)
  - **Why emulator:** Integration tests will use real Firebase behavior without mocks, catching Firestore-specific issues

- [ ] **1.7 Create environment file structure**
  - Files created:
    - `.env.local` (add to .gitignore)
    - `.env.example` (template for others)
  - Files modified: `.gitignore`

- [ ] **1.8 Set up base folder structure**
  - Files created:
    - `src/components/` (empty)
    - `src/hooks/` (empty)
    - `src/services/` (empty)
    - `src/types/` (empty)
    - `src/utils/` (empty)
    - `src/config/` (empty)
    - `tests/unit/` (empty)
    - `tests/integration/` (empty)

- [ ] **1.9 Create TypeScript types foundation**
  - Files created:
    - `src/types/canvas.ts`
    - `src/types/shapes.ts`
    - `src/types/user.ts`
  - Content: Base interfaces for Canvas, Shape, User

- [ ] **1.10 Create canvas configuration**
  - Files created:
    - `src/config/canvas.config.ts`
  - Content: Canvas dimensions (5000x5000), default shapes (100x100), zoom limits

- [ ] **🧪 1.11 Create unit tests for canvas config**
  - Files created:
    - `tests/unit/canvasConfig.test.ts`
  - Content: Test that config constants are correct
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { CANVAS_CONFIG } from '@/config/canvas.config'

    describe('Canvas Config', () => {
      it('should have correct canvas dimensions', () => {
        expect(CANVAS_CONFIG.width).toBe(5000)
        expect(CANVAS_CONFIG.height).toBe(5000)
      })

      it('should have valid zoom limits', () => {
        expect(CANVAS_CONFIG.minZoom).toBe(0.1)
        expect(CANVAS_CONFIG.maxZoom).toBe(5)
        expect(CANVAS_CONFIG.minZoom).toBeLessThan(CANVAS_CONFIG.maxZoom)
      })
    })
    ```

- [ ] **1.12 Create Firebase configuration (empty placeholders)**
  - Files created:
    - `src/config/firebase.config.ts`
  - Content: Export Firebase config object (will be filled in PR #2)

- [ ] **1.13 Update README with setup instructions**
  - Files modified: `README.md`
  - Content: Project description, setup steps, tech stack (mention Konva.js)

- [ ] **1.14 Clean up default Vite files**
  - Files deleted: `src/App.css`, unnecessary assets
  - Files modified: `src/App.tsx` (basic shell), `src/index.css` (reset styles)

- [ ] **🧪 1.15 Verify tests run**
  - Run: `npm test`
  - Verify test passes

**Files Created/Modified:**
- Created: `.env.example`, `src/types/*.ts`, `src/config/*.ts`, `tests/` folder structure, `vitest.config.ts`, `tests/unit/canvasConfig.test.ts`
- Modified: `package.json`, `.gitignore`, `README.md`, `src/App.tsx`, `src/index.css`

**Acceptance Criteria:**
- [ ] Project runs with `npm run dev`
- [ ] No TypeScript errors
- [ ] Folder structure matches plan
- [ ] README has clear setup instructions
- [ ] ✅ Tests run with `npm test` and pass

---

### PR #2: Firebase Setup & Google Authentication

**Goal:** Set up Firebase project and implement Google Sign-In

**Branch:** `feature/auth`

**Dependencies:** PR #1

#### Subtasks:
- [ ] **2.1 Create Firebase project**
  - Action: Go to Firebase Console, create new project
  - Enable Google Analytics (optional)
  - Copy Firebase config keys

- [ ] **2.2 Enable Firebase Authentication**
  - Action: In Firebase Console → Authentication → Sign-in method
  - Enable "Google" provider
  - No files changed yet

- [ ] **2.3 Enable Firestore Database**
  - Action: In Firebase Console → Firestore Database → Create database
  - Start in "test mode" (will add security rules later)
  - Select region (closest to you)

- [ ] **2.4 Enable Realtime Database (for cursors)**
  - Action: In Firebase Console → Realtime Database → Create database
  - Start in "test mode"
  - Select region

- [ ] **2.5 Add Firebase config to project**
  - Files modified:
    - `.env.local` (add Firebase keys - DO NOT COMMIT)
    - `.env.example` (add placeholder keys for others)
    - `src/config/firebase.config.ts` (implement Firebase initialization)
  - Content: Initialize Firebase app, auth, firestore, rtdb

- [ ] **2.6 Create Firebase service modules**
  - Files created:
    - `src/services/firebase.ts` - Export initialized Firebase instances
    - `src/services/auth.ts` - Authentication helpers
    - `src/services/firestore.ts` - Firestore helpers (empty for now)
    - `src/services/rtdb.ts` - Realtime Database helpers (empty for now)

- [ ] **2.7 Create AuthProvider context**
  - Files created:
    - `src/components/auth/AuthProvider.tsx`
  - Content: React Context for auth state, useAuth hook

- [ ] **2.8 Create LoginButton component**
  - Files created:
    - `src/components/auth/LoginButton.tsx`
  - Content: "Sign in with Google" button, calls Firebase auth

- [ ] **2.9 Create Header component with auth**
  - Files created:
    - `src/components/layout/Header.tsx`
  - Content: App header, displays user info when logged in, logout button

- [ ] **2.10 Integrate auth into App.tsx**
  - Files modified:
    - `src/App.tsx`
  - Content: Wrap app with AuthProvider, show login screen if not authenticated

- [ ] **2.11 Test authentication flow**
  - Action: Sign in with Google, verify user info displays
  - Check Firebase Console → Authentication → Users (should see your account)

- [ ] **🧪 2.12 Install Firebase testing utilities**
  - Run: `npm install -D @firebase/rules-unit-testing firebase-mock`
  - Files modified: `package.json`
  - Content: Setup Firebase mocking for tests

- [ ] **🧪 2.13 Create mock Firebase auth setup (MVP CRITICAL)**
  - Files created:
    - `tests/mocks/firebaseMock.ts`
  - Content:
    ```typescript
    import { vi } from 'vitest'

    // Mock Firebase auth
    export const mockSignInWithPopup = vi.fn()
    export const mockSignOut = vi.fn()
    export const mockOnAuthStateChanged = vi.fn()

    export const createMockUser = (overrides = {}) => ({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      ...overrides
    })

    export const mockAuth = {
      currentUser: null,
      signInWithPopup: mockSignInWithPopup,
      signOut: mockSignOut,
      onAuthStateChanged: mockOnAuthStateChanged
    }

    // Mock Firebase
    vi.mock('@/services/firebase', () => ({
      auth: mockAuth,
      db: {},
      rtdb: {}
    }))
    ```

- [ ] **🧪 2.14 Create unit tests for auth service (MVP CRITICAL)**
  - Files created:
    - `tests/unit/auth.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect, vi, beforeEach } from 'vitest'
    import { signInWithGoogle, signOut, getCurrentUser } from '@/services/auth'
    import { mockSignInWithPopup, mockSignOut, createMockUser } from '../mocks/firebaseMock'

    describe('Authentication Service - MVP CRITICAL', () => {
      beforeEach(() => {
        vi.clearAllMocks()
      })

      describe('signInWithGoogle (MVP)', () => {
        it('should sign in user successfully', async () => {
          const mockUser = createMockUser()
          mockSignInWithPopup.mockResolvedValue({
            user: mockUser
          })

          const result = await signInWithGoogle()

          expect(mockSignInWithPopup).toHaveBeenCalledTimes(1)
          expect(result.user.email).toBe('test@example.com')
          expect(result.user.displayName).toBe('Test User')
        })

        it('should handle sign-in error', async () => {
          mockSignInWithPopup.mockRejectedValue(
            new Error('auth/popup-closed-by-user')
          )

          await expect(signInWithGoogle()).rejects.toThrow('popup-closed-by-user')
        })

        it('should handle network error', async () => {
          mockSignInWithPopup.mockRejectedValue(
            new Error('auth/network-request-failed')
          )

          await expect(signInWithGoogle()).rejects.toThrow('network-request-failed')
        })
      })

      describe('signOut (MVP)', () => {
        it('should sign out user successfully', async () => {
          mockSignOut.mockResolvedValue(undefined)

          await signOut()

          expect(mockSignOut).toHaveBeenCalledTimes(1)
        })

        it('should handle sign-out error', async () => {
          mockSignOut.mockRejectedValue(new Error('Sign out failed'))

          await expect(signOut()).rejects.toThrow('Sign out failed')
        })
      })

      describe('getCurrentUser (MVP)', () => {
        it('should return current user when signed in', () => {
          const mockUser = createMockUser()
          mockAuth.currentUser = mockUser

          const user = getCurrentUser()

          expect(user).toEqual(mockUser)
        })

        it('should return null when not signed in', () => {
          mockAuth.currentUser = null

          const user = getCurrentUser()

          expect(user).toBeNull()
        })
      })
    })
    ```

- [ ] **🧪 2.15 Create integration tests for AuthProvider (MVP CRITICAL)**
  - Files created:
    - `tests/integration/authProvider.test.tsx`
  - Content:
    ```typescript
    import { describe, it, expect, beforeEach, vi } from 'vitest'
    import { render, screen, waitFor } from '@testing-library/react'
    import userEvent from '@testing-library/user-event'
    import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'
    import { mockOnAuthStateChanged, createMockUser } from '../mocks/firebaseMock'

    // Test component that uses auth
    function TestComponent() {
      const { user, loading, signIn, signOut } = useAuth()

      if (loading) return <div>Loading...</div>
      if (!user) return <button onClick={signIn}>Sign In</button>
      return (
        <div>
          <div>Welcome {user.displayName}</div>
          <button onClick={signOut}>Sign Out</button>
        </div>
      )
    }

    describe('AuthProvider Integration - MVP CRITICAL', () => {
      beforeEach(() => {
        vi.clearAllMocks()
      })

      it('should render loading state initially', () => {
        mockOnAuthStateChanged.mockImplementation((callback) => {
          // Don't call callback immediately
          return () => {}
        })

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })

      it('should render signed out state when no user', async () => {
        mockOnAuthStateChanged.mockImplementation((callback) => {
          callback(null) // No user
          return () => {}
        })

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )

        await waitFor(() => {
          expect(screen.getByText('Sign In')).toBeInTheDocument()
        })
      })

      it('should render user info when signed in', async () => {
        const mockUser = createMockUser()
        mockOnAuthStateChanged.mockImplementation((callback) => {
          callback(mockUser)
          return () => {}
        })

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )

        await waitFor(() => {
          expect(screen.getByText('Welcome Test User')).toBeInTheDocument()
        })
      })

      it('should persist auth state on mount', async () => {
        const mockUser = createMockUser()
        mockOnAuthStateChanged.mockImplementation((callback) => {
          // Simulate Firebase restoring auth state
          setTimeout(() => callback(mockUser), 100)
          return () => {}
        })

        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )

        // Initially loading
        expect(screen.getByText('Loading...')).toBeInTheDocument()

        // Then shows user
        await waitFor(() => {
          expect(screen.getByText('Welcome Test User')).toBeInTheDocument()
        })
      })
    })
    ```

- [ ] **🧪 2.16 Create tests for auth error handling (NICE TO HAVE)**
  - Files created:
    - `tests/unit/authErrors.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import {
      getAuthErrorMessage,
      isAuthError,
      AuthErrorCode
    } from '@/services/auth'

    describe('Auth Error Handling - Nice to Have', () => {
      describe('getAuthErrorMessage', () => {
        it('should return user-friendly message for popup-closed', () => {
          const error = { code: 'auth/popup-closed-by-user' }
          expect(getAuthErrorMessage(error)).toBe(
            'Sign-in cancelled. Please try again.'
          )
        })

        it('should return user-friendly message for network error', () => {
          const error = { code: 'auth/network-request-failed' }
          expect(getAuthErrorMessage(error)).toBe(
            'Network error. Please check your connection.'
          )
        })

        it('should return user-friendly message for popup-blocked', () => {
          const error = { code: 'auth/popup-blocked' }
          expect(getAuthErrorMessage(error)).toBe(
            'Pop-up blocked. Please allow pop-ups for this site.'
          )
        })

        it('should return generic message for unknown error', () => {
          const error = { code: 'auth/unknown-error' }
          expect(getAuthErrorMessage(error)).toBe(
            'An error occurred. Please try again.'
          )
        })
      })

      describe('isAuthError', () => {
        it('should identify Firebase auth errors', () => {
          const error = { code: 'auth/popup-closed-by-user' }
          expect(isAuthError(error)).toBe(true)
        })

        it('should return false for non-auth errors', () => {
          const error = new Error('Something went wrong')
          expect(isAuthError(error)).toBe(false)
        })
      })
    })
    ```

- [ ] **🧪 2.17 Create tests for LoginButton component (NICE TO HAVE)**
  - Files created:
    - `tests/unit/LoginButton.test.tsx`
  - Content:
    ```typescript
    import { describe, it, expect, vi } from 'vitest'
    import { render, screen } from '@testing-library/react'
    import userEvent from '@testing-library/user-event'
    import { LoginButton } from '@/components/auth/LoginButton'
    import { mockSignInWithPopup } from '../mocks/firebaseMock'

    describe('LoginButton Component - Nice to Have', () => {
      it('should render sign in button', () => {
        render(<LoginButton />)
        expect(screen.getByText(/sign in with google/i)).toBeInTheDocument()
      })

      it('should call signIn when clicked', async () => {
        const user = userEvent.setup()
        render(<LoginButton />)

        const button = screen.getByText(/sign in with google/i)
        await user.click(button)

        expect(mockSignInWithPopup).toHaveBeenCalled()
      })

      it('should show loading state while signing in', async () => {
        mockSignInWithPopup.mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 1000))
        )

        const user = userEvent.setup()
        render(<LoginButton />)

        const button = screen.getByText(/sign in with google/i)
        await user.click(button)

        expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      })

      it('should show error message on sign-in failure', async () => {
        mockSignInWithPopup.mockRejectedValue(
          new Error('auth/popup-closed-by-user')
        )

        const user = userEvent.setup()
        render(<LoginButton />)

        const button = screen.getByText(/sign in with google/i)
        await user.click(button)

        await waitFor(() => {
          expect(screen.getByText(/sign-in cancelled/i)).toBeInTheDocument()
        })
      })
    })
    ```

- [ ] **🧪 2.18 Run auth tests and verify (MVP CRITICAL)**
  - Run: `npm test tests/unit/auth.test.ts`
  - Run: `npm test tests/integration/authProvider.test.tsx`
  - Verify all MVP-critical tests pass
  - Fix any failing tests before proceeding

**Files Created/Modified:**
- Created: `src/services/firebase.ts`, `src/services/auth.ts`, `src/services/firestore.ts`, `src/services/rtdb.ts`, `src/components/auth/*`, `src/components/layout/Header.tsx`, `tests/mocks/firebaseMock.ts`, `tests/unit/auth.test.ts`, `tests/integration/authProvider.test.tsx`, `tests/unit/authErrors.test.ts`, `tests/unit/LoginButton.test.tsx`
- Modified: `.env.local`, `.env.example`, `src/config/firebase.config.ts`, `src/App.tsx`, `package.json`

**Acceptance Criteria:**
- [ ] Google Sign-In works
- [ ] User info displays in header
- [ ] Logout works
- [ ] Auth state persists on refresh
- [ ] Firebase project is fully configured
- [ ] ✅ All MVP-critical auth tests pass (signIn, signOut, getCurrentUser, AuthProvider)
- [ ] ✅ Error handling tested

**MVP-Critical Test Subset:**
- ✅ `tests/unit/auth.test.ts` - Core auth functions (signIn, signOut, getCurrentUser)
- ✅ `tests/integration/authProvider.test.tsx` - Auth state management and persistence
- ⚠️ Nice to have: `tests/unit/authErrors.test.ts`, `tests/unit/LoginButton.test.tsx`

---

### PR #3: Basic Canvas with Pan/Zoom

**Goal:** Implement Konva.js canvas with pan and zoom functionality using react-konva

**Branch:** `feature/canvas-foundation`

**Dependencies:** PR #1, PR #2

**⭐ Konva.js Advantage:** This PR is 1-2 hours instead of 4-6 hours with PixiJS due to built-in pan/zoom support

#### Subtasks:
- [ ] **3.1 Create Zustand canvas store**
  - Files created:
    - `src/stores/canvasStore.ts`
  - Content: Zustand store for canvas state (shapes, viewport, selectedIds)
  - Example:
    ```typescript
    import { create } from 'zustand'

    const useCanvasStore = create((set) => ({
      shapes: [],
      selectedIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
      updateViewport: (viewport) => set({ viewport })
    }))
    ```

- [ ] **3.2 Create Canvas component with react-konva**
  - Files created:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    ```tsx
    import { Stage, Layer } from 'react-konva'
    import { useCanvasStore } from '@/stores/canvasStore'

    // Read viewport from Zustand store
    const viewport = useCanvasStore(state => state.viewport)
    const updateViewport = useCanvasStore(state => state.updateViewport)

    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={viewport.zoom}
      scaleY={viewport.zoom}
      x={viewport.x}
      y={viewport.y}
      draggable={true}  // ✅ Built-in pan!
      onWheel={handleZoom}
      onDragEnd={(e) => updateViewport({ ...viewport, x: e.target.x(), y: e.target.y() })}
    >
      <Layer>
        {/* Shapes will go here */}
      </Layer>
    </Stage>
    ```
  - Set virtual canvas size (5000x5000) via bounds checking
  - Handle Stage mount/unmount

- [ ] **3.3 Implement pan functionality (Built-in!)**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Use `draggable={true}` on Stage (no manual tracking needed!)
    - Add `onDragEnd` handler to track final pan position
    - Optionally add bounds checking to prevent panning off canvas

- [ ] **3.4 Implement zoom functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Add `onWheel` handler to Stage
    - Calculate new zoom based on wheel delta
    - Zoom toward mouse position using pointer position
    - Clamp zoom between min/max (0.1 - 5.0)
    - Update Stage `scaleX` and `scaleY` props

- [ ] **3.5 Create canvas utility functions**
  - Files created:
    - `src/utils/canvasUtils.ts`
  - Content:
    - `screenToCanvas(screenX, screenY, viewport)` - Convert screen coords to canvas coords
    - `canvasToScreen(canvasX, canvasY, viewport)` - Convert canvas coords to screen coords
    - `clampZoom(zoom)` - Ensure zoom is within bounds

- [ ] **🧪 3.6 Create unit tests for canvas utilities**
  - Files created:
    - `tests/unit/canvasUtils.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { screenToCanvas, canvasToScreen, clampZoom } from '@/utils/canvasUtils'

    describe('Canvas Utilities', () => {
      describe('screenToCanvas', () => {
        it('should convert screen coordinates to canvas coordinates', () => {
          const viewport = { x: 0, y: 0, scale: 1 }
          const result = screenToCanvas(100, 200, viewport)
          expect(result).toEqual({ x: 100, y: 200 })
        })

        it('should handle viewport offset', () => {
          const viewport = { x: 50, y: 100, scale: 1 }
          const result = screenToCanvas(100, 200, viewport)
          expect(result).toEqual({ x: 150, y: 300 })
        })

        it('should handle zoom scale', () => {
          const viewport = { x: 0, y: 0, scale: 2 }
          const result = screenToCanvas(100, 200, viewport)
          expect(result).toEqual({ x: 50, y: 100 })
        })
      })

      describe('canvasToScreen', () => {
        it('should convert canvas coordinates to screen coordinates', () => {
          const viewport = { x: 0, y: 0, scale: 1 }
          const result = canvasToScreen(100, 200, viewport)
          expect(result).toEqual({ x: 100, y: 200 })
        })
      })

      describe('clampZoom', () => {
        it('should clamp zoom to minimum value', () => {
          expect(clampZoom(0.05)).toBe(0.1)
        })

        it('should clamp zoom to maximum value', () => {
          expect(clampZoom(10)).toBe(5)
        })

        it('should not clamp valid zoom values', () => {
          expect(clampZoom(1)).toBe(1)
          expect(clampZoom(2.5)).toBe(2.5)
        })
      })
    })
    ```

- [ ] **🧪 3.7 Run and verify tests**
  - Run: `npm test`
  - Verify all tests pass
  - Fix any failing tests before proceeding

- [ ] **3.8 Create CanvasControls component**
  - Files created:
    - `src/components/canvas/CanvasControls.tsx`
  - Content:
    - Zoom in/out buttons
    - Reset view button (center and zoom 1.0)
    - Display current zoom level

- [ ] **3.9 Add visual grid (optional but helpful)**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Use Konva `<Line>` components to draw grid
    - Grid updates as you pan/zoom (react-konva handles this automatically)
    - Consider using `<Group>` for grid lines

- [ ] **3.10 Integrate canvas into App**
  - Files modified:
    - `src/App.tsx`
  - Content:
    - Render Canvas component when authenticated
    - Add CanvasControls overlay

- [ ] **3.11 Test pan and zoom**
  - Action: Click and drag to pan, scroll to zoom
  - Verify smooth 60 FPS performance

**Files Created/Modified:**
- Created: `src/hooks/useCanvas.ts`, `src/components/canvas/Canvas.tsx`, `src/components/canvas/CanvasControls.tsx`, `src/utils/canvasUtils.ts`, `tests/unit/canvasUtils.test.ts`
- Modified: `src/App.tsx`

**Acceptance Criteria:**
- [ ] Canvas displays at 5000x5000
- [ ] Can pan by clicking and dragging
- [ ] Can zoom with mouse wheel
- [ ] Zoom centers on mouse position
- [ ] 60 FPS during pan/zoom
- [ ] Controls work (zoom buttons, reset view)
- [ ] ✅ All unit tests pass

---

### PR #4: Realtime Cursor Sync (CRITICAL)

**Goal:** Implement multiplayer cursor sync with name labels

**Branch:** `feature/cursor-sync`

**Dependencies:** PR #1, PR #2, PR #3

**NOTE:** This is the hardest part. Get this working before moving on!

#### Subtasks:
- [ ] **4.1 Create cursor types**
  - Files modified:
    - `src/types/user.ts`
  - Content:
    - `CursorPosition` interface (x, y, userId, userName, color, timestamp)

- [ ] **4.2 Create useCursors hook**
  - Files created:
    - `src/hooks/useCursors.ts`
  - Content:
    - Track local cursor position
    - Send cursor updates to Firebase RTDB
    - Listen to other users' cursors
    - Return map of cursors by userId

- [ ] **4.3 Implement cursor position tracking**
  - Files modified:
    - `src/hooks/useCursors.ts`
  - Content:
    - Listen to mousemove on canvas
    - Convert screen coords to canvas coords
    - Throttle updates to 20 per second (avoid spam)

- [ ] **🧪 4.4 Create throttle utility with tests**
  - Files created:
    - `src/utils/throttle.ts`
    - `tests/unit/throttle.test.ts`
  - Content:
    ```typescript
    // tests/unit/throttle.test.ts
    import { describe, it, expect, vi } from 'vitest'
    import { throttle } from '@/utils/throttle'

    describe('throttle', () => {
      it('should call function immediately on first call', () => {
        const fn = vi.fn()
        const throttled = throttle(fn, 100)
        throttled()
        expect(fn).toHaveBeenCalledTimes(1)
      })

      it('should throttle subsequent calls', async () => {
        const fn = vi.fn()
        const throttled = throttle(fn, 100)
        throttled()
        throttled()
        throttled()
        expect(fn).toHaveBeenCalledTimes(1)

        await new Promise(r => setTimeout(r, 150))
        throttled()
        expect(fn).toHaveBeenCalledTimes(2)
      })
    })
    ```

- [ ] **4.5 Implement cursor broadcasting to Firebase RTDB**
  - Files modified:
    - `src/services/rtdb.ts`
    - `src/hooks/useCursors.ts`
  - Content:
    - Write cursor position to: `cursors/{canvasId}/{userId}`
    - Include: x, y, userId, userName, color, timestamp
    - Use RTDB (not Firestore) for cost efficiency

- [ ] **4.6 Listen to other users' cursors**
  - Files modified:
    - `src/hooks/useCursors.ts`
  - Content:
    - Listen to: `cursors/{canvasId}`
    - Filter out own cursor
    - Update state with other users' cursors

- [ ] **4.7 Create CursorOverlay component**
  - Files created:
    - `src/components/collaboration/CursorOverlay.tsx`
  - Content:
    - Render SVG cursors for each user
    - Position based on canvas coords
    - Different color per user
    - Name label follows cursor

- [ ] **4.8 Integrate cursor overlay with canvas**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
    - `src/App.tsx`
  - Content:
    - Render CursorOverlay on top of canvas
    - Pass cursor positions and viewport transform

- [ ] **4.9 Handle cursor cleanup on disconnect**
  - Files modified:
    - `src/hooks/useCursors.ts`
    - `src/services/rtdb.ts`
  - Content:
    - Use Firebase onDisconnect() to remove cursor on disconnect
    - Remove stale cursors after 10 seconds

- [ ] **🧪 4.10 Create integration test for cursor sync**
  - Files created:
    - `tests/integration/cursorSync.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect, beforeEach, afterEach } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { useCursors } from '@/hooks/useCursors'

    describe('Cursor Sync Integration', () => {
      // Note: This requires Firebase emulator or mocked Firebase

      it('should track and update cursor position', async () => {
        const { result } = renderHook(() => useCursors('test-canvas-id'))

        act(() => {
          // Simulate cursor move
          result.current.updateCursorPosition(100, 200)
        })

        // Wait for debounce/throttle
        await new Promise(r => setTimeout(r, 100))

        // Verify cursor was updated
        expect(result.current.localCursor).toEqual({
          x: 100,
          y: 200
        })
      })

      it('should throttle cursor updates', async () => {
        const { result } = renderHook(() => useCursors('test-canvas-id'))

        const updateCount = vi.fn()

        // Rapid fire 10 updates
        for (let i = 0; i < 10; i++) {
          act(() => {
            result.current.updateCursorPosition(i, i)
          })
          updateCount()
        }

        // Should be throttled to ~1-2 calls (20 per second = 50ms interval)
        expect(updateCount).toHaveBeenCalledTimes(10)
        // But actual Firebase writes should be throttled
      })
    })
    ```

- [ ] **4.11 Test with 2 browser windows**
  - Action:
    - Open app in 2 different browsers (or incognito)
    - Sign in as different users
    - Move mouse in one window, see cursor in other
  - Verify:
    - Cursor position syncs smoothly
    - Name labels display correctly
    - No lag or jitter

**Files Created/Modified:**
- Created: `src/hooks/useCursors.ts`, `src/components/collaboration/CursorOverlay.tsx`, `src/utils/throttle.ts`, `tests/unit/throttle.test.ts`, `tests/integration/cursorSync.test.ts`
- Modified: `src/types/user.ts`, `src/services/rtdb.ts`, `src/components/canvas/Canvas.tsx`, `src/App.tsx`

**Acceptance Criteria:**
- [ ] Cursor position syncs between 2+ users
- [ ] Cursor updates <50ms
- [ ] Name labels display for each cursor
- [ ] Different color per user
- [ ] Cursor disappears when user disconnects
- [ ] No performance issues (60 FPS maintained)
- [ ] ✅ All tests pass (unit + integration)

**CRITICAL:** Do NOT proceed to PR #5 until cursor sync is working perfectly AND tests are passing!

---

### PR #5: Object Creation & Firestore Sync

**Goal:** Create rectangles and sync them across users in real-time

**Branch:** `feature/object-sync`

**Dependencies:** PR #1, PR #2, PR #3, PR #4

#### Subtasks:
- [ ] **5.1 Update shape types**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - `Shape` interface (id, type, x, y, width, height, color, etc.)
    - `Rectangle` type extends Shape

- [ ] **5.2 Create shape defaults**
  - Files created:
    - `src/utils/shapeDefaults.ts`
  - Content:
    - Default rectangle: 100x100, blue fill
    - Helper: `createDefaultRectangle(x, y)`

- [ ] **🧪 5.3 Create unit tests for shape defaults**
  - Files created:
    - `tests/unit/shapeDefaults.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { createDefaultRectangle } from '@/utils/shapeDefaults'

    describe('Shape Defaults', () => {
      describe('createDefaultRectangle', () => {
        it('should create rectangle with correct position', () => {
          const rect = createDefaultRectangle(100, 200)
          expect(rect.x).toBe(100)
          expect(rect.y).toBe(200)
        })

        it('should create rectangle with default size', () => {
          const rect = createDefaultRectangle(0, 0)
          expect(rect.width).toBe(100)
          expect(rect.height).toBe(100)
        })

        it('should create rectangle with default color', () => {
          const rect = createDefaultRectangle(0, 0)
          expect(rect.color).toBe('#3B82F6') // Blue
        })

        it('should generate unique IDs', () => {
          const rect1 = createDefaultRectangle(0, 0)
          const rect2 = createDefaultRectangle(0, 0)
          expect(rect1.id).not.toBe(rect2.id)
        })
      })
    })
    ```

- [ ] **5.4 Create Toolbar component**
  - Files created:
    - `src/components/canvas/Toolbar.tsx`
  - Content:
    - Button to select rectangle tool
    - Shows currently selected tool
    - Simple UI (vertical toolbar on left side)

- [ ] **5.5 Implement rectangle creation on click**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - When canvas clicked (not on object), create rectangle at that position
    - Use default size (100x100)
    - Generate unique ID (uuid)
    - Add to local state

- [ ] **5.6 Create ShapeRenderer component**
  - Files created:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Renders Konva shapes (`<Rect>`, `<Circle>`) for each shape
    - Takes shape data, renders appropriate react-konva component
    - Handles rectangle drawing declaratively

- [ ] **5.7 Integrate shape rendering**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Map shapes array to `<ShapeRenderer>` components inside `<Layer>`
    - React automatically re-renders when shapes change (no manual updates needed!)

- [ ] **5.8 Implement Firestore write for new shapes**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `createShape(canvasId, shape)` - Write shape to Firestore
    - Path: `canvases/{canvasId}/objects/{shapeId}`

- [ ] **5.9 Create useFirestore hook**
  - Files created:
    - `src/hooks/useFirestore.ts`
  - Content:
    - Listen to shapes collection
    - Return shapes array
    - Auto-update when Firestore changes

- [ ] **5.10 Sync local shape creation to Firestore**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - When shape created locally, write to Firestore
    - Optimistic update (show immediately, sync in background)

- [ ] **5.11 Sync Firestore shapes to local state**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Listen to useFirestore hook
    - Update shapes state when Firestore changes
    - Deduplicate (avoid showing same shape twice)

- [ ] **🧪 5.12 Create integration test for object sync**
  - Files created:
    - `tests/integration/objectSync.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { useFirestore } from '@/hooks/useFirestore'
    import { createDefaultRectangle } from '@/utils/shapeDefaults'

    describe('Object Sync Integration', () => {
      it('should sync shape creation to Firestore', async () => {
        const { result } = renderHook(() => useFirestore('test-canvas-id'))

        const shape = createDefaultRectangle(100, 200)

        act(() => {
          result.current.createShape(shape)
        })

        // Wait for Firestore write
        await new Promise(r => setTimeout(r, 500))

        // Verify shape appears in shapes array
        expect(result.current.shapes).toContainEqual(
          expect.objectContaining({ id: shape.id })
        )
      })
    })
    ```

- [ ] **5.13 Test object sync with 2 users**
  - Action:
    - Open 2 browser windows
    - Create rectangle in window 1
    - Verify it appears in window 2 instantly
  - Check Firestore Console to see shape data

**Files Created/Modified:**
- Created: `src/components/canvas/Toolbar.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/hooks/useFirestore.ts`, `src/utils/shapeDefaults.ts`, `tests/unit/shapeDefaults.test.ts`, `tests/integration/objectSync.test.ts`
- Modified: `src/types/shapes.ts`, `src/services/firestore.ts`, `src/components/canvas/Canvas.tsx`

**Acceptance Criteria:**
- [ ] Can create rectangles by clicking canvas
- [ ] Rectangles render correctly (100x100, blue)
- [ ] Rectangles sync between users <100ms
- [ ] Shapes persist in Firestore
- [ ] Shapes reload on page refresh
- [ ] 60 FPS maintained
- [ ] ✅ All tests pass

---

### PR #6: Object Manipulation (Move/Drag)

**Goal:** Select and drag objects, sync movements across users

**Branch:** `feature/object-manipulation`

**Dependencies:** PR #1-5

#### Subtasks:
- [ ] **6.1 Implement object selection**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Detect click on shape (hit testing)
    - Set selected shape in state
    - Visual feedback (highlight selected shape)

- [ ] **🧪 6.2 Create unit tests for hit testing**
  - Files created:
    - `tests/unit/hitTesting.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { isPointInRectangle } from '@/utils/hitTesting'

    describe('Hit Testing', () => {
      describe('isPointInRectangle', () => {
        it('should return true when point is inside rectangle', () => {
          const rect = { x: 0, y: 0, width: 100, height: 100 }
          expect(isPointInRectangle(50, 50, rect)).toBe(true)
        })

        it('should return false when point is outside rectangle', () => {
          const rect = { x: 0, y: 0, width: 100, height: 100 }
          expect(isPointInRectangle(150, 150, rect)).toBe(false)
        })

        it('should handle edge cases', () => {
          const rect = { x: 0, y: 0, width: 100, height: 100 }
          expect(isPointInRectangle(0, 0, rect)).toBe(true)
          expect(isPointInRectangle(100, 100, rect)).toBe(true)
          expect(isPointInRectangle(101, 101, rect)).toBe(false)
        })
      })
    })
    ```

- [ ] **6.3 Add selection visual feedback**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Draw selection outline on selected shape
    - Different color or stroke width

- [ ] **6.4 Implement drag functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - On mouse down on shape: start dragging
    - On mouse move: update shape position
    - On mouse up: stop dragging
    - Handle viewport transform (canvas coords vs screen coords)

- [ ] **6.5 Sync position updates to Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `updateShapePosition(canvasId, shapeId, x, y)` - Update in Firestore

- [ ] **6.6 Throttle position updates during drag**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Don't write to Firestore every frame (too expensive)
    - Throttle to 10-20 updates per second
    - Final position written on mouse up

- [ ] **6.7 Implement optimistic updates**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Update local state immediately on drag
    - Sync to Firestore in background
    - Smooth UX (no lag)

- [ ] **6.8 Handle simultaneous edits (last write wins)**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - No conflict resolution logic (last write wins)
    - Add timestamp to updates
    - Document this behavior in code comments

- [ ] **🧪 6.9 Create integration test for drag and sync**
  - Files created:
    - `tests/integration/dragSync.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { useFirestore } from '@/hooks/useFirestore'

    describe('Drag and Sync Integration', () => {
      it('should sync shape position updates', async () => {
        const { result } = renderHook(() => useFirestore('test-canvas-id'))

        const shapeId = 'test-shape-1'

        act(() => {
          result.current.updateShapePosition(shapeId, 200, 300)
        })

        await new Promise(r => setTimeout(r, 500))

        const shape = result.current.shapes.find(s => s.id === shapeId)
        expect(shape?.x).toBe(200)
        expect(shape?.y).toBe(300)
      })
    })
    ```

- [ ] **6.10 Test drag and sync**
  - Action:
    - Open 2 browser windows
    - Drag shape in window 1
    - Verify window 2 sees movement
  - Test edge cases:
    - Both users drag same shape (last write wins)
    - Rapid dragging

**Files Created/Modified:**
- Created: `tests/unit/hitTesting.test.ts`, `tests/integration/dragSync.test.ts`
- Modified: `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Can select shapes by clicking
- [ ] Selected shape has visual feedback
- [ ] Can drag shapes smoothly
- [ ] Drag updates sync to other users <100ms
- [ ] 60 FPS during drag
- [ ] Position persists after refresh
- [ ] ✅ All tests pass

---

### PR #7: Presence Awareness & MVP Polish

**Goal:** Show who's online, add basic UI polish

**Branch:** `feature/presence`

**Dependencies:** PR #1-6

#### Subtasks:
- [ ] **7.1 Create usePresence hook**
  - Files created:
    - `src/hooks/usePresence.ts`
  - Content:
    - Write own presence to Firestore on mount
    - Update lastSeen timestamp every 30 seconds
    - Listen to other users' presence
    - Return list of active users

- [ ] **7.2 Implement presence in Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `setUserPresence(canvasId, userId, userName, isActive)`
    - Path: `canvases/{canvasId}/users/{userId}`
    - Use onDisconnect() to set isActive=false on disconnect

- [ ] **7.3 Create UserList component**
  - Files created:
    - `src/components/collaboration/UserList.tsx`
  - Content:
    - Display list of online users
    - Show user name and colored dot
    - Count: "3 users online"

- [ ] **7.4 Create PresenceIndicator component**
  - Files created:
    - `src/components/collaboration/PresenceIndicator.tsx`
  - Content:
    - Small colored dots for each user
    - Shows in header or corner

- [ ] **7.5 Integrate presence into app**
  - Files modified:
    - `src/App.tsx`
    - `src/components/layout/Header.tsx`
  - Content:
    - Use usePresence hook
    - Display UserList in sidebar or header
    - Show presence indicator

- [ ] **🧪 7.6 Create integration test for presence**
  - Files created:
    - `tests/integration/presence.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { usePresence } from '@/hooks/usePresence'

    describe('Presence Integration', () => {
      it('should set user as active on mount', async () => {
        const { result } = renderHook(() => usePresence('test-canvas-id'))

        await new Promise(r => setTimeout(r, 500))

        expect(result.current.activeUsers).toContainEqual(
          expect.objectContaining({ isActive: true })
        )
      })

      it('should update lastSeen timestamp', async () => {
        const { result } = renderHook(() => usePresence('test-canvas-id'))

        const initialTimestamp = result.current.currentUser?.lastSeen

        // Wait for heartbeat (30 seconds in real, mocked in test)
        await new Promise(r => setTimeout(r, 1000))

        const updatedTimestamp = result.current.currentUser?.lastSeen
        expect(updatedTimestamp).toBeGreaterThan(initialTimestamp!)
      })
    })
    ```

- [ ] **7.7 Add basic error handling**
  - Files modified:
    - `src/services/firebase.ts`
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Try/catch around Firestore operations
    - Display error messages to user
    - Log errors to console

- [ ] **7.8 Add loading states**
  - Files modified:
    - `src/App.tsx`
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Show "Loading canvas..." while Firestore loads
    - Show spinner during auth
    - Prevent interaction until loaded

- [ ] **7.9 Polish UI styling**
  - Files modified:
    - `src/index.css`
    - Component files (add Tailwind classes)
  - Content:
    - Clean, modern design
    - Dark mode (optional)
    - Responsive layout
    - Professional look for demo

- [ ] **7.10 Add keyboard shortcuts**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Delete key: delete selected shape
    - Escape key: deselect shape
    - Space + drag: pan canvas (optional)

- [ ] **7.11 Test complete MVP flow**
  - Action:
    - Open 3 browser windows
    - Sign in as different users
    - Verify all features work:
      - ✓ Cursors sync
      - ✓ Shapes sync
      - ✓ Drag syncs
      - ✓ Presence shows all users
      - ✓ Persistence works
      - ✓ 60 FPS maintained

**Files Created/Modified:**
- Created: `src/hooks/usePresence.ts`, `src/components/collaboration/UserList.tsx`, `src/components/collaboration/PresenceIndicator.tsx`, `tests/integration/presence.test.ts`
- Modified: `src/services/firestore.ts`, `src/App.tsx`, `src/components/layout/Header.tsx`, `src/components/canvas/Canvas.tsx`, `src/index.css`

**Acceptance Criteria:**
- [ ] User list shows all online users
- [ ] Presence updates within 5 seconds of join/leave
- [ ] Loading states display correctly
- [ ] Basic error handling works
- [ ] UI looks polished and professional
- [ ] Delete key deletes selected shape
- [ ] ✅ All tests pass

---

### PR #8: Deployment & MVP Verification

**Goal:** Deploy to Vercel and verify MVP requirements

**Branch:** `feature/deployment`

**Dependencies:** PR #1-7

#### Subtasks:
- [ ] **8.1 Create production environment config**
  - Files created:
    - `.env.production` (add to .gitignore)
  - Content:
    - Production Firebase keys
    - Production API URLs

- [ ] **8.2 Update Firebase security rules**
  - Action: In Firebase Console
    - Firestore rules: Require authentication
    - RTDB rules: Require authentication
  - Files created (local documentation):
    - `firestore.rules` (for reference)
    - `rtdb.rules` (for reference)

- [ ] **8.3 Set up Vercel project**
  - Action: Go to Vercel.com
    - Import GitHub repo
    - Configure build settings (Vite)
    - Add environment variables

- [ ] **8.4 Configure Vercel deployment**
  - Files created:
    - `vercel.json` (optional, for SPA routing)
  - Content:
    - Redirect all routes to index.html

- [ ] **8.5 Deploy to Vercel**
  - Action: Push to main branch (or trigger deploy)
  - Verify deployment succeeds
  - Get public URL

- [ ] **8.6 Test deployed app**
  - Action: Open deployed URL
  - Test all MVP features:
    - [ ] Google Sign-In works
    - [ ] Canvas loads
    - [ ] Can create shapes
    - [ ] Can move shapes
    - [ ] Cursors sync
    - [ ] Presence works
    - [ ] Persistence works

- [ ] **8.7 Test with multiple users on deployed app**
  - Action: Open deployed URL in 2+ browsers/devices
  - Verify real-time sync works in production

- [ ] **8.8 Update README with deployed URL**
  - Files modified:
    - `README.md`
  - Content:
    - Add "Live Demo: [URL]" section
    - Update setup instructions for deployment

- [ ] **8.9 Create MVP verification checklist**
  - Files created:
    - `MVP_CHECKLIST.md`
  - Content:
    - List all 8 MVP requirements
    - Check off each one with evidence

- [ ] **8.10 Final MVP testing**
  - Action: Test ALL MVP requirements on deployed app:
    - [ ] Basic canvas with pan/zoom
    - [ ] At least one shape type (rectangle)
    - [ ] Ability to create and move objects
    - [ ] Real-time sync between 2+ users
    - [ ] Multiplayer cursors with name labels
    - [ ] Presence awareness (who's online)
    - [ ] User authentication (Google Sign-In)
    - [ ] Deployed and publicly accessible

- [ ] **🧪 8.11 Run full test suite**
  - Run: `npm test`
  - Verify all tests pass
  - Run: `npm run test:coverage` to check coverage
  - Aim for >70% coverage on critical paths

**Files Created/Modified:**
- Created: `.env.production`, `vercel.json`, `firestore.rules`, `rtdb.rules`, `MVP_CHECKLIST.md`
- Modified: `README.md`

**Acceptance Criteria:**
- [ ] App is deployed at public URL
- [ ] All MVP requirements verified and working
- [ ] Security rules implemented
- [ ] Performance targets met (60 FPS, <100ms sync)
- [ ] README has live demo link
- [ ] ✅ All tests pass (>70% coverage)

**🎉 MVP COMPLETE! Checkpoint passed!**

---

## Full Canvas Features (Days 2-4) - PRs 9-12

### PR #9: Multiple Shape Types (Circle, Line, Text)

**Goal:** Add circles, lines, and text shapes

**Branch:** `feature/multiple-shapes`

**Dependencies:** PR #1-8

#### Subtasks:
- [ ] **9.1 Update shape types**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - Add `Circle` type (x, y, radius, fillColor)
    - Add `Line` type (x1, y1, x2, y2, strokeColor, strokeWidth)
    - Add `Text` type (x, y, content, fontSize, color)

- [ ] **9.2 Add shape defaults**
  - Files modified:
    - `src/utils/shapeDefaults.ts`
  - Content:
    - `createDefaultCircle(x, y)` - 50px radius, red
    - `createDefaultLine(x, y)` - 150px horizontal, black
    - `createDefaultText(x, y)` - "Double-click to edit", 16px

- [ ] **🧪 9.3 Add unit tests for new shape defaults**
  - Files modified:
    - `tests/unit/shapeDefaults.test.ts`
  - Content:
    ```typescript
    describe('createDefaultCircle', () => {
      it('should create circle with correct radius', () => {
        const circle = createDefaultCircle(0, 0)
        expect(circle.radius).toBe(50)
      })

      it('should create circle with red color', () => {
        const circle = createDefaultCircle(0, 0)
        expect(circle.color).toBe('#EF4444')
      })
    })

    describe('createDefaultLine', () => {
      it('should create horizontal line', () => {
        const line = createDefaultLine(0, 0)
        expect(line.x2 - line.x1).toBe(150)
        expect(line.y2).toBe(line.y1)
      })
    })

    describe('createDefaultText', () => {
      it('should create text with default content', () => {
        const text = createDefaultText(0, 0)
        expect(text.content).toBe('Double-click to edit')
      })
    })
    ```

- [ ] **9.4 Update Toolbar with new shape tools**
  - Files modified:
    - `src/components/canvas/Toolbar.tsx`
  - Content:
    - Add circle button
    - Add line button
    - Add text button
    - Visual indication of selected tool

- [ ] **9.5 Implement circle rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Render `<Circle>` component from react-konva
    - Handle fill color prop

- [ ] **9.6 Implement line rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Render `<Line>` component from react-konva
    - Handle stroke color and width props

- [ ] **9.7 Implement text rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Render `<Text>` component from react-konva
    - Handle fontSize and fill (color) props

- [ ] **9.8 Update creation logic for all shapes**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Check currently selected tool
    - Create appropriate shape type on click

- [ ] **9.9 Update Firestore sync for all shapes**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - Handle all shape types in CRUD operations
    - Validate shape data

- [ ] **9.10 Update selection and drag for all shapes**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Hit testing for circles (distance from center)
    - Hit testing for lines (distance from line)
    - Hit testing for text (bounding box)
    - Drag all shape types

- [ ] **🧪 9.11 Add unit tests for hit testing all shapes**
  - Files modified:
    - `tests/unit/hitTesting.test.ts`
  - Content:
    ```typescript
    describe('isPointInCircle', () => {
      it('should return true when point is inside circle', () => {
        const circle = { x: 100, y: 100, radius: 50 }
        expect(isPointInCircle(110, 110, circle)).toBe(true)
      })

      it('should return false when point is outside circle', () => {
        const circle = { x: 100, y: 100, radius: 50 }
        expect(isPointInCircle(200, 200, circle)).toBe(false)
      })
    })

    describe('isPointNearLine', () => {
      it('should return true when point is near line', () => {
        const line = { x1: 0, y1: 0, x2: 100, y2: 0 }
        expect(isPointNearLine(50, 5, line, 10)).toBe(true)
      })
    })
    ```

- [ ] **9.12 Test all shape types**
  - Action:
    - Create rectangle, circle, line, text
    - Verify rendering
    - Verify sync between users
    - Verify drag works for all types

**Files Created/Modified:**
- Modified: `src/types/shapes.ts`, `src/utils/shapeDefaults.ts`, `src/components/canvas/Toolbar.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/components/canvas/Canvas.tsx`, `src/services/firestore.ts`, `tests/unit/shapeDefaults.test.ts`, `tests/unit/hitTesting.test.ts`

**Acceptance Criteria:**
- [ ] Can create rectangles, circles, lines, text
- [ ] All shapes render correctly
- [ ] All shapes sync between users
- [ ] All shapes can be selected and dragged
- [ ] Visual defaults match spec (100x100 rect, 100px circle, etc.)
- [ ] ✅ All tests pass

---

### PR #10: Resize & Rotate Objects

**Goal:** Add resize handles and rotation for all shapes

**Branch:** `feature/resize-rotate`

**Dependencies:** PR #1-9

#### Subtasks:
- [ ] **10.1 Add rotation property to shapes**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - Add `rotation` field (degrees) to all shape types

- [ ] **10.2 Create resize handle component**
  - Files created:
    - `src/components/canvas/ResizeHandles.tsx`
  - Content:
    - Render 8 resize handles around selected shape
    - Corner handles (NW, NE, SE, SW)
    - Edge handles (N, E, S, W)

- [ ] **10.3 Implement resize interaction**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Detect mouse down on resize handle
    - Track which handle is being dragged
    - Update shape size based on handle movement
    - Maintain aspect ratio (for shift-drag, optional)

- [ ] **🧪 10.4 Create unit tests for resize calculations**
  - Files created:
    - `tests/unit/resizeCalculations.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { calculateNewSize } from '@/utils/resizeCalculations'

    describe('Resize Calculations', () => {
      it('should calculate new size for SE handle', () => {
        const shape = { x: 0, y: 0, width: 100, height: 100 }
        const result = calculateNewSize(shape, 'SE', { x: 150, y: 150 })
        expect(result.width).toBe(150)
        expect(result.height).toBe(150)
      })

      it('should maintain aspect ratio when requested', () => {
        const shape = { x: 0, y: 0, width: 100, height: 100 }
        const result = calculateNewSize(shape, 'SE', { x: 150, y: 200 }, true)
        expect(result.width).toBe(result.height)
      })

      it('should handle NW handle (moves origin)', () => {
        const shape = { x: 100, y: 100, width: 100, height: 100 }
        const result = calculateNewSize(shape, 'NW', { x: 50, y: 50 })
        expect(result.x).toBe(50)
        expect(result.y).toBe(50)
        expect(result.width).toBe(150)
      })
    })
    ```

- [ ] **10.5 Add rotation handle**
  - Files modified:
    - `src/components/canvas/ResizeHandles.tsx`
  - Content:
    - Render rotation handle above selected shape
    - Circular arrow icon

- [ ] **10.6 Implement rotation interaction**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Detect mouse down on rotation handle
    - Calculate angle from shape center to mouse
    - Update shape rotation
    - Show rotation angle indicator (optional)

- [ ] **🧪 10.7 Create unit tests for rotation math**
  - Files created:
    - `tests/unit/rotationCalculations.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { calculateRotationAngle } from '@/utils/rotationCalculations'

    describe('Rotation Calculations', () => {
      it('should calculate angle from shape center to point', () => {
        const shapeCenter = { x: 100, y: 100 }
        const point = { x: 200, y: 100 }
        const angle = calculateRotationAngle(shapeCenter, point)
        expect(angle).toBe(0) // Pointing right = 0 degrees
      })

      it('should calculate angle for point below center', () => {
        const shapeCenter = { x: 100, y: 100 }
        const point = { x: 100, y: 200 }
        const angle = calculateRotationAngle(shapeCenter, point)
        expect(angle).toBe(90) // Pointing down = 90 degrees
      })

      it('should normalize angle to 0-360', () => {
        const shapeCenter = { x: 100, y: 100 }
        const point = { x: 0, y: 100 }
        const angle = calculateRotationAngle(shapeCenter, point)
        expect(angle).toBe(180)
      })
    })
    ```

- [ ] **10.8 Update shape rendering with rotation**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Apply rotation transform to all shapes
    - Rotate around shape center

- [ ] **10.9 Sync resize and rotate to Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `updateShapeSize(canvasId, shapeId, width, height)`
    - `updateShapeRotation(canvasId, shapeId, rotation)`
    - Throttle updates during interaction

- [ ] **10.10 Handle resize for different shape types**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Rectangle: resize width/height
    - Circle: resize radius (one handle only)
    - Line: move endpoints
    - Text: resize font size (optional, or just bounding box)

- [ ] **10.11 Add visual feedback during resize/rotate**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Show dimensions while resizing (e.g., "150 × 200")
    - Show angle while rotating (e.g., "45°")
    - Ghost outline (optional)

- [ ] **10.12 Test resize and rotate**
  - Action:
    - Select shapes
    - Resize using handles
    - Rotate using rotation handle
    - Verify sync between users
    - Test all shape types

**Files Created/Modified:**
- Created: `src/components/canvas/ResizeHandles.tsx`, `tests/unit/resizeCalculations.test.ts`, `tests/unit/rotationCalculations.test.ts`
- Modified: `src/types/shapes.ts`, `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Resize handles appear on selected shapes
- [ ] Can resize shapes by dragging handles
- [ ] Rotation handle appears on selected shapes
- [ ] Can rotate shapes
- [ ] Resize and rotate sync between users
- [ ] Works for all shape types
- [ ] 60 FPS maintained during interaction
- [ ] ✅ All tests pass

---

### PR #11: Multi-Select & Layer Management

**Goal:** Select multiple objects, basic layer ordering

**Branch:** `feature/multi-select`

**Dependencies:** PR #1-10

#### Subtasks:
- [ ] **11.1 Implement shift-click multi-select**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Hold shift + click to add to selection
    - Track selected shapes in array (not single shape)
    - Visual feedback for all selected shapes

- [ ] **11.2 Implement drag-to-select box**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Click and drag on empty canvas to draw selection box
    - Detect shapes within selection box
    - Add to selection

- [ ] **🧪 11.3 Create unit tests for selection box calculations**
  - Files created:
    - `tests/unit/selectionBox.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { getShapesInBox } from '@/utils/selectionBox'

    describe('Selection Box', () => {
      it('should find shapes within box', () => {
        const box = { x: 0, y: 0, width: 200, height: 200 }
        const shapes = [
          { id: '1', x: 50, y: 50, width: 50, height: 50 },
          { id: '2', x: 300, y: 300, width: 50, height: 50 }
        ]
        const result = getShapesInBox(shapes, box)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('1')
      })

      it('should handle partially overlapping shapes', () => {
        const box = { x: 0, y: 0, width: 100, height: 100 }
        const shape = { id: '1', x: 50, y: 50, width: 100, height: 100 }
        const result = getShapesInBox([shape], box)
        expect(result).toHaveLength(1)
      })
    })
    ```

- [ ] **11.4 Update selection rendering for multiple shapes**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Highlight all selected shapes
    - Show bounding box around all selected shapes (optional)

- [ ] **11.5 Implement multi-drag**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Drag all selected shapes together
    - Maintain relative positions

- [ ] **11.6 Add delete functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Delete key deletes all selected shapes
    - Confirm deletion (optional)
    - Sync deletion to Firestore

- [ ] **11.7 Implement delete in Firestore**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - `deleteShape(canvasId, shapeId)`
    - Batch delete for multiple shapes

- [ ] **11.8 Add duplicate functionality**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Cmd+D / Ctrl+D duplicates selected shapes
    - Offset duplicates slightly (e.g., +10px x/y)
    - Sync to Firestore

- [ ] **11.9 Add zIndex property to shapes**
  - Files modified:
    - `src/types/shapes.ts`
  - Content:
    - Add `zIndex` field to all shapes
    - Higher zIndex = rendered on top

- [ ] **11.10 Implement layer ordering**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
  - Content:
    - Bring to front: Set zIndex to max + 1
    - Send to back: Set zIndex to min - 1
    - Add keyboard shortcuts (Cmd+] / Cmd+[)

- [ ] **11.11 Sort shapes by zIndex when rendering**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Sort shapes array by zIndex before rendering
    - Update zIndex in Firestore

- [ ] **11.12 Add layer controls to UI (optional)**
  - Files created (optional):
    - `src/components/canvas/LayerPanel.tsx`
  - Content:
    - Show list of all shapes
    - Reorder by dragging
    - Select by clicking

- [ ] **11.13 Test multi-select and layers**
  - Action:
    - Shift-click multiple shapes
    - Drag-select multiple shapes
    - Drag multiple shapes together
    - Delete multiple shapes
    - Duplicate shapes
    - Change layer order
    - Verify all syncs between users

**Files Created/Modified:**
- Created: `src/components/canvas/LayerPanel.tsx` (optional), `tests/unit/selectionBox.test.ts`
- Modified: `src/types/shapes.ts`, `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/services/firestore.ts`

**Acceptance Criteria:**
- [ ] Can select multiple shapes (shift-click)
- [ ] Can drag-select multiple shapes
- [ ] Can drag multiple shapes together
- [ ] Delete key deletes selected shapes
- [ ] Cmd+D duplicates shapes
- [ ] Can bring to front / send to back
- [ ] All operations sync between users
- [ ] ✅ All tests pass

---

### PR #12: Performance Optimization

**Goal:** Ensure 60 FPS with 500+ objects and 5+ users

**Branch:** `feature/performance`

**Dependencies:** PR #1-11

#### Subtasks:
- [ ] **12.1 Optimize shape component rendering with React.memo**
  - Files modified:
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Wrap shape components with `React.memo` to prevent unnecessary re-renders
    - Use `useCallback` for event handlers
    - Only re-render when shape data actually changes

- [ ] **12.2 Optimize Firestore listeners**
  - Files modified:
    - `src/hooks/useFirestore.ts`
  - Content:
    - Use more specific queries (only visible shapes)
    - Detach listeners when component unmounts
    - Avoid unnecessary re-renders

- [ ] **12.3 Implement viewport culling (render only visible objects)**
  - Files modified:
    - `src/components/canvas/Canvas.tsx`
    - `src/components/canvas/ShapeRenderer.tsx`
  - Content:
    - Calculate which shapes are in viewport
    - Only render visible shapes
    - Update on pan/zoom

- [ ] **🧪 12.4 Create unit tests for viewport culling**
  - Files created:
    - `tests/unit/viewportCulling.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { getVisibleShapes } from '@/utils/viewportCulling'

    describe('Viewport Culling', () => {
      it('should return only visible shapes', () => {
        const viewport = { x: 0, y: 0, width: 1000, height: 1000 }
        const shapes = [
          { id: '1', x: 500, y: 500, width: 100, height: 100 }, // visible
          { id: '2', x: 2000, y: 2000, width: 100, height: 100 } // not visible
        ]
        const result = getVisibleShapes(shapes, viewport)
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('1')
      })

      it('should include partially visible shapes', () => {
        const viewport = { x: 0, y: 0, width: 100, height: 100 }
        const shape = { id: '1', x: 50, y: 50, width: 100, height: 100 }
        const result = getVisibleShapes([shape], viewport)
        expect(result).toHaveLength(1)
      })
    })
    ```

- [ ] **12.5 Optimize cursor updates**
  - Files modified:
    - `src/hooks/useCursors.ts`
  - Content:
    - Verify throttling (20 updates/sec)
    - Use RTDB (should already be done in PR #4)
    - Batch cursor updates if possible

- [ ] **12.6 Optimize shape update batching**
  - Files modified:
    - `src/services/firestore.ts`
  - Content:
    - Use Firestore batch writes for multiple updates
    - Throttle non-critical updates (position during drag)
    - Only send final position on mouse up

- [ ] **12.7 Add performance monitoring**
  - Files created:
    - `src/utils/performance.ts`
  - Content:
    - Track FPS
    - Log render times
    - Warn if FPS drops below 50

- [ ] **🧪 12.8 Create performance benchmarks**
  - Files created:
    - `tests/performance/rendering.bench.ts`
  - Content:
    ```typescript
    import { describe, bench } from 'vitest'
    import { renderShapes } from '@/components/canvas/ShapeRenderer'

    describe('Rendering Performance', () => {
      bench('render 100 shapes', () => {
        const shapes = Array.from({ length: 100 }, (_, i) => ({
          id: `${i}`,
          type: 'rectangle',
          x: i * 10,
          y: i * 10,
          width: 100,
          height: 100
        }))
        renderShapes(shapes)
      })

      bench('render 500 shapes', () => {
        const shapes = Array.from({ length: 500 }, (_, i) => ({
          id: `${i}`,
          type: 'rectangle',
          x: i * 10,
          y: i * 10,
          width: 100,
          height: 100
        }))
        renderShapes(shapes)
      })
    })
    ```

- [ ] **12.9 Profile with Chrome DevTools**
  - Action:
    - Open Chrome DevTools → Performance tab
    - Record while interacting (pan, zoom, drag)
    - Identify bottlenecks
    - Optimize hot paths

- [ ] **12.10 Test with 500+ objects**
  - Action:
    - Create test function to generate 500 shapes
    - Verify 60 FPS maintained
    - Test pan, zoom, selection, drag

- [ ] **12.11 Test with 5+ concurrent users**
  - Action:
    - Open 5+ browser windows
    - All users interact simultaneously
    - Verify no performance degradation
    - Check network tab for excessive traffic

- [ ] **12.12 Document performance optimizations**
  - Files modified:
    - `README.md`
  - Content:
    - List optimizations implemented
    - Performance benchmarks
    - Known limitations

**Files Created/Modified:**
- Created: `src/utils/performance.ts`, `tests/unit/viewportCulling.test.ts`, `tests/performance/rendering.bench.ts`
- Modified: `src/components/canvas/Canvas.tsx`, `src/components/canvas/ShapeRenderer.tsx`, `src/hooks/useFirestore.ts`, `src/hooks/useCursors.ts`, `src/services/firestore.ts`, `README.md`

**Acceptance Criteria:**
- [ ] 60 FPS with 500+ objects
- [ ] 60 FPS with 5+ concurrent users
- [ ] Cursor sync <50ms
- [ ] Object sync <100ms
- [ ] No memory leaks (test over 10+ minutes)
- [ ] Network traffic is reasonable
- [ ] ✅ All tests pass + benchmarks show improvement

---

## AI Canvas Agent (Days 5-7) - PRs 13-17

### PR #13: AI Integration - Basic Setup

**Goal:** Set up Claude API and basic function calling

**Branch:** `feature/ai-setup`

**Dependencies:** PR #1-12

#### Subtasks:
- [ ] **13.1 Install Anthropic SDK**
  - Run: `npm install @anthropic-ai/sdk`
  - Files modified: `package.json`

- [ ] **13.2 Add Claude API key to environment**
  - Files modified:
    - `.env.local` (add VITE_ANTHROPIC_API_KEY)
    - `.env.example` (add placeholder)
  - Action: Get API key from Anthropic Console

- [ ] **13.3 Create Claude service**
  - Files created:
    - `src/services/claude.ts`
  - Content:
    - Initialize Anthropic client
    - `sendMessage(prompt, tools)` - Send message with function calling
    - Handle streaming responses (optional)

- [ ] **13.4 Define AI types**
  - Files created:
    - `src/types/ai.ts`
  - Content:
    - `AICommand` type
    - `AIFunctionCall` type
    - Tool schemas

- [ ] **13.5 Create function calling schemas**
  - Files modified:
    - `src/services/claude.ts`
  - Content:
    - Define tools: createShape, moveShape, resizeShape, rotateShape, createText, getCanvasState
    - JSON schema for each function
    - Match Claude's function calling format

- [ ] **🧪 13.6 Create unit tests for tool schema validation**
  - Files created:
    - `tests/unit/aiToolSchemas.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { validateToolSchema, AI_TOOLS } from '@/services/claude'

    describe('AI Tool Schemas', () => {
      it('should have all required tools defined', () => {
        expect(AI_TOOLS).toHaveProperty('createShape')
        expect(AI_TOOLS).toHaveProperty('moveShape')
        expect(AI_TOOLS).toHaveProperty('resizeShape')
        expect(AI_TOOLS).toHaveProperty('rotateShape')
        expect(AI_TOOLS).toHaveProperty('createText')
        expect(AI_TOOLS).toHaveProperty('getCanvasState')
      })

      it('should validate createShape schema', () => {
        const validCall = {
          type: 'rectangle',
          x: 100,
          y: 200,
          width: 150,
          height: 100,
          color: 'blue'
        }
        expect(() => validateToolSchema('createShape', validCall)).not.toThrow()
      })

      it('should reject invalid parameters', () => {
        const invalidCall = {
          type: 'invalid-type',
          x: 'not-a-number'
        }
        expect(() => validateToolSchema('createShape', invalidCall)).toThrow()
      })
    })
    ```

- [ ] **13.7 Create AIPanel component**
  - Files created:
    - `src/components/ai/AIPanel.tsx`
  - Content:
    - Toggleable panel (right side)
    - Shows AI chat interface
    - Open/close button

- [ ] **13.8 Create AIInput component**
  - Files created:
    - `src/components/ai/AIInput.tsx`
  - Content:
    - Text input for AI commands
    - Send button
    - Show recent commands (history)

- [ ] **13.9 Create AIStatusIndicator component**
  - Files created:
    - `src/components/ai/AIStatusIndicator.tsx`
  - Content:
    - Shows "AI is thinking..."
    - Shows errors
    - Shows success messages

- [ ] **13.10 Create useAI hook**
  - Files created:
    - `src/hooks/useAI.ts`
  - Content:
    - `sendCommand(text)` - Send command to Claude
    - Parse function calls from response
    - Execute functions on canvas
    - Handle errors

- [ ] **13.11 Integrate AI panel into app**
  - Files modified:
    - `src/App.tsx`
  - Content:
    - Render AIPanel
    - Connect useAI hook

- [ ] **🧪 13.12 Create integration test for Claude API**
  - Files created:
    - `tests/integration/claudeAPI.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { sendMessage } from '@/services/claude'

    describe('Claude API Integration', () => {
      it('should send message and receive response', async () => {
        const response = await sendMessage('Hello', [])
        expect(response).toBeDefined()
        expect(response.content).toBeTruthy()
      }, 10000) // 10s timeout

      it('should handle function calling', async () => {
        const tools = [{ name: 'createShape', /* schema */ }]
        const response = await sendMessage('Create a blue rectangle', tools)
        expect(response.tool_calls).toBeDefined()
      }, 10000)
    })
    ```

- [ ] **13.13 Test basic AI flow (without real commands)**
  - Action:
    - Open AI panel
    - Type "hello"
    - Verify Claude responds
    - Check function calling works (even if no functions called)

**Files Created/Modified:**
- Created: `src/services/claude.ts`, `src/types/ai.ts`, `src/components/ai/AIPanel.tsx`, `src/components/ai/AIInput.tsx`, `src/components/ai/AIStatusIndicator.tsx`, `src/hooks/useAI.ts`, `tests/unit/aiToolSchemas.test.ts`, `tests/integration/claudeAPI.test.ts`
- Modified: `.env.local`, `.env.example`, `package.json`, `src/App.tsx`

**Acceptance Criteria:**
- [ ] Claude API integration works
- [ ] AI panel displays and opens/closes
- [ ] Can send messages to Claude
- [ ] Function calling schemas defined
- [ ] No errors in console
- [ ] ✅ All tests pass

---

### PR #14: AI Creation Commands

**Goal:** Implement AI commands to create shapes

**Branch:** `feature/ai-creation`

**Dependencies:** PR #1-13

**Required Commands (minimum 2):**
- "Create a red circle at position 100, 200"
- "Add a text layer that says 'Hello World'"
- "Make a 200x300 rectangle"

#### Subtasks:
- [ ] **14.1 Implement createShape function**
  - Files created:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeCreateShape(type, x, y, width, height, color)` - Create shape and sync to Firestore
    - Handle all shape types

- [ ] **🧪 14.2 Create unit tests for AI helper functions**
  - Files created:
    - `tests/unit/aiHelpers.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect, vi } from 'vitest'
    import { executeCreateShape, executeCreateText } from '@/utils/aiHelpers'

    describe('AI Helper Functions', () => {
      describe('executeCreateShape', () => {
        it('should create shape with correct properties', async () => {
          const mockFirestore = vi.fn()
          const result = await executeCreateShape(
            'rectangle',
            100,
            200,
            150,
            100,
            '#FF0000'
          )

          expect(result).toMatchObject({
            type: 'rectangle',
            x: 100,
            y: 200,
            width: 150,
            height: 100,
            color: '#FF0000'
          })
        })

        it('should handle default values', async () => {
          const result = await executeCreateShape('rectangle', 0, 0)
          expect(result.width).toBe(100) // default
          expect(result.height).toBe(100) // default
        })
      })

      describe('executeCreateText', () => {
        it('should create text shape with content', async () => {
          const result = await executeCreateText('Hello World', 100, 200)
          expect(result.content).toBe('Hello World')
          expect(result.type).toBe('text')
        })
      })
    })
    ```

- [ ] **14.3 Implement createText function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeCreateText(text, x, y, fontSize, color)` - Create text shape

- [ ] **14.4 Connect function calls to canvas**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - When Claude calls `createShape`, execute `executeCreateShape`
    - When Claude calls `createText`, execute `executeCreateText`
    - Pass canvasId and canvas context

- [ ] **14.5 Implement getCanvasState function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `getCanvasState()` - Return current shapes as JSON
    - Send to Claude for context

- [ ] **🧪 14.6 Create unit test for getCanvasState**
  - Files modified:
    - `tests/unit/aiHelpers.test.ts`
  - Content:
    ```typescript
    describe('getCanvasState', () => {
      it('should return shapes as JSON', () => {
        const shapes = [
          { id: '1', type: 'rectangle', x: 0, y: 0 },
          { id: '2', type: 'circle', x: 100, y: 100 }
        ]
        const result = getCanvasState(shapes)
        expect(result).toContain('rectangle')
        expect(result).toContain('circle')
      })

      it('should handle empty canvas', () => {
        const result = getCanvasState([])
        expect(result).toBe('Canvas is empty')
      })
    })
    ```

- [ ] **14.7 Test: "Create a red circle at position 100, 200"**
  - Action:
    - Type command in AI panel
    - Verify Claude calls createShape function
    - Verify circle appears on canvas
    - Verify other users see the circle

- [ ] **14.8 Test: "Add a text layer that says 'Hello World'"**
  - Action:
    - Type command
    - Verify text appears on canvas
    - Verify sync between users

- [ ] **14.9 Test: "Make a 200x300 rectangle"**
  - Action:
    - Type command
    - Verify rectangle with correct size appears
    - Verify positioned reasonably (center or default position)

- [ ] **14.10 Handle position defaults intelligently**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - If no position specified, place at canvas center or viewport center
    - Don't overlap with existing shapes (smart placement)

- [ ] **14.11 Add AI command history**
  - Files modified:
    - `src/components/ai/AIPanel.tsx`
  - Content:
    - Show list of past commands
    - Show which shapes were created by each command
    - Click to select those shapes (optional)

- [ ] **🧪 14.12 Create integration test for AI commands**
  - Files created:
    - `tests/integration/aiCommands.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { useAI } from '@/hooks/useAI'

    describe('AI Commands Integration', () => {
      it('should execute creation command', async () => {
        const { result } = renderHook(() => useAI('test-canvas-id'))

        await act(async () => {
          await result.current.sendCommand('Create a red circle at 100, 200')
        })

        // Wait for AI response and execution
        await new Promise(r => setTimeout(r, 2000))

        // Verify shape was created
        expect(result.current.lastCreatedShapes).toHaveLength(1)
        expect(result.current.lastCreatedShapes[0]).toMatchObject({
          type: 'circle',
          color: expect.stringContaining('red')
        })
      }, 15000)
    })
    ```

- [ ] **14.13 Test multiple creation commands**
  - Action:
    - Test 5+ different creation commands
    - Verify all work correctly
    - Test with 2 users (both using AI)

**Files Created/Modified:**
- Created: `src/utils/aiHelpers.ts`, `tests/unit/aiHelpers.test.ts`, `tests/integration/aiCommands.test.ts`
- Modified: `src/hooks/useAI.ts`, `src/components/ai/AIPanel.tsx`

**Acceptance Criteria:**
- [ ] Can create shapes via AI commands
- [ ] At least 3 creation commands work
- [ ] AI-created shapes sync to all users
- [ ] Shapes appear at reasonable positions
- [ ] Response time <2 seconds
- [ ] ✅ All tests pass

---

### PR #15: AI Manipulation Commands

**Goal:** Implement AI commands to move, resize, rotate shapes

**Branch:** `feature/ai-manipulation`

**Dependencies:** PR #1-14

**Required Commands (minimum 2):**
- "Move the blue rectangle to the center"
- "Resize the circle to be twice as big"
- "Rotate the text 45 degrees"

#### Subtasks:
- [ ] **15.1 Implement moveShape function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeMoveShape(shapeId, x, y)` - Move shape and update Firestore
    - Handle shape identification (by color, type, etc.)

- [ ] **15.2 Implement shape identification logic**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `findShape(descriptor)` - Find shape by description
    - "the blue rectangle" → find rectangle with blue color
    - "the circle" → find circle (or newest circle if multiple)

- [ ] **🧪 15.3 Create unit tests for shape identification**
  - Files created:
    - `tests/unit/shapeIdentification.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { findShape } from '@/utils/aiHelpers'

    describe('Shape Identification', () => {
      const shapes = [
        { id: '1', type: 'rectangle', color: '#0000FF' },
        { id: '2', type: 'circle', color: '#FF0000' },
        { id: '3', type: 'rectangle', color: '#FF0000' }
      ]

      it('should find shape by type and color', () => {
        const result = findShape(shapes, { type: 'rectangle', color: 'blue' })
        expect(result?.id).toBe('1')
      })

      it('should find shape by type only', () => {
        const result = findShape(shapes, { type: 'circle' })
        expect(result?.id).toBe('2')
      })

      it('should return most recent when multiple match', () => {
        const result = findShape(shapes, { color: 'red' })
        expect(result?.id).toBe('3') // Most recent
      })

      it('should handle color aliases', () => {
        const result = findShape(shapes, { color: 'blue' })
        expect(result?.color).toBe('#0000FF')
      })
    })
    ```

- [ ] **15.4 Implement smart positioning**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - "to the center" → calculate canvas center
    - "to the left" → move left 200px
    - "next to X" → position relative to another shape

- [ ] **🧪 15.5 Create unit tests for smart positioning**
  - Files created:
    - `tests/unit/smartPositioning.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { calculateSmartPosition } from '@/utils/aiHelpers'

    describe('Smart Positioning', () => {
      const canvasConfig = { width: 5000, height: 5000 }

      it('should calculate center position', () => {
        const result = calculateSmartPosition('center', canvasConfig)
        expect(result).toEqual({ x: 2500, y: 2500 })
      })

      it('should calculate relative position', () => {
        const anchor = { x: 100, y: 100 }
        const result = calculateSmartPosition('to the left', canvasConfig, anchor)
        expect(result.x).toBeLessThan(anchor.x)
      })

      it('should handle "next to" positioning', () => {
        const referenceShape = { x: 100, y: 100, width: 100 }
        const result = calculateSmartPosition('next to', canvasConfig, referenceShape)
        expect(result.x).toBeGreaterThan(referenceShape.x + referenceShape.width)
      })
    })
    ```

- [ ] **15.6 Implement resizeShape function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeResizeShape(shapeId, width, height)` - Resize shape
    - Handle relative sizes ("twice as big" = multiply by 2)

- [ ] **15.7 Implement rotateShape function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeRotateShape(shapeId, degrees)` - Rotate shape
    - Handle absolute and relative rotation

- [ ] **15.8 Connect manipulation functions to AI**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - When Claude calls moveShape, execute it
    - When Claude calls resizeShape, execute it
    - When Claude calls rotateShape, execute it

- [ ] **15.9 Test: "Move the blue rectangle to the center"**
  - Action:
    - Create blue rectangle first
    - Send move command
    - Verify rectangle moves to center
    - Verify sync between users

- [ ] **15.10 Test: "Resize the circle to be twice as big"**
  - Action:
    - Create circle first
    - Send resize command
    - Verify circle doubles in size

- [ ] **15.11 Test: "Rotate the text 45 degrees"**
  - Action:
    - Create text first
    - Send rotate command
    - Verify text rotates 45 degrees

- [ ] **15.12 Handle ambiguity**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - If multiple shapes match, pick most recent
    - Or ask user to clarify (optional)
    - Log warning in AI panel

- [ ] **15.13 Test multiple manipulation commands**
  - Action:
    - Test 5+ different manipulation commands
    - Test chained commands ("create a circle, then move it left")

**Files Created/Modified:**
- Created: `tests/unit/shapeIdentification.test.ts`, `tests/unit/smartPositioning.test.ts`
- Modified: `src/utils/aiHelpers.ts`, `src/hooks/useAI.ts`

**Acceptance Criteria:**
- [ ] Can move shapes via AI commands
- [ ] Can resize shapes via AI commands
- [ ] Can rotate shapes via AI commands
- [ ] At least 3 manipulation commands work
- [ ] Shape identification works correctly
- [ ] All operations sync between users
- [ ] ✅ All tests pass

---

### PR #16: AI Layout Commands

**Goal:** Implement AI commands for arranging multiple shapes

**Branch:** `feature/ai-layout`

**Dependencies:** PR #1-15

**Required Commands (minimum 2):**
- "Arrange these shapes in a horizontal row"
- "Create a grid of 3x3 squares"
- "Space these elements evenly"

#### Subtasks:
- [ ] **16.1 Implement arrangeHorizontal function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeArrangeHorizontal(shapeIds, spacing)` - Arrange shapes in row
    - Calculate positions with even spacing
    - Update all shapes in Firestore

- [ ] **🧪 16.2 Create unit tests for layout calculations**
  - Files created:
    - `tests/unit/layoutCalculations.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import {
      calculateHorizontalLayout,
      calculateVerticalLayout,
      calculateGridLayout,
      calculateEvenDistribution
    } from '@/utils/aiHelpers'

    describe('Layout Calculations', () => {
      describe('calculateHorizontalLayout', () => {
        it('should arrange shapes in a row with spacing', () => {
          const shapes = [
            { id: '1', width: 100, height: 100 },
            { id: '2', width: 100, height: 100 },
            { id: '3', width: 100, height: 100 }
          ]
          const result = calculateHorizontalLayout(shapes, 50, 0) // 50px spacing

          expect(result[0].x).toBe(0)
          expect(result[1].x).toBe(150) // 100 + 50
          expect(result[2].x).toBe(300) // 100 + 50 + 100 + 50
        })
      })

      describe('calculateGridLayout', () => {
        it('should create 3x3 grid', () => {
          const result = calculateGridLayout(3, 3, 'rectangle', 100, 20)

          expect(result).toHaveLength(9)
          expect(result[0].x).toBe(0)
          expect(result[0].y).toBe(0)
          expect(result[1].x).toBe(120) // 100 + 20 spacing
          expect(result[3].y).toBe(120) // Next row
        })
      })

      describe('calculateEvenDistribution', () => {
        it('should distribute shapes evenly', () => {
          const shapes = [
            { id: '1', x: 0, width: 100 },
            { id: '2', x: 500, width: 100 }
          ]
          const result = calculateEvenDistribution(shapes, 'horizontal', 1000)

          // Should be evenly spaced across 1000px
          const spacing1 = result[1].x - (result[0].x + result[0].width)
          expect(spacing1).toBeGreaterThan(0)
        })
      })
    })
    ```

- [ ] **16.3 Implement arrangeVertical function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeArrangeVertical(shapeIds, spacing)` - Arrange shapes in column

- [ ] **16.4 Implement createGrid function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeCreateGrid(rows, cols, shapeType, spacing)` - Create grid of shapes
    - Calculate positions for each shape
    - Batch create in Firestore

- [ ] **16.5 Implement distributeEvenly function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - `executeDistributeEvenly(shapeIds, axis)` - Space shapes evenly
    - Calculate equal spacing between shapes
    - Update positions

- [ ] **16.6 Connect layout functions to AI**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Add layout functions to tool schema
    - Execute when Claude calls them

- [ ] **16.7 Test: "Arrange these shapes in a horizontal row"**
  - Action:
    - Create 3+ shapes
    - Send command
    - Verify shapes arrange horizontally with even spacing

- [ ] **16.8 Test: "Create a grid of 3x3 squares"**
  - Action:
    - Send command
    - Verify 9 squares appear in 3x3 grid
    - Verify spacing is even

- [ ] **16.9 Test: "Space these elements evenly"**
  - Action:
    - Create 3+ shapes in random positions
    - Send command
    - Verify shapes distribute evenly

- [ ] **16.10 Implement smart selection for layout commands**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - "these shapes" → use currently selected shapes
    - If none selected, use all shapes
    - Or use shapes matching a description

- [ ] **🧪 16.11 Create integration test for layout commands**
  - Files created:
    - `tests/integration/layoutCommands.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { useAI } from '@/hooks/useAI'

    describe('Layout Commands Integration', () => {
      it('should create a grid via AI', async () => {
        const { result } = renderHook(() => useAI('test-canvas-id'))

        await act(async () => {
          await result.current.sendCommand('Create a grid of 3x3 squares')
        })

        await new Promise(r => setTimeout(r, 3000))

        expect(result.current.lastCreatedShapes).toHaveLength(9)
        // Verify grid layout
        const firstRow = result.current.lastCreatedShapes.slice(0, 3)
        expect(firstRow[0].y).toBe(firstRow[1].y) // Same row
      }, 15000)
    })
    ```

- [ ] **16.12 Test multiple layout commands**
  - Action:
    - Test 5+ layout variations
    - Test with different numbers of shapes
    - Verify all sync between users

**Files Created/Modified:**
- Created: `tests/unit/layoutCalculations.test.ts`, `tests/integration/layoutCommands.test.ts`
- Modified: `src/utils/aiHelpers.ts`, `src/hooks/useAI.ts`

**Acceptance Criteria:**
- [ ] Can arrange shapes horizontally/vertically
- [ ] Can create grids via AI
- [ ] Can distribute shapes evenly
- [ ] At least 3 layout commands work
- [ ] All operations sync between users
- [ ] Performance remains good (60 FPS)
- [ ] ✅ All tests pass

---

### PR #17: Complex AI Commands & Polish

**Goal:** Implement multi-step complex commands and polish AI UX

**Branch:** `feature/ai-complex`

**Dependencies:** PR #1-16

**Complex Commands (stretch goal, minimum 1):**
- "Create a login form with username and password fields"
- "Build a navigation bar with 4 menu items"
- "Make a card layout with title, image, and description"

#### Subtasks:
- [ ] **17.1 Implement multi-step command execution**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Allow Claude to call multiple functions in sequence
    - Execute each function in order
    - Show progress to user

- [ ] **17.2 Implement createLoginForm function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - Create 2 text labels ("Username", "Password")
    - Create 2 rectangles (input fields)
    - Create 1 button (submit)
    - Arrange in vertical layout
    - Return group of shapes

- [ ] **🧪 17.3 Create unit tests for complex commands**
  - Files created:
    - `tests/unit/complexCommands.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { createLoginForm, createNavBar, createCard } from '@/utils/aiHelpers'

    describe('Complex Commands', () => {
      describe('createLoginForm', () => {
        it('should create form with all required elements', () => {
          const result = createLoginForm(100, 100)

          // Should have: 2 labels + 2 inputs + 1 button = 5 shapes
          expect(result).toHaveLength(5)

          // Check for username label
          expect(result).toContainEqual(
            expect.objectContaining({ type: 'text', content: 'Username' })
          )

          // Check for password label
          expect(result).toContainEqual(
            expect.objectContaining({ type: 'text', content: 'Password' })
          )
        })

        it('should arrange elements vertically', () => {
          const result = createLoginForm(0, 0)
          const ySorted = [...result].sort((a, b) => a.y - b.y)

          // Elements should be in order top to bottom
          expect(result[0].y).toBeLessThan(result[result.length - 1].y)
        })
      })

      describe('createNavBar', () => {
        it('should create nav bar with 4 items', () => {
          const result = createNavBar(0, 0, 4)

          // Should have: 1 bar + 4 items = 5 shapes
          expect(result).toHaveLength(5)
        })

        it('should arrange items horizontally', () => {
          const result = createNavBar(0, 0, 4)
          const items = result.filter(s => s.type === 'text')

          // Check horizontal arrangement
          for (let i = 1; i < items.length; i++) {
            expect(items[i].x).toBeGreaterThan(items[i-1].x)
          }
        })
      })
    })
    ```

- [ ] **17.4 Implement createNavBar function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - Create horizontal bar (rectangle)
    - Create N text items (menu items)
    - Arrange in horizontal row
    - Proper spacing and alignment

- [ ] **17.5 Implement createCard function**
  - Files modified:
    - `src/utils/aiHelpers.ts`
  - Content:
    - Create container rectangle
    - Create title text
    - Create image placeholder rectangle
    - Create description text
    - Arrange in vertical layout

- [ ] **17.6 Test: "Create a login form with username and password fields"**
  - Action:
    - Send command
    - Verify form appears with all elements
    - Verify proper alignment and spacing
    - Verify sync between users

- [ ] **17.7 Test: "Build a navigation bar with 4 menu items"**
  - Action:
    - Send command
    - Verify nav bar appears with 4 items
    - Verify horizontal layout

- [ ] **17.8 Test: "Make a card layout with title, image, and description"**
  - Action:
    - Send command
    - Verify card appears with all components

- [ ] **17.9 Add AI visual feedback**
  - Files modified:
    - `src/components/ai/AIStatusIndicator.tsx`
  - Content:
    - Show progress bar during multi-step commands
    - Highlight shapes being created
    - Show "Created 5 shapes" summary

- [ ] **17.10 Improve AI error handling**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Catch and display errors clearly
    - Suggest fixes ("No blue rectangle found. Did you mean red?")
    - Retry logic for API failures

- [ ] **17.11 Add AI command suggestions**
  - Files modified:
    - `src/components/ai/AIPanel.tsx`
  - Content:
    - Show example commands
    - Autocomplete common commands
    - Click to insert

- [ ] **17.12 Add AI undo**
  - Files modified:
    - `src/hooks/useAI.ts`
  - Content:
    - Track shapes created by each command
    - "Undo last AI command" button
    - Delete shapes created by last command

- [ ] **17.13 Test AI with multiple users**
  - Action:
    - Open 2+ browser windows
    - Both users send AI commands
    - Verify no conflicts
    - Verify all commands sync

- [ ] **17.14 Polish AI UI**
  - Files modified:
    - `src/components/ai/*.tsx`
    - `src/index.css`
  - Content:
    - Clean, modern design
    - Smooth animations
    - Loading states
    - Success/error states

- [ ] **🧪 17.15 Create integration test for multi-step execution**
  - Files created:
    - `tests/integration/multiStepExecution.test.ts`
  - Content:
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { renderHook, act } from '@testing-library/react'
    import { useAI } from '@/hooks/useAI'

    describe('Multi-Step Execution', () => {
      it('should execute complex command with multiple steps', async () => {
        const { result } = renderHook(() => useAI('test-canvas-id'))

        await act(async () => {
          await result.current.sendCommand('Create a login form')
        })

        await new Promise(r => setTimeout(r, 5000))

        // Should have created multiple shapes
        expect(result.current.lastCreatedShapes.length).toBeGreaterThan(3)

        // All shapes should be on canvas
        const allShapes = result.current.getAllShapes()
        result.current.lastCreatedShapes.forEach(created => {
          expect(allShapes).toContainEqual(
            expect.objectContaining({ id: created.id })
          )
        })
      }, 20000)
    })
    ```

- [ ] **17.16 Performance test with AI**
  - Action:
    - Send command that creates 50+ shapes (e.g., "create 10x10 grid")
    - Verify 60 FPS maintained
    - Verify sync works

**Files Created/Modified:**
- Created: `tests/unit/complexCommands.test.ts`, `tests/integration/multiStepExecution.test.ts`
- Modified: `src/utils/aiHelpers.ts`, `src/hooks/useAI.ts`, `src/components/ai/AIPanel.tsx`, `src/components/ai/AIStatusIndicator.tsx`, `src/index.css`

**Acceptance Criteria:**
- [ ] At least 1 complex command works (login form, nav bar, or card)
- [ ] Multi-step commands execute correctly
- [ ] AI UX is polished (loading states, errors, suggestions)
- [ ] Can undo AI commands
- [ ] Multiple users can use AI simultaneously
- [ ] All AI-created shapes sync between users
- [ ] Total of 6+ command types work across all AI PRs
- [ ] ✅ All tests pass

---

## Final Submission (Day 7) - PR #18

### PR #18: Documentation, Demo Video & Final Polish

**Goal:** Create demo video, write AI development log, final testing

**Branch:** `feature/final-submission`

**Dependencies:** PR #1-17

#### Subtasks:
- [ ] **18.1 Update README with complete documentation**
  - Files modified:
    - `README.md`
  - Content:
    - Project description
    - Live demo link
    - Features list
    - Tech stack explanation
    - Setup instructions
    - Architecture overview
    - Screenshots
    - Test coverage badge

- [ ] **18.2 Create architecture documentation**
  - Files created:
    - `ARCHITECTURE.md`
  - Content:
    - System architecture diagram (draw.io or similar)
    - Data flow (client → Firestore → client)
    - Real-time sync explanation
    - AI integration flow
    - Performance optimizations
    - Testing strategy

- [ ] **18.3 Document Firestore structure**
  - Files created:
    - `DATABASE.md`
  - Content:
    - Firestore collections and documents
    - RTDB structure
    - Security rules
    - Indexes used

- [ ] **18.4 Write AI Development Log (1 page)**
  - Files created:
    - `AI_DEVELOPMENT_LOG.md`
  - Content (as specified in project requirements):
    1. Tools & Workflow: AI coding tools used (Claude Code, etc.)
    2. Prompting Strategies: 3-5 effective prompts that worked well
    3. Code Analysis: % of AI-generated vs hand-written code
    4. Strengths & Limitations: Where AI excelled and struggled
    5. Key Learnings: Insights about working with AI
    6. **Testing Approach:** How tests verified AI-generated code

- [ ] **18.5 Record demo video (3-5 minutes)**
  - Files created:
    - `demo-video.mp4` (or upload to YouTube/Loom)
  - Content:
    1. Intro: Project overview (30 sec)
    2. Real-time collaboration demo (1 min):
       - Show 2 users editing simultaneously
       - Cursors syncing
       - Shapes syncing
       - Presence awareness
    3. AI commands demo (2 min):
       - Show 3-5 different AI commands
       - Creation, manipulation, layout commands
       - Show complex command (login form)
    4. Architecture explanation (1 min):
       - Quick overview of tech stack
       - Firestore structure
       - Performance optimizations
    5. Outro: Key achievements and future work (30 sec)

- [ ] **18.6 Create setup guide**
  - Files created:
    - `SETUP.md`
  - Content:
    - Prerequisites (Node, npm)
    - Clone repo
    - Install dependencies
    - Set up Firebase project
    - Get Claude API key
    - Configure environment variables
    - Run tests
    - Run locally
    - Deploy to Vercel

- [ ] **18.7 Add screenshots to repo**
  - Files created:
    - `screenshots/` folder
    - `screenshots/canvas.png`
    - `screenshots/multiplayer.png`
    - `screenshots/ai-panel.png`
    - `screenshots/tests-passing.png`
  - Use in README

- [ ] **18.8 Final testing checklist**
  - Action: Test ALL features on deployed app:
    - [ ] Google Sign-In
    - [ ] Canvas pan/zoom (60 FPS)
    - [ ] Create all shape types
    - [ ] Move, resize, rotate shapes
    - [ ] Multi-select
    - [ ] Delete, duplicate
    - [ ] Layer ordering
    - [ ] Cursor sync (<50ms)
    - [ ] Object sync (<100ms)
    - [ ] Presence awareness
    - [ ] 500+ objects (60 FPS)
    - [ ] 5+ concurrent users
    - [ ] AI creation commands (3+)
    - [ ] AI manipulation commands (3+)
    - [ ] AI layout commands (2+)
    - [ ] Complex AI command (1+)
    - [ ] State persistence

- [ ] **🧪 18.9 Run complete test suite and generate coverage**
  - Run: `npm test`
  - Run: `npm run test:coverage`
  - Verify:
    - [ ] All tests pass
    - [ ] >70% code coverage overall
    - [ ] >80% coverage on critical paths (utils, services)
    - [ ] >60% coverage on components
  - Generate coverage report
  - Add coverage badge to README

- [ ] **18.10 Create submission checklist**
  - Files created:
    - `SUBMISSION_CHECKLIST.md`
  - Content:
    - [ ] GitHub repo is public
    - [ ] README has live demo link
    - [ ] Demo video uploaded (link in README)
    - [ ] AI Development Log completed
    - [ ] Architecture documentation complete
    - [ ] All features working on deployed app
    - [ ] 60 FPS performance verified
    - [ ] Multi-user testing completed
    - [ ] All tests passing (>70% coverage)

- [ ] **18.11 Clean up code**
  - Action:
    - Remove console.logs
    - Remove commented code
    - Fix any TypeScript warnings
    - Run linter: `npm run lint`
    - Format code: `npm run format`

- [ ] **18.12 Final Firestore security rules**
  - Action: In Firebase Console
  - Content:
    - Lock down Firestore rules
    - Only authenticated users can read/write
    - Users can only update their own presence
    - Add validation rules

- [ ] **18.13 Add LICENSE file**
  - Files created:
    - `LICENSE`
  - Content:
    - MIT License (or your choice)

- [ ] **18.14 Final deployment**
  - Action:
    - Merge all PRs to main
    - Verify Vercel auto-deploys
    - Test deployed app one more time
    - Share link!

**Files Created/Modified:**
- Created: `ARCHITECTURE.md`, `DATABASE.md`, `AI_DEVELOPMENT_LOG.md`, `SETUP.md`, `SUBMISSION_CHECKLIST.md`, `screenshots/*`, `LICENSE`, demo video
- Modified: `README.md`, Firestore security rules

**Acceptance Criteria:**
- [ ] Demo video is 3-5 minutes and shows all required features
- [ ] AI Development Log is complete (1 page) with testing insights
- [ ] README is comprehensive with live demo link and test coverage badge
- [ ] All documentation is clear and professional
- [ ] Code is clean and well-commented
- [ ] All features work on deployed app
- [ ] ✅ All tests passing (>70% coverage)
- [ ] Ready to submit!

---

## Summary

**Total PRs:** 18

**MVP (24 hours):** PR #1-8
**Full Canvas (Days 2-4):** PR #9-12
**AI Agent (Days 5-7):** PR #13-17
**Final Submission (Day 7):** PR #18

**Key Milestones:**
- PR #4: Cursor sync working (hardest part!)
- PR #8: MVP complete and deployed
- PR #12: Performance targets met
- PR #17: All 6+ AI commands working
- PR #18: Ready to submit

**Total Files:** ~70+ files (50 implementation + 20 tests)

**Testing Coverage:**
- ✅ **Unit Tests:** 15+ test files covering utilities, helpers, calculations
- ✅ **Integration Tests:** 8+ test files covering sync, AI commands, presence
- ✅ **Performance Tests:** Benchmarks for rendering with 500+ objects
- ✅ **Target Coverage:** >70% overall, >80% on critical paths

**Estimated Time:**
- MVP: 20-24 hours (includes testing)
- Full Canvas: 12-16 hours (includes testing)
- AI Agent: 16-20 hours (includes testing)
- Final: 4-6 hours
- **Total: 52-66 hours** (within one week with focus)

**Testing Philosophy:**
- Tests verify that AI-generated code works correctly
- Critical paths (coordinate transforms, hit testing, AI helpers) have comprehensive unit tests
- Integration tests ensure real-time sync works end-to-end
- Tests run fast (< 30 seconds for full suite)
- Tests serve as documentation for how code should behave

Good luck! Follow this task list step by step, write tests as you go, and you'll build a complete CollabCanvas that meets all requirements with confidence that it works! 🚀🧪
