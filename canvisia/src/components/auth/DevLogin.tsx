/**
 * Development-only component for quick login with test users
 * Only shows when Firebase emulator is detected
 */

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { DEV_USER_COLORS } from '@/config/userColors'

interface TestUser {
  email: string
  password: string
  displayName: string
  color: string
}

const TEST_USERS: TestUser[] = DEV_USER_COLORS.map((userColor) => ({
  email: `${userColor.displayName.toLowerCase()}@test.com`,
  password: 'password123',
  displayName: userColor.displayName,
  color: userColor.color,
}))

export function DevLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // Only show in development mode (emulator auto-connects in firebase.ts)
  const isDevelopment = import.meta.env.DEV

  if (!isDevelopment) return null

  const handleLogin = async (user: TestUser) => {
    setLoading(user.email)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, user.email, user.password)
    } catch (err: any) {
      console.error('Dev login error:', err)
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.9rem',
          backgroundColor: 'white',
          border: '2px solid #ff6b00',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#ff6b00',
        }}
      >
        🔧 Dev Login
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'white',
            border: '2px solid #ff6b00',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '180px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {TEST_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleLogin(user)}
                disabled={loading !== null}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  background: loading === user.email ? '#f0f0f0' : 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
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
                <span>{loading === user.email ? 'Loading...' : user.displayName}</span>
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
