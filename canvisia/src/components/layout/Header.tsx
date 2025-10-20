import { Users, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import type { Presence } from '@/types/user'
import { Tooltip } from '../ui/Tooltip'

interface HeaderProps {
  activeUsers?: Presence[]
  onSignOut?: () => Promise<void>
  projectName?: string
  projectId?: string
  onShareClick?: () => void
}

export function Header({ activeUsers = [], onSignOut, projectName, projectId, onShareClick }: HeaderProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  console.log('[Header] Rendering with activeUsers:', activeUsers)

  if (!user) return null

  const handleBackToProjects = () => {
    navigate('/projects')
  }

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {projectName && (
          <button
            onClick={handleBackToProjects}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#1F2937',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EDE9FE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span>←</span> Back to projects
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: projectName ? '#1F2937' : '#8B5CF6' }}>
          {projectName || 'Canvisia'}
        </h1>
        {projectId && onShareClick && (
          <Tooltip content="Share project">
            <button
              onClick={onShareClick}
              style={{
                padding: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6B7280',
                fontWeight: '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
                e.currentTarget.style.color = '#8B5CF6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6B7280'
              }}
            >
              <Share2 size={18} />
            </button>
          </Tooltip>
        )}
      </div>

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
              .filter((u) => u.userId) // Only show users with valid userId
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
            backgroundColor: '#8B5CF6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: '500',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#7C3AED'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#8B5CF6'
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
