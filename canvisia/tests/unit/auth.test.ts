import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockSignInWithPopup, mockSignOut, mockAuth, createMockUser } from '../mocks/firebaseMock'

// Import functions we'll implement
import { signInWithGoogle, signOut as authSignOut, getCurrentUser } from '@/services/auth'

describe('Authentication Service - MVP CRITICAL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null
    // Suppress console.error during tests to avoid stderr output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('signInWithGoogle (MVP)', () => {
    it('should sign in user successfully', async () => {
      const mockUser = createMockUser()
      mockSignInWithPopup.mockResolvedValue({
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      })

      const result = await signInWithGoogle()

      expect(mockSignInWithPopup).toHaveBeenCalledTimes(1)
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.displayName).toBe('Test User')
    })

    it('should handle sign-in popup closed error', async () => {
      const error = new Error('popup-closed-by-user')
      error.code = 'auth/popup-closed-by-user'
      mockSignInWithPopup.mockRejectedValue(error)

      await expect(signInWithGoogle()).rejects.toThrow('popup-closed-by-user')
    })

    it('should handle network error', async () => {
      const error = new Error('network-request-failed')
      error.code = 'auth/network-request-failed'
      mockSignInWithPopup.mockRejectedValue(error)

      await expect(signInWithGoogle()).rejects.toThrow('network-request-failed')
    })
  })

  describe('signOut (MVP)', () => {
    it('should sign out user successfully', async () => {
      mockSignOut.mockResolvedValue(undefined)

      await authSignOut()

      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })

    it('should handle sign-out error', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'))

      await expect(authSignOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getCurrentUser (MVP)', () => {
    it('should return current user when signed in', () => {
      const mockUser = createMockUser()
      mockAuth.currentUser = mockUser as any

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
