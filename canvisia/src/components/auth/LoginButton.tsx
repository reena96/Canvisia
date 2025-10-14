import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { getAuthErrorMessage } from '@/services/auth'

export function LoginButton() {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      await signIn()
    } catch (err: any) {
      const message = getAuthErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </p>
      )}
    </div>
  )
}
