import { useState } from 'react'
import { ColorPicker } from './ColorPicker'

type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bidirectionalArrow' | 'bentConnector'

interface ToolbarProps {
  selectedTool: Tool
  onToolSelect: (tool: Tool) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  selectedShapeColor?: string
  onColorChange?: (color: string) => void
}

export function Toolbar({
  selectedTool,
  onToolSelect,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  selectedShapeColor,
  onColorChange
}: ToolbarProps) {
  const [polygonsExpanded, setPolygonsExpanded] = useState(false)
  const [arrowsExpanded, setArrowsExpanded] = useState(false)
  const zoomPercentage = Math.round(zoom * 100)

  const polygonTools: Tool[] = ['triangle', 'pentagon', 'hexagon', 'star']
  const arrowTools: Tool[] = ['arrow', 'bidirectionalArrow', 'bentConnector']

  const isPolygonSelected = polygonTools.includes(selectedTool)
  const isArrowSelected = arrowTools.includes(selectedTool)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        padding: '8px 12px',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1000,
        maxWidth: 'calc(100vw - 40px)',
        flexWrap: 'wrap',
      }}
    >
      {/* Basic Tools */}
      <ToolButton
        icon="☝"
        label="Select"
        selected={selectedTool === 'select'}
        onClick={() => onToolSelect('select')}
      />

      <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

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

      <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

      {/* Polygons - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isPolygonSelected ? selectedTool === 'triangle' ? '△' :
                                     selectedTool === 'pentagon' ? '⬟' :
                                     selectedTool === 'hexagon' ? '⬡' : '★' : '△'}
          label="Polygons"
          selected={isPolygonSelected}
          onClick={() => {
            if (!polygonsExpanded) {
              setPolygonsExpanded(true)
            } else {
              onToolSelect('triangle')
            }
          }}
        />
        {/* Expand arrow indicator */}
        <button
          onClick={() => setPolygonsExpanded(!polygonsExpanded)}
          style={{
            position: 'absolute',
            right: '-4px',
            bottom: '-4px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {polygonsExpanded ? '▼' : '▶'}
        </button>

        {/* Expanded polygon options */}
        {polygonsExpanded && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '0',
              backgroundColor: 'white',
              padding: '8px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 1001,
            }}
          >
            <ToolButton
              icon="△"
              label="Triangle"
              selected={selectedTool === 'triangle'}
              onClick={() => {
                onToolSelect('triangle')
                setPolygonsExpanded(false)
              }}
            />
            <ToolButton
              icon="⬟"
              label="Pentagon"
              selected={selectedTool === 'pentagon'}
              onClick={() => {
                onToolSelect('pentagon')
                setPolygonsExpanded(false)
              }}
            />
            <ToolButton
              icon="⬡"
              label="Hexagon"
              selected={selectedTool === 'hexagon'}
              onClick={() => {
                onToolSelect('hexagon')
                setPolygonsExpanded(false)
              }}
            />
            <ToolButton
              icon="★"
              label="Star"
              selected={selectedTool === 'star'}
              onClick={() => {
                onToolSelect('star')
                setPolygonsExpanded(false)
              }}
            />
          </div>
        )}
      </div>

      {/* Arrows/Connectors - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isArrowSelected ? selectedTool === 'arrow' ? '→' :
                                  selectedTool === 'bidirectionalArrow' ? '↔' : '⌙' : '→'}
          label="Arrows"
          selected={isArrowSelected}
          onClick={() => {
            if (!arrowsExpanded) {
              setArrowsExpanded(true)
            } else {
              onToolSelect('arrow')
            }
          }}
        />
        {/* Expand arrow indicator */}
        <button
          onClick={() => setArrowsExpanded(!arrowsExpanded)}
          style={{
            position: 'absolute',
            right: '-4px',
            bottom: '-4px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1px solid #E5E7EB',
            backgroundColor: 'white',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {arrowsExpanded ? '▼' : '▶'}
        </button>

        {/* Expanded arrow options */}
        {arrowsExpanded && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '0',
              backgroundColor: 'white',
              padding: '8px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 1001,
            }}
          >
            <ToolButton
              icon="→"
              label="Arrow"
              selected={selectedTool === 'arrow'}
              onClick={() => {
                onToolSelect('arrow')
                setArrowsExpanded(false)
              }}
            />
            <ToolButton
              icon="↔"
              label="Bidirectional Arrow"
              selected={selectedTool === 'bidirectionalArrow'}
              onClick={() => {
                onToolSelect('bidirectionalArrow')
                setArrowsExpanded(false)
              }}
            />
            <ToolButton
              icon="⌙"
              label="Bent Connector"
              selected={selectedTool === 'bentConnector'}
              onClick={() => {
                onToolSelect('bentConnector')
                setArrowsExpanded(false)
              }}
            />
          </div>
        )}
      </div>

      <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

      {/* Color Picker - only show when shape is selected */}
      {selectedShapeColor && onColorChange && (
        <>
          <ColorPicker
            currentColor={selectedShapeColor}
            onColorChange={onColorChange}
            position={{ x: 0, y: -280 }}
          />
          <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />
        </>
      )}

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
          height: '40px',
          padding: '0 12px',
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
          minWidth: '60px',
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
        width: '40px',
        height: '40px',
        border: selected ? '2px solid #3B82F6' : '2px solid transparent',
        borderRadius: '6px',
        backgroundColor: selected ? '#EFF6FF' : disabled ? '#F3F4F6' : 'white',
        color: disabled ? '#9CA3AF' : '#1F2937',
        fontSize: '18px',
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
