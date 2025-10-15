interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100)

  const buttonBaseStyle: React.CSSProperties = {
    height: '32px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    padding: '0',
    margin: '0',
    outline: 'none',
    transition: 'background-color 0.2s',
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'white',
        padding: '6px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        style={{
          ...buttonBaseStyle,
          width: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          lineHeight: '1',
        }}
        title="Zoom out (Cmd/Ctrl + Scroll down)"
      >
        −
      </button>

      {/* Zoom Percentage Display + Reset */}
      <button
        onClick={onResetZoom}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        style={{
          ...buttonBaseStyle,
          minWidth: '65px',
          paddingLeft: '12px',
          paddingRight: '12px',
          textAlign: 'center',
        }}
        title="Reset zoom to 100%"
      >
        {zoomPercentage}%
      </button>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        style={{
          ...buttonBaseStyle,
          width: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          lineHeight: '1',
        }}
        title="Zoom in (Cmd/Ctrl + Scroll up)"
      >
        +
      </button>
    </div>
  )
}
