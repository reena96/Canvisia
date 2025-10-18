import { Users } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import type { Presence } from '@/types/user'

interface HeaderProps {
  activeUsers?: Presence[]
  onSignOut?: () => Promise<void>
}

export function Header({ activeUsers = [], onSignOut }: HeaderProps) {
  const { user, signOut } = useAuth()

  console.log('[Header] Rendering with activeUsers:', activeUsers)

  if (!user) return null

  const handleSignOut = async () => {
    console.log('[Header] Sign out button clicked')
    try {
      // Call custom cleanup handler first if provided
      if (onSignOut && typeof onSignOut === 'function') {
        console.log('[Header] Calling onSignOut cleanup handler')
        await onSignOut()
        console.log('[Header] Cleanup handler completed')
      } else {
        console.log('[Header] No valid onSignOut cleanup handler provided')
      }
      // Then sign out
      console.log('[Header] Calling signOut from auth')
      await signOut()
      console.log('[Header] Sign out completed')
    } catch (error) {
      console.error('[Header] Failed to sign out:', error)
    }
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'rgba(245, 245, 245, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #ddd',
        zIndex: 1000,
      }}
    >
      <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1F2937 !important' }}>Canvisia</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Presence indicator */}
        <div
          style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1F2937 !important', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} style={{ color: '#1F2937' }} />
            {activeUsers.length}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {activeUsers
              .slice(0, 5)
              .map((u) => (
                <div
                  key={u.userId}
                  title={u.userName}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: u.color,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              ))}
          </div>
        </div>

        {/* User info */}
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
            }}
          />
        )}
        <span style={{ fontSize: '0.9rem', color: '#1F2937 !important' }}>{user.displayName || user.email}</span>
        <button
          onClick={handleSignOut}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backgroundColor: '#4B5563',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#374151'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4B5563'
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
