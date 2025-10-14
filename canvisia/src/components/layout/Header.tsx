import { useAuth } from '../auth/AuthProvider'

export function Header() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
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
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Canvisia</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
        <span style={{ fontSize: '0.9rem' }}>{user.displayName || user.email}</span>
        <button
          onClick={handleSignOut}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}
