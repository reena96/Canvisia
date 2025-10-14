import { vi } from 'vitest'
import type { User } from 'firebase/auth'

// Mock Firebase auth functions
export const mockSignInWithPopup = vi.fn()
export const mockSignOut = vi.fn()
export const mockOnAuthStateChanged = vi.fn()

// Helper to create mock users
export const createMockUser = (overrides: Partial<User> = {}): Partial<User> => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
  ...overrides,
})

// Mock auth object
export const mockAuth = {
  currentUser: null as User | null,
  signInWithPopup: mockSignInWithPopup,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
}

// Mock Firebase App
const mockApp = { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false }

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => mockApp),
  getApp: vi.fn(() => mockApp),
  getApps: vi.fn(() => [mockApp]),
}))

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth')
  return {
    ...actual,
    getAuth: vi.fn(() => mockAuth),
    signInWithPopup: mockSignInWithPopup,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
    GoogleAuthProvider: vi.fn(() => ({})),
  }
})

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}))

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
}))
