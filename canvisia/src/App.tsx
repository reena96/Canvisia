import { useState } from 'react'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { LoginButton } from './components/auth/LoginButton'
import { DevLogin } from './components/auth/DevLogin'
import { Header } from './components/layout/Header'
import { Canvas } from './components/canvas/Canvas'
import { AIChat } from './components/ai/AIChat'
import type { Presence } from './types/user'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeUsers, setActiveUsers] = useState<Presence[]>([])
  // Wrap in object to prevent React from calling the function when setting state
  const [presenceCleanup, setPresenceCleanup] = useState<{ fn: (() => Promise<void>) | null }>({ fn: null })

  console.log('[App] Rendering with activeUsers count:', activeUsers.length)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="stars-background">
          {/* Atmospheric depth layers */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(ellipse 1200px 800px at 25% 35%, rgba(75, 50, 140, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 900px 1100px at 75% 65%, rgba(45, 35, 95, 0.15) 0%, transparent 55%),
              radial-gradient(ellipse 1000px 700px at 50% 80%, rgba(60, 40, 110, 0.1) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }} />

          {/* The Sun - center of the solar system */}
          <div className="sun" />

          {/* Milky Way galaxy */}
          <div className="milky-way" />

          {/* Spiral Galaxies */}
          <div className="galaxy galaxy-1" />
          <div className="galaxy galaxy-2" />
          <div className="galaxy galaxy-3" />
          <div className="galaxy galaxy-4" />
          <div className="galaxy galaxy-5" />

          {/* Distant Galaxies */}
          <div className="galaxy-distant galaxy-distant-1" />
          <div className="galaxy-distant galaxy-distant-2" />
          <div className="galaxy-distant galaxy-distant-3" />
          <div className="galaxy-distant galaxy-distant-4" />

          {/* Planets */}
          <div className="planet planet-1" />
          <div className="planet planet-2" />
          <div className="planet planet-3" />
          <div className="planet planet-4" />
          <div className="planet planet-5" />
          <div className="planet planet-6" />
          <div className="planet planet-7" />
          <div className="planet planet-8" />
          <div className="planet planet-saturn">
            {/* Jupiter's four Galilean moons */}
            <div className="jupiter-moon moon-io" />
            <div className="jupiter-moon moon-europa" />
            <div className="jupiter-moon moon-ganymede" />
            <div className="jupiter-moon moon-callisto" />
          </div>

          {/* Small stars - more quantity, varied animations */}
          {[...Array(400)].map((_, i) => {
            const animations = ['twinkle', 'twinkleFast', 'twinkleSlow']
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
            return (
              <div key={`small-${i}`} className="star star-small" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationName: randomAnimation,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${1.5 + Math.random() * 2.5}s`
              }} />
            )
          })}
          {/* Medium stars - varied animations */}
          {[...Array(120)].map((_, i) => {
            const animations = ['twinkle', 'twinkleFast', 'twinkleSlow']
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
            return (
              <div key={`medium-${i}`} className="star star-medium" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationName: randomAnimation,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }} />
            )
          })}
          {/* Large stars - varied animations */}
          {[...Array(50)].map((_, i) => {
            const animations = ['twinkle', 'twinkleFast', 'twinkleSlow']
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)]
            return (
              <div key={`large-${i}`} className="star star-large" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationName: randomAnimation,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2.5 + Math.random() * 2.5}s`
              }} />
            )
          })}
        </div>
        <div className="login-content">
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            maxWidth: '420px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img
                src="/canvisia-logo.png"
                alt="Canvisia Logo"
                style={{
                  width: '180px',
                  height: '180px',
                  filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.4))'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '0.5rem',
              color: 'white',
              fontWeight: '300',
              textAlign: 'center',
              textShadow: '0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4), 0 4px 20px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              letterSpacing: '2px',
              textRendering: 'optimizeLegibility'
            }}>
              Canvisia
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2.5rem',
              textAlign: 'center',
              fontWeight: '400'
            }}>
              Realize your shared visions
            </p>
            <LoginButton />
            <DevLogin />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Header
        activeUsers={activeUsers}
        onSignOut={presenceCleanup.fn || undefined}
      />
      <Canvas
        onPresenceChange={setActiveUsers}
        onMountCleanup={(fn) => setPresenceCleanup({ fn })}
      />
      <AIChat canvasId="default-canvas" />

      {/* Attribution Footer */}
      <div style={{
        position: 'fixed',
        bottom: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        color: '#9CA3AF',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '2px 8px',
        borderRadius: '4px',
        zIndex: 500,
        textAlign: 'center',
        pointerEvents: 'auto'
      }}>
        <a
          href="https://www.flaticon.com/free-icons/saturn"
          title="saturn icons"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#6B7280', textDecoration: 'none' }}
        >
          Vega icon by Muhammad Ali - Flaticon
        </a>
      </div>
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
