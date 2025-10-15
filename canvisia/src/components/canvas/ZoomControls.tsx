interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoom * 100)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#374151',
        }}
        title="Zoom out (Cmd/Ctrl + Scroll down)"
      >
        −
      </button>

      {/* Zoom Percentage Display + Reset */}
      <button
        onClick={onResetZoom}
        style={{
          minWidth: '60px',
          height: '32px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '500',
          color: '#374151',
          padding: '0 8px',
        }}
        title="Reset zoom to 100%"
      >
        {zoomPercentage}%
      </button>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#374151',
        }}
        title="Zoom in (Cmd/Ctrl + Scroll up)"
      >
        +
      </button>
    </div>
  )
}
