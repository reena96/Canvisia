import { useState } from 'react'
import { Maximize, Hand } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { shapeIcons, toolIcons } from '@/utils/generateShapeIcons'

type Tool = 'select' | 'hand' | 'rectangle' | 'circle' | 'ellipse' | 'roundedRectangle' | 'cylinder' | 'diamond' | 'line' | 'text' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bidirectionalArrow' | 'bentConnector'

interface ToolbarProps {
  selectedTool: Tool
  onToolSelect: (tool: Tool) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onResetView: () => void
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
  onResetView,
  selectedShapeColor,
  onColorChange
}: ToolbarProps) {
  const [circlesExpanded, setCirclesExpanded] = useState(false)
  const [polygonsExpanded, setPolygonsExpanded] = useState(false)
  const [arrowsExpanded, setArrowsExpanded] = useState(false)
  const zoomPercentage = Math.round(zoom * 100)

  const circleTools: Tool[] = ['circle', 'ellipse', 'roundedRectangle', 'cylinder']
  const polygonTools: Tool[] = ['rectangle', 'diamond', 'triangle', 'pentagon', 'hexagon', 'star']
  const arrowTools: Tool[] = ['arrow', 'bidirectionalArrow', 'bentConnector']

  const isCircleSelected = circleTools.includes(selectedTool)
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
        icon="➚"
        label="Select"
        selected={selectedTool === 'select'}
        onClick={() => onToolSelect('select')}
      />
      <button
        onClick={() => onToolSelect('hand')}
        title="Hand (Pan)"
        style={{
          width: '40px',
          height: '40px',
          border: selectedTool === 'hand' ? '2px solid #3B82F6' : '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: selectedTool === 'hand' ? '#EFF6FF' : 'white',
          color: '#1F2937',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (selectedTool !== 'hand') {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTool !== 'hand') {
            e.currentTarget.style.backgroundColor = 'white'
          }
        }}
      >
        <Hand size={20} />
      </button>

      <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

      {/* Circles - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isCircleSelected ?
            selectedTool === 'circle' ? shapeIcons.circle :
            selectedTool === 'ellipse' ? shapeIcons.ellipse :
            selectedTool === 'roundedRectangle' ? shapeIcons.roundedRectangle :
            shapeIcons.cylinder : shapeIcons.circle}
          label="Circles"
          selected={isCircleSelected}
          onClick={() => {
            if (!circlesExpanded) {
              setCirclesExpanded(true)
              setPolygonsExpanded(false)
              setArrowsExpanded(false)
            } else {
              onToolSelect('circle')
            }
          }}
          isImage={true}
        />
        <button
          onClick={() => {
            setCirclesExpanded(!circlesExpanded)
            if (!circlesExpanded) {
              setPolygonsExpanded(false)
              setArrowsExpanded(false)
            }
          }}
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
          {circlesExpanded ? '▼' : '▶'}
        </button>

        {circlesExpanded && (
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
              flexDirection: 'row',
              gap: '4px',
              zIndex: 1001,
            }}
          >
            <ToolButton
              icon={shapeIcons.circle}
              label="Circle"
              selected={selectedTool === 'circle'}
              onClick={() => {
                onToolSelect('circle')
                setCirclesExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.ellipse}
              label="Ellipse"
              selected={selectedTool === 'ellipse'}
              onClick={() => {
                onToolSelect('ellipse')
                setCirclesExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.roundedRectangle}
              label="Rounded Rectangle"
              selected={selectedTool === 'roundedRectangle'}
              onClick={() => {
                onToolSelect('roundedRectangle')
                setCirclesExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.cylinder}
              label="Cylinder"
              selected={selectedTool === 'cylinder'}
              onClick={() => {
                onToolSelect('cylinder')
                setCirclesExpanded(false)
              }}
              isImage={true}
            />
          </div>
        )}
      </div>

      {/* Polygons - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isPolygonSelected ?
            selectedTool === 'rectangle' ? shapeIcons.rectangle :
            selectedTool === 'diamond' ? shapeIcons.diamond :
            selectedTool === 'triangle' ? shapeIcons.triangle :
            selectedTool === 'pentagon' ? shapeIcons.pentagon :
            selectedTool === 'hexagon' ? shapeIcons.hexagon :
            shapeIcons.star : shapeIcons.rectangle}
          label="Polygons"
          selected={isPolygonSelected}
          onClick={() => {
            if (!polygonsExpanded) {
              setPolygonsExpanded(true)
              setCirclesExpanded(false)
              setArrowsExpanded(false)
            } else {
              onToolSelect('rectangle')
            }
          }}
          isImage={true}
        />
        <button
          onClick={() => {
            setPolygonsExpanded(!polygonsExpanded)
            if (!polygonsExpanded) {
              setCirclesExpanded(false)
              setArrowsExpanded(false)
            }
          }}
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
              flexDirection: 'row',
              gap: '4px',
              zIndex: 1001,
            }}
          >
            <ToolButton
              icon={shapeIcons.rectangle}
              label="Rectangle"
              selected={selectedTool === 'rectangle'}
              onClick={() => {
                onToolSelect('rectangle')
                setPolygonsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.diamond}
              label="Diamond"
              selected={selectedTool === 'diamond'}
              onClick={() => {
                onToolSelect('diamond')
                setPolygonsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.triangle}
              label="Triangle"
              selected={selectedTool === 'triangle'}
              onClick={() => {
                onToolSelect('triangle')
                setPolygonsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.pentagon}
              label="Pentagon"
              selected={selectedTool === 'pentagon'}
              onClick={() => {
                onToolSelect('pentagon')
                setPolygonsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.hexagon}
              label="Hexagon"
              selected={selectedTool === 'hexagon'}
              onClick={() => {
                onToolSelect('hexagon')
                setPolygonsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.star}
              label="Star"
              selected={selectedTool === 'star'}
              onClick={() => {
                onToolSelect('star')
                setPolygonsExpanded(false)
              }}
              isImage={true}
            />
          </div>
        )}
      </div>

      {/* Arrows/Connectors - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isArrowSelected ?
            selectedTool === 'arrow' ? shapeIcons.arrow :
            selectedTool === 'bidirectionalArrow' ? shapeIcons.bidirectionalArrow :
            shapeIcons.bentConnector : shapeIcons.arrow}
          label="Arrows"
          selected={isArrowSelected}
          onClick={() => {
            if (!arrowsExpanded) {
              setArrowsExpanded(true)
              setCirclesExpanded(false)
              setPolygonsExpanded(false)
            } else {
              onToolSelect('arrow')
            }
          }}
          isImage={true}
        />
        {/* Expand arrow indicator */}
        <button
          onClick={() => {
            setArrowsExpanded(!arrowsExpanded)
            if (!arrowsExpanded) {
              setCirclesExpanded(false)
              setPolygonsExpanded(false)
            }
          }}
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
              flexDirection: 'row',
              gap: '4px',
              zIndex: 1001,
            }}
          >
            <ToolButton
              icon={shapeIcons.arrow}
              label="Arrow"
              selected={selectedTool === 'arrow'}
              onClick={() => {
                onToolSelect('arrow')
                setArrowsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.bidirectionalArrow}
              label="Bidirectional Arrow"
              selected={selectedTool === 'bidirectionalArrow'}
              onClick={() => {
                onToolSelect('bidirectionalArrow')
                setArrowsExpanded(false)
              }}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.bentConnector}
              label="Bent Connector"
              selected={selectedTool === 'bentConnector'}
              onClick={() => {
                onToolSelect('bentConnector')
                setArrowsExpanded(false)
              }}
              isImage={true}
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

      {/* View Controls */}
      <button
        onClick={onResetView}
        title="Reset View"
        style={{
          width: '40px',
          height: '40px',
          border: '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: 'white',
          color: '#1F2937',
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
        <Maximize size={20} />
      </button>

      <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

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
  fontSize?: string
  isImage?: boolean
}

function ToolButton({ icon, label, selected, onClick, disabled, fontSize = '20px', isImage = false }: ToolButtonProps) {
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
        fontSize: fontSize,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
        padding: 0,
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
      {isImage ? (
        <img
          src={icon}
          alt={label}
          style={{
            width: '26px',
            height: '26px',
            pointerEvents: 'none',
          }}
        />
      ) : (
        icon
      )}
    </button>
  )
}

export type { Tool }
