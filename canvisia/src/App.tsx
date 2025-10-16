import { useState } from 'react'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { LoginButton } from './components/auth/LoginButton'
import { DevLogin } from './components/auth/DevLogin'
import { Header } from './components/layout/Header'
import { Canvas } from './components/canvas/Canvas'
import type { Presence } from './types/user'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeUsers, setActiveUsers] = useState<Presence[]>([])
  const [presenceCleanup, setPresenceCleanup] = useState<(() => Promise<void>) | null>(null)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <h1>Canvisia</h1>
        <p>Real-time collaborative design tool</p>
        <LoginButton />
        <DevLogin />
      </div>
    )
  }

  return (
    <div className="app" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Header
        activeUsers={activeUsers}
        onSignOut={presenceCleanup || undefined}
      />
      <Canvas
        onPresenceChange={setActiveUsers}
        onMountCleanup={(cleanup) => setPresenceCleanup(() => cleanup)}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
