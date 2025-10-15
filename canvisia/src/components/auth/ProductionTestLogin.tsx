/**
 * Production test login component
 * Allows quick login with test accounts in production
 */

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/services/firebase'

interface TestUser {
  email: string
  password: string
  displayName: string
  color: string
}

const PROD_TEST_USERS: TestUser[] = [
  {
    email: 'alice.test@canvisia.app',
    password: 'TestUser123!',
    displayName: 'Alice',
    color: '#3B82F6', // Blue
  },
  {
    email: 'bob.test@canvisia.app',
    password: 'TestUser123!',
    displayName: 'Bob',
    color: '#EF4444', // Red
  },
  {
    email: 'charlie.test@canvisia.app',
    password: 'TestUser123!',
    displayName: 'Charlie',
    color: '#10B981', // Green
  },
]

export function ProductionTestLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // Only show in production (not in dev/emulator mode)
  const isProduction = !import.meta.env.DEV

  if (!isProduction) return null

  const handleLogin = async (user: TestUser) => {
    setLoading(user.email)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, user.email, user.password)
      setShowMenu(false) // Close menu on successful login
    } catch (err: any) {
      console.error('Test login error:', err)
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ position: 'relative', marginTop: '1rem' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          backgroundColor: 'white',
          border: '2px solid #10B981',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#10B981',
        }}
      >
        🧪 Test Account Login
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            border: '2px solid #10B981',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '200px',
          }}
        >
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
            Quick login for testing
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {PROD_TEST_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleLogin(user)}
                disabled={loading !== null}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  background: loading === user.email ? '#f0f0f0' : 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (loading === null) {
                    e.currentTarget.style.background = '#f9fafb'
                    e.currentTarget.style.borderColor = '#10B981'
                  }
                }}
                onMouseLeave={(e) => {
                  if (loading === null) {
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.borderColor = '#ddd'
                  }
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: user.color,
                  }}
                />
                <span>{loading === user.email ? 'Logging in...' : user.displayName}</span>
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                marginTop: '8px',
                padding: '6px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#c00',
              }}
            >
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
