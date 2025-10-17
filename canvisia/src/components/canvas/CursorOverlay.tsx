import { canvasToScreen } from '@/utils/canvasUtils'
import type { CursorPosition, Presence } from '@/types/user'
import type { Viewport } from '@/types/canvas'

interface CursorOverlayProps {
  cursors: Record<string, CursorPosition>
  activeUsers: Presence[]
  viewport: Viewport
}

interface CursorDisplayProps {
  cursor: CursorPosition
  screenX: number
  screenY: number
  isActive: boolean
}

function CursorDisplay({ cursor, screenX, screenY, isActive }: CursorDisplayProps) {
  const opacity = isActive ? 1 : 0.5
  const displayColor = cursor.color

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        pointerEvents: 'none',
        zIndex: 1000,
        transform: 'translate(-2px, -2px)', // Center the cursor icon
        opacity,
      }}
    >
      {/* Cursor icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={displayColor}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
      >
        <path d="M5 3l3.057 11.5L11 13l1.5 3.943L16.5 17.5 5 3z" />
      </svg>

      {/* User name label */}
      <div
        style={{
          marginTop: '4px',
          marginLeft: '12px',
          padding: '4px 8px',
          backgroundColor: displayColor,
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {cursor.userName}
      </div>
    </div>
  )
}

export function CursorOverlay({ cursors, activeUsers, viewport }: CursorOverlayProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {Object.entries(cursors).map(([userId, cursor]) => {
        // Convert canvas coordinates to screen coordinates
        const screenPos = canvasToScreen(cursor.x, cursor.y, viewport)

        // Find if this user is active
        const presence = activeUsers.find(u => u.userId === cursor.userId)
        const isActive = presence?.isActive || false

        return (
          <CursorDisplay
            key={userId}
            cursor={cursor}
            screenX={screenPos.x}
            screenY={screenPos.y}
            isActive={isActive}
          />
        )
      })}
    </div>
  )
}
