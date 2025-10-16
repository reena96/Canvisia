import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/services/firebase'
import {
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
} from '@/services/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Force logout on app version change
    const APP_VERSION = '1.0.1'
    const storedVersion = localStorage.getItem('app_version')

    if (storedVersion !== APP_VERSION) {
      // Version changed, force logout
      localStorage.setItem('app_version', APP_VERSION)
      authSignOut().catch(console.error)
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      await authSignInWithGoogle()
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Failed to sign in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authSignOut()
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Failed to sign out:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
