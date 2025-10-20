import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Canvas } from '../components/canvas/Canvas';
import { CanvasSidebar } from '../components/canvas/CanvasSidebar';

interface CanvasData {
  id: string;
  name: string;
  thumbnail_url?: string;
  created_at: string;
}

export const ProjectView: React.FC = () => {
  const { projectId, canvasId } = useParams<{ projectId: string; canvasId?: string }>();
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCanvases = async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('canvases')
        .select('id, name, thumbnail_url, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setCanvases(data || []);

      // If no canvas is specified but we have canvases, navigate to the first one
      if (!canvasId && data && data.length > 0) {
        navigate(`/projects/${projectId}/canvas/${data[0].id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error loading canvases:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLastAccessed = async () => {
    if (!projectId) return;

    try {
      await supabase
        .from('projects')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', projectId);
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  };

  useEffect(() => {
    loadCanvases();
    updateLastAccessed();
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <CanvasSidebar
        projectId={projectId!}
        canvases={canvases}
        activeCanvasId={canvasId}
        onCanvasesChange={loadCanvases}
      />
      {canvasId && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Canvas canvasId={canvasId} />
        </div>
      )}
      {!canvasId && canvases.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280'
        }}>
          Create a canvas to get started
        </div>
      )}
    </div>
  );
};
