import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
  type UserCredential
} from 'firebase/auth'
import { auth } from './firebase'

/**
 * Sign in with Google using Firebase Authentication
 * @returns Promise<UserCredential> with user info
 * @throws Error if sign-in fails
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider()

  try {
    const result = await signInWithPopup(auth, provider)
    return result
  } catch (error: any) {
    console.error('Sign-in error:', error)
    throw error
  }
}

/**
 * Sign out the current user
 * @throws Error if sign-out fails
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error('Sign-out error:', error)
    throw error
  }
}

/**
 * Get the currently signed-in user
 * @returns User | null
 */
export function getCurrentUser(): User | null {
  return auth.currentUser
}

/**
 * Get user-friendly error message for auth errors
 * @param error Firebase auth error
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: any): string {
  const errorCode = error?.code || ''

  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/popup-blocked':
      return 'Pop-up blocked. Please allow pop-ups for this site.'
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled.'
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again.'
    default:
      return 'An error occurred. Please try again.'
  }
}

/**
 * Check if an error is a Firebase auth error
 * @param error Any error object
 * @returns true if it's a Firebase auth error
 */
export function isAuthError(error: any): boolean {
  return error?.code?.startsWith('auth/') === true
}
