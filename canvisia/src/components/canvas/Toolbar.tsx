import { useState } from 'react'
import { Hand, Maximize } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { shapeIcons, toolIcons } from '@/utils/generateShapeIcons'

type Tool = 'select' | 'hand' | 'rectangle' | 'circle' | 'ellipse' | 'roundedRectangle' | 'cylinder' | 'line' | 'text' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bidirectionalArrow' | 'bentConnector'

interface ToolbarProps {
  selectedTool: Tool
  onToolSelect: (tool: Tool) => void
  selectedShapeColor?: string
  onColorChange?: (color: string) => void
  zoomPercentage?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
  onResetView?: () => void
}

export function Toolbar({
  selectedTool,
  onToolSelect,
  selectedShapeColor,
  onColorChange,
  zoomPercentage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onResetView
}: ToolbarProps) {
  const [circlesExpanded, setCirclesExpanded] = useState(false)
  const [polygonsExpanded, setPolygonsExpanded] = useState(false)
  const [arrowsExpanded, setArrowsExpanded] = useState(false)

  const circleTools: Tool[] = ['circle', 'ellipse', 'roundedRectangle', 'cylinder']
  const polygonTools: Tool[] = ['rectangle', 'triangle', 'pentagon', 'hexagon', 'star']
  const arrowTools: Tool[] = ['line', 'arrow', 'bidirectionalArrow']

  const isCircleSelected = circleTools.includes(selectedTool)
  const isPolygonSelected = polygonTools.includes(selectedTool)
  const isArrowSelected = arrowTools.includes(selectedTool)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px', // Back to original position
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        padding: '8px 12px',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 1000,
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
        <Hand size={20} color="#1F2937" />
      </button>

      <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />

      {/* Text Tool */}
      <ToolButton
        icon={toolIcons.text}
        label="Text"
        selected={selectedTool === 'text'}
        onClick={() => onToolSelect(selectedTool === 'text' ? 'select' : 'text')}
      />

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
            setCirclesExpanded(!circlesExpanded)
            if (!circlesExpanded) {
              setPolygonsExpanded(false)
              setArrowsExpanded(false)
            }
          }}
          isImage={true}
        />

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
              onClick={() => onToolSelect('circle')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.ellipse}
              label="Ellipse"
              selected={selectedTool === 'ellipse'}
              onClick={() => onToolSelect('ellipse')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.roundedRectangle}
              label="Rounded Rectangle"
              selected={selectedTool === 'roundedRectangle'}
              onClick={() => onToolSelect('roundedRectangle')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.cylinder}
              label="Cylinder"
              selected={selectedTool === 'cylinder'}
              onClick={() => onToolSelect('cylinder')}
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
            selectedTool === 'triangle' ? shapeIcons.triangle :
            selectedTool === 'pentagon' ? shapeIcons.pentagon :
            selectedTool === 'hexagon' ? shapeIcons.hexagon :
            shapeIcons.star : shapeIcons.rectangle}
          label="Polygons"
          selected={isPolygonSelected}
          onClick={() => {
            setPolygonsExpanded(!polygonsExpanded)
            if (!polygonsExpanded) {
              setCirclesExpanded(false)
              setArrowsExpanded(false)
            }
          }}
          isImage={true}
        />

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
              onClick={() => onToolSelect('rectangle')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.triangle}
              label="Triangle"
              selected={selectedTool === 'triangle'}
              onClick={() => onToolSelect('triangle')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.pentagon}
              label="Pentagon"
              selected={selectedTool === 'pentagon'}
              onClick={() => onToolSelect('pentagon')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.hexagon}
              label="Hexagon"
              selected={selectedTool === 'hexagon'}
              onClick={() => onToolSelect('hexagon')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.star}
              label="Star"
              selected={selectedTool === 'star'}
              onClick={() => onToolSelect('star')}
              isImage={true}
            />
          </div>
        )}
      </div>

      {/* Lines & Connectors - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isArrowSelected ?
            selectedTool === 'line' ? toolIcons.line :
            selectedTool === 'arrow' ? shapeIcons.arrow :
            selectedTool === 'bidirectionalArrow' ? shapeIcons.bidirectionalArrow :
            shapeIcons.lineAndArrow : shapeIcons.lineAndArrow}
          label="Lines & Connectors"
          selected={isArrowSelected}
          onClick={() => {
            setArrowsExpanded(!arrowsExpanded)
            if (!arrowsExpanded) {
              setCirclesExpanded(false)
              setPolygonsExpanded(false)
            }
          }}
          isImage={selectedTool === 'line' ? false : true}
        />

        {/* Expanded line & connector options */}
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
              icon={toolIcons.line}
              label="Line"
              selected={selectedTool === 'line'}
              onClick={() => onToolSelect('line')}
              isImage={false}
            />
            <ToolButton
              icon={shapeIcons.arrow}
              label="Arrow"
              selected={selectedTool === 'arrow'}
              onClick={() => onToolSelect('arrow')}
              isImage={true}
            />
            <ToolButton
              icon={shapeIcons.bidirectionalArrow}
              label="Bidirectional Arrow"
              selected={selectedTool === 'bidirectionalArrow'}
              onClick={() => onToolSelect('bidirectionalArrow')}
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

      {/* Zoom Controls */}
      {zoomPercentage !== undefined && onZoomIn && onZoomOut && onResetZoom && onResetView && (
        <>
          <button
            onClick={onZoomOut}
            title="Zoom Out"
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid transparent',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#1F2937',
              fontSize: '18px',
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
          <button
            onClick={onResetZoom}
            title="Reset zoom to 100%"
            style={{
              minWidth: '50px',
              height: '40px',
              border: '2px solid transparent',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#6B7280',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              padding: '0 8px',
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
          <button
            onClick={onZoomIn}
            title="Zoom In"
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid transparent',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#1F2937',
              fontSize: '18px',
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
            <Maximize size={18} />
          </button>
        </>
      )}

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
