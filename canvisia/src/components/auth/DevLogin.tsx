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

// Test users - same for both development and production
// Note: Firebase Auth normalizes emails to lowercase
const TEST_USERS: TestUser[] = [
  {
    email: 'alice@test.com',
    password: 'password123',
    displayName: 'Alice',
    color: DEV_USER_COLORS[0].color,
  },
  {
    email: 'bob@test.com',
    password: 'password123',
    displayName: 'Bob',
    color: DEV_USER_COLORS[1].color,
  },
  {
    email: 'charlie@test.com',
    password: 'password123',
    displayName: 'Charlie',
    color: DEV_USER_COLORS[2].color,
  },
]

export function DevLogin() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  // Show in development mode OR if explicitly enabled via env var
  const isDevelopment = import.meta.env.DEV
  const isDevLoginEnabled = import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'

  if (!isDevelopment && !isDevLoginEnabled) return null

  const handleLogin = async (user: TestUser) => {
    setLoading(user.email)
    setError(null)

    try {
      console.log('[DevLogin] Attempting login with:', user.email)
      console.log('[DevLogin] Auth instance:', auth)
      console.log('[DevLogin] Auth config:', (auth as any).config)
      await signInWithEmailAndPassword(auth, user.email, user.password)
      console.log('[DevLogin] Login successful!')
    } catch (err: any) {
      console.error('[DevLogin] Login error:', err)
      console.error('[DevLogin] Error code:', err.code)
      console.error('[DevLogin] Error message:', err.message)
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
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.5)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '500',
          color: '#FDB88D',
          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.7)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
          e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.5)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        🔧 Dev Login
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'rgba(15, 12, 41, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            zIndex: 9999,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {TEST_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleLogin(user)}
                disabled={loading !== null}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: loading === user.email ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: user.color,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${user.color}40`,
                  }}
                />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                  {loading === user.email ? 'Loading...' : user.displayName}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                background: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(252, 165, 165, 0.3)',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                color: '#fca5a5',
                backdropFilter: 'blur(10px)',
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
