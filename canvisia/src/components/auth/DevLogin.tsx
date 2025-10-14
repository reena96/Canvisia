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
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'white',
        border: '2px solid #ff6b00',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: '200px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#ff6b00',
          marginBottom: '12px',
          textTransform: 'uppercase',
        }}
      >
        🔧 Dev Login
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {TEST_USERS.map((user) => (
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
            marginTop: '12px',
            padding: '8px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#c00',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: '12px',
          fontSize: '11px',
          color: '#666',
          borderTop: '1px solid #eee',
          paddingTop: '8px',
        }}
      >
        💡 Open multiple browser tabs to test multiplayer cursors
      </div>
    </div>
  )
}
