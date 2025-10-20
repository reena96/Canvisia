import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { createCanvas, deleteCanvas, updateCanvas } from '@/services/firestore';
import './CanvasSidebar.css';

interface Canvas {
  id: string;
  name: string;
  thumbnail?: string | null;
  order: number;
  settings: {
    backgroundColor: string;
    gridEnabled: boolean;
  };
  createdAt: Date;
  lastModified: Date;
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
  const [editingCanvasId, setEditingCanvasId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateCanvas = async () => {
    setIsCreating(true);
    try {
      const canvasNumber = canvases.length + 1;
      const canvasId = await createCanvas(projectId, `Canvas ${canvasNumber}`);
      onCanvasesChange();
      navigate(`/p/${projectId}/${canvasId}`);
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
      await deleteCanvas(projectId, canvasId);

      // If we deleted the active canvas, navigate to the project
      if (canvasId === activeCanvasId) {
        navigate(`/p/${projectId}`);
      }

      onCanvasesChange();
    } catch (error) {
      console.error('Error deleting canvas:', error);
      alert('Failed to delete canvas');
    }
  };

  const handleCanvasClick = (canvasId: string) => {
    if (editingCanvasId !== canvasId) {
      navigate(`/p/${projectId}/${canvasId}`);
    }
  };

  const handleStartRename = (canvasId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCanvasId(canvasId);
    setEditingName(currentName);
  };

  const handleCancelRename = () => {
    setEditingCanvasId(null);
    setEditingName('');
  };

  const handleSaveRename = async (canvasId: string) => {
    if (!editingName.trim()) {
      handleCancelRename();
      return;
    }

    try {
      await updateCanvas(projectId, canvasId, { name: editingName.trim() });
      onCanvasesChange();
      setEditingCanvasId(null);
      setEditingName('');
    } catch (error) {
      console.error('Error renaming canvas:', error);
      alert('Failed to rename canvas');
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, canvasId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(canvasId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
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
                  {canvas.thumbnail ? (
                    <img src={canvas.thumbnail} alt={canvas.name} />
                  ) : (
                    <div className="canvas-thumbnail-placeholder">
                      {canvas.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="canvas-info">
                  {editingCanvasId === canvas.id ? (
                    <input
                      type="text"
                      className="canvas-name-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveRename(canvas.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, canvas.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="canvas-name"
                      onDoubleClick={(e) => handleStartRename(canvas.id, canvas.name, e)}
                      title="Double-click to rename"
                    >
                      {canvas.name}
                    </div>
                  )}
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
