import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import mock BEFORE importing components
import { mockOnAuthStateChanged, mockSignInWithPopup, mockSignOut, createMockUser, mockAuth } from '../mocks/firebaseMock'

// Import components after mocks are set up
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider'

// Test component that uses auth
function TestComponent() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user)
    return (
      <button onClick={signIn}>Sign In</button>
    )
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
    // Suppress console.error during tests to avoid stderr output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should render loading state initially', () => {
    mockOnAuthStateChanged.mockImplementation(() => {
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
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
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
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
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
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
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
    }, { timeout: 2000 })
  })

  it('should handle sign in action', async () => {
    const mockUser = createMockUser()
    let authCallback: any = null

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback
      callback(null) // Start signed out
      return () => {}
    })

    mockSignInWithPopup.mockResolvedValue({ user: mockUser })

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    // Click sign in
    const button = screen.getByText('Sign In')
    await user.click(button)

    // Simulate Firebase auth state change
    if (authCallback) authCallback(mockUser)

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument()
    })
  })

  it('should handle sign out action', async () => {
    const mockUser = createMockUser()
    let authCallback: any = null

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback
      callback(mockUser) // Start signed in
      return () => {}
    })

    mockSignOut.mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial render with user
    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument()
    })

    // Click sign out
    const button = screen.getByText('Sign Out')
    await user.click(button)

    // Simulate Firebase auth state change
    if (authCallback) authCallback(null)

    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })
})
