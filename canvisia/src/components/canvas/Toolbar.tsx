import { useState } from 'react'
import { Hand, Maximize, MousePointer2, Lasso, Square, MessageCircle, MessageSquarePlus } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { shapeIcons, toolIcons } from '@/utils/generateShapeIcons'

type Tool = 'select' | 'boxSelect' | 'lasso' | 'hand' | 'comment' | 'rectangle' | 'circle' | 'ellipse' | 'roundedRectangle' | 'cylinder' | 'line' | 'text' | 'triangle' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'bidirectionalArrow' | 'bentConnector'

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
  onAskVega?: () => void
  isVegaOpen?: boolean
  onToggleComments?: () => void
  isCommentsOpen?: boolean
  unreadCommentsCount?: number
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
  onResetView,
  onAskVega,
  isVegaOpen = false,
  onToggleComments,
  isCommentsOpen = false,
  unreadCommentsCount = 0
}: ToolbarProps) {
  const [circlesExpanded, setCirclesExpanded] = useState(false)
  const [polygonsExpanded, setPolygonsExpanded] = useState(false)
  const [arrowsExpanded, setArrowsExpanded] = useState(false)

  const circleTools: Tool[] = ['circle', 'ellipse', 'cylinder']
  const polygonTools: Tool[] = ['rectangle', 'roundedRectangle', 'triangle', 'pentagon', 'hexagon', 'star']
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
      <button
        onClick={() => onToolSelect('select')}
        title="Select"
        style={{
          width: '40px',
          height: '40px',
          border: selectedTool === 'select' ? '2px solid #8B5CF6' : '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: selectedTool === 'select' ? '#EDE9FE' : 'white',
          color: '#1F2937',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (selectedTool !== 'select') {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTool !== 'select') {
            e.currentTarget.style.backgroundColor = 'white'
          }
        }}
      >
        <MousePointer2 size={20} color="#1F2937" />
      </button>
      <button
        onClick={() => onToolSelect('boxSelect')}
        title="Box Select"
        style={{
          width: '40px',
          height: '40px',
          border: selectedTool === 'boxSelect' ? '2px solid #8B5CF6' : '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: selectedTool === 'boxSelect' ? '#EDE9FE' : 'white',
          color: '#1F2937',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (selectedTool !== 'boxSelect') {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTool !== 'boxSelect') {
            e.currentTarget.style.backgroundColor = 'white'
          }
        }}
      >
        <Square size={20} color="#1F2937" strokeDasharray="4 2" />
      </button>
      <button
        onClick={() => onToolSelect('lasso')}
        title="Lasso Select"
        style={{
          width: '40px',
          height: '40px',
          border: selectedTool === 'lasso' ? '2px solid #8B5CF6' : '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: selectedTool === 'lasso' ? '#EDE9FE' : 'white',
          color: '#1F2937',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (selectedTool !== 'lasso') {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTool !== 'lasso') {
            e.currentTarget.style.backgroundColor = 'white'
          }
        }}
      >
        <Lasso size={20} color="#1F2937" />
      </button>
      <button
        onClick={() => onToolSelect('hand')}
        title="Hand (Pan)"
        style={{
          width: '40px',
          height: '40px',
          border: selectedTool === 'hand' ? '2px solid #8B5CF6' : '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: selectedTool === 'hand' ? '#EDE9FE' : 'white',
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

      {/* Conics - Collapsible */}
      <div style={{ position: 'relative', display: 'flex', gap: '4px' }}>
        <ToolButton
          icon={isCircleSelected ?
            selectedTool === 'circle' ? shapeIcons.circle :
            selectedTool === 'ellipse' ? shapeIcons.ellipse :
            shapeIcons.cylinder : shapeIcons.circle}
          label="Conics"
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
            selectedTool === 'roundedRectangle' ? shapeIcons.roundedRectangle :
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
              icon={shapeIcons.roundedRectangle}
              label="Rounded Rectangle"
              selected={selectedTool === 'roundedRectangle'}
              onClick={() => onToolSelect('roundedRectangle')}
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

          <div style={{ width: '1px', height: '32px', backgroundColor: '#E5E7EB' }} />
        </>
      )}

      {/* Comment Tool */}
      <button
        onClick={() => onToolSelect('comment')}
        title="Add Comment"
        style={{
          width: '40px',
          height: '40px',
          border: selectedTool === 'comment' ? '2px solid #8B5CF6' : '2px solid transparent',
          borderRadius: '6px',
          backgroundColor: selectedTool === 'comment' ? '#EDE9FE' : 'white',
          color: '#1F2937',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (selectedTool !== 'comment') {
            e.currentTarget.style.backgroundColor = '#F9FAFB'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTool !== 'comment') {
            e.currentTarget.style.backgroundColor = 'white'
          }
        }}
      >
        <MessageSquarePlus size={20} color="#1F2937" />
      </button>

      {/* Ask Vega Button */}
      {onAskVega && (
        <button
          onClick={onAskVega}
          title="Ask Vega AI"
          style={{
            height: '40px',
            padding: '0 12px',
            border: isVegaOpen ? '2px solid #667eea' : '2px solid transparent',
            borderRadius: '6px',
            backgroundColor: isVegaOpen ? '#f0f4ff' : 'white',
            color: '#1F2937',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            fontWeight: '500',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!isVegaOpen) {
              e.currentTarget.style.backgroundColor = '#F9FAFB'
            }
          }}
          onMouseLeave={(e) => {
            if (!isVegaOpen) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          <img src="/vega-icon.svg" alt="Vega" style={{ width: '25px', height: '25px' }} />
          <span>Ask Vega</span>
        </button>
      )}

      {/* Comments Button */}
      {onToggleComments && (
        <button
          onClick={onToggleComments}
          title="Comments"
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            border: isCommentsOpen ? '2px solid #8B5CF6' : '2px solid transparent',
            borderRadius: '6px',
            backgroundColor: isCommentsOpen ? '#EDE9FE' : 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isCommentsOpen) {
              e.currentTarget.style.backgroundColor = '#F9FAFB'
            }
          }}
          onMouseLeave={(e) => {
            if (!isCommentsOpen) {
              e.currentTarget.style.backgroundColor = 'white'
            }
          }}
        >
          <MessageCircle size={20} color={isCommentsOpen ? '#8B5CF6' : '#1F2937'} />
          {unreadCommentsCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              padding: '0 4px'
            }}>
              {unreadCommentsCount > 99 ? '99+' : unreadCommentsCount}
            </div>
          )}
        </button>
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
        border: selected ? '2px solid #8B5CF6' : '2px solid transparent',
        borderRadius: '6px',
        backgroundColor: selected ? '#EDE9FE' : disabled ? '#F3F4F6' : 'white',
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
