type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bentConnector'

interface ToolbarProps {
  selectedTool: Tool
  onToolSelect: (tool: Tool) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export function Toolbar({ selectedTool, onToolSelect, zoom, onZoomIn, onZoomOut, onResetZoom }: ToolbarProps) {
  const zoomPercentage = Math.round(zoom * 100)
  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        top: '80px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
      }}
    >
      <ToolButton
        icon="↖"
        label="Select"
        selected={selectedTool === 'select'}
        onClick={() => onToolSelect('select')}
      />
      <ToolButton
        icon="▭"
        label="Rectangle"
        selected={selectedTool === 'rectangle'}
        onClick={() => onToolSelect('rectangle')}
      />
      <ToolButton
        icon="○"
        label="Circle"
        selected={selectedTool === 'circle'}
        onClick={() => onToolSelect('circle')}
      />
      <ToolButton
        icon="/"
        label="Line"
        selected={selectedTool === 'line'}
        onClick={() => onToolSelect('line')}
      />
      <ToolButton
        icon="T"
        label="Text"
        selected={selectedTool === 'text'}
        onClick={() => onToolSelect('text')}
      />
      <ToolButton
        icon="△"
        label="Triangle"
        selected={selectedTool === 'triangle'}
        onClick={() => onToolSelect('triangle')}
      />
      <ToolButton
        icon="⬟"
        label="Pentagon"
        selected={selectedTool === 'pentagon'}
        onClick={() => onToolSelect('pentagon')}
      />
      <ToolButton
        icon="⬡"
        label="Hexagon"
        selected={selectedTool === 'hexagon'}
        onClick={() => onToolSelect('hexagon')}
      />
      <ToolButton
        icon="★"
        label="Star"
        selected={selectedTool === 'star'}
        onClick={() => onToolSelect('star')}
      />
      <ToolButton
        icon="→"
        label="Arrow"
        selected={selectedTool === 'arrow'}
        onClick={() => onToolSelect('arrow')}
      />
      <ToolButton
        icon="⌙"
        label="Bent Connector"
        selected={selectedTool === 'bentConnector'}
        onClick={() => onToolSelect('bentConnector')}
      />

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '4px 0' }} />

      {/* Zoom Controls */}
      <ToolButton
        icon="+"
        label="Zoom In"
        selected={false}
        onClick={onZoomIn}
      />
      <button
        onClick={onResetZoom}
        title="Reset zoom to 100%"
        style={{
          width: '48px',
          height: '32px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          backgroundColor: 'white',
          color: '#1F2937',
          fontSize: '12px',
          fontWeight: '500',
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
        {zoomPercentage}%
      </button>
      <ToolButton
        icon="−"
        label="Zoom Out"
        selected={false}
        onClick={onZoomOut}
      />
    </div>
  )
}

interface ToolButtonProps {
  icon: string
  label: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

function ToolButton({ icon, label, selected, onClick, disabled }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={{
        width: '48px',
        height: '48px',
        border: selected ? '2px solid #3B82F6' : '2px solid transparent',
        borderRadius: '6px',
        backgroundColor: selected ? '#EFF6FF' : disabled ? '#F3F4F6' : 'white',
        color: disabled ? '#9CA3AF' : '#1F2937',
        fontSize: '20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.backgroundColor = '#F9FAFB'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.backgroundColor = 'white'
        }
      }}
    >
      {icon}
    </button>
  )
}

export type { Tool }
