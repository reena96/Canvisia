import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './CanvasSidebar.css';

interface Canvas {
  id: string;
  name: string;
  thumbnail_url?: string;
  created_at: string;
}

interface CanvasSidebarProps {
  projectId: string;
  canvases: Canvas[];
  activeCanvasId?: string;
  onCanvasesChange: () => void;
}

export const CanvasSidebar: React.FC<CanvasSidebarProps> = ({
  projectId,
  canvases,
  activeCanvasId,
  onCanvasesChange
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCanvas = async () => {
    setIsCreating(true);
    try {
      const canvasNumber = canvases.length + 1;
      const { data, error } = await supabase
        .from('canvases')
        .insert({
          project_id: projectId,
          name: `Canvas ${canvasNumber}`,
          content: { elements: [] }
        })
        .select()
        .single();

      if (error) throw error;

      onCanvasesChange();
      navigate(`/projects/${projectId}/canvas/${data.id}`);
    } catch (error) {
      console.error('Error creating canvas:', error);
      alert('Failed to create canvas');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCanvas = async (canvasId: string, canvasName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${canvasName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('canvases')
        .delete()
        .eq('id', canvasId);

      if (error) throw error;

      // If we deleted the active canvas, navigate to the project
      if (canvasId === activeCanvasId) {
        navigate(`/projects/${projectId}`);
      }

      onCanvasesChange();
    } catch (error) {
      console.error('Error deleting canvas:', error);
      alert('Failed to delete canvas');
    }
  };

  const handleCanvasClick = (canvasId: string) => {
    navigate(`/projects/${projectId}/canvas/${canvasId}`);
  };

  return (
    <div className={`canvas-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="canvas-sidebar-header">
        {!isCollapsed && <h3>Canvases</h3>}
        <button
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <button
            className="create-canvas-button"
            onClick={handleCreateCanvas}
            disabled={isCreating}
          >
            <Plus size={20} />
            {isCreating ? 'Creating...' : 'New Canvas'}
          </button>

          <div className="canvas-list">
            {canvases.map((canvas) => (
              <div
                key={canvas.id}
                className={`canvas-item ${canvas.id === activeCanvasId ? 'active' : ''}`}
                onClick={() => handleCanvasClick(canvas.id)}
              >
                <div className="canvas-thumbnail">
                  {canvas.thumbnail_url ? (
                    <img src={canvas.thumbnail_url} alt={canvas.name} />
                  ) : (
                    <div className="canvas-thumbnail-placeholder">
                      {canvas.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="canvas-info">
                  <div className="canvas-name">{canvas.name}</div>
                </div>
                <button
                  className="delete-canvas-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCanvas(canvas.id, canvas.name);
                  }}
                  title="Delete canvas"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
