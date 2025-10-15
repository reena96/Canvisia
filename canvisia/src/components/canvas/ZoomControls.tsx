/**
 * Zoom controls component - positioned in bottom-right corner like Figma
 * Vertical layout with +, percentage, and - stacked
 */

interface ZoomControlsProps {
  zoomPercentage: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export function ZoomControls({ zoomPercentage, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        zIndex: 1000,
        border: '1px solid #E5E7EB',
      }}
    >
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        title="Zoom In"
        style={{
          width: '40px',
          height: '36px',
          border: 'none',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: 'white',
          color: '#1F2937',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white'
        }}
      >
        +
      </button>

      {/* Zoom Percentage */}
      <button
        onClick={onResetZoom}
        title="Reset zoom to 100%"
        style={{
          width: '40px',
          height: '32px',
          border: 'none',
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: 'white',
          color: '#6B7280',
          fontSize: '10px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB'
          e.currentTarget.style.color = '#1F2937'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white'
          e.currentTarget.style.color = '#6B7280'
        }}
      >
        {zoomPercentage}%
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        title="Zoom Out"
        style={{
          width: '40px',
          height: '36px',
          border: 'none',
          backgroundColor: 'white',
          color: '#1F2937',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white'
        }}
      >
        −
      </button>
    </div>
  )
}
