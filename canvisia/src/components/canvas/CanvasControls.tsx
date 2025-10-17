import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useCanvasStore } from '@/stores/canvasStore'
import { CANVAS_CONFIG } from '@/config/canvas.config'
import { clampZoom } from '@/utils/canvasUtils'

export function CanvasControls() {
  const viewport = useCanvasStore((state) => state.viewport)
  const updateViewport = useCanvasStore((state) => state.updateViewport)
  const resetViewport = useCanvasStore((state) => state.resetViewport)

  const handleZoomIn = () => {
    const newZoom = clampZoom(viewport.zoom + CANVAS_CONFIG.ZOOM_STEP)
    updateViewport({ zoom: newZoom })
  }

  const handleZoomOut = () => {
    const newZoom = clampZoom(viewport.zoom - CANVAS_CONFIG.ZOOM_STEP)
    updateViewport({ zoom: newZoom })
  }

  const handleResetView = () => {
    resetViewport()
  }

  const zoomPercentage = Math.round(viewport.zoom * 100)

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleZoomIn}
        disabled={viewport.zoom >= CANVAS_CONFIG.MAX_ZOOM}
        style={{
          padding: '0.5rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Zoom In"
      >
        <ZoomIn size={20} color="#1F2937" />
      </button>

      <div
        style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '0.25rem 0',
          color: '#1F2937',
        }}
      >
        {zoomPercentage}%
      </div>

      <button
        onClick={handleZoomOut}
        disabled={viewport.zoom <= CANVAS_CONFIG.MIN_ZOOM}
        style={{
          padding: '0.5rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Zoom Out"
      >
        <ZoomOut size={20} color="#1F2937" />
      </button>

      <div
        style={{
          height: '1px',
          backgroundColor: '#ddd',
          margin: '0.25rem 0',
        }}
      />

      <button
        onClick={handleResetView}
        style={{
          padding: '0.5rem',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Reset View"
      >
        <Maximize2 size={20} color="#1F2937" />
      </button>
    </div>
  )
}
