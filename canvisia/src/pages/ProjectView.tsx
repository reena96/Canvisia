import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '../components/canvas/Canvas';
import { CanvasSidebar } from '../components/canvas/CanvasSidebar';
import { AIChat } from '@/components/ai/AIChat';
import { Header } from '@/components/layout/Header';
import { ShareDialog } from '@/components/share/ShareDialog';
import { getProject, getProjectCanvases } from '@/services/firestore';
import type { Project } from '@/types/project';

interface CanvasData {
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

export const ProjectView: React.FC = () => {
  const { projectId, canvasId } = useParams<{ projectId: string; canvasId?: string }>();
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVegaOpen, setIsVegaOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const loadCanvases = async () => {
    if (!projectId) return;

    try {
      const canvasesData = await getProjectCanvases(projectId);
      setCanvases(canvasesData);

      // If no canvas is specified but we have canvases, navigate to the first one
      if (!canvasId && canvasesData && canvasesData.length > 0) {
        navigate(`/p/${projectId}/${canvasesData[0].id}`, { replace: true });
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
      // This can be implemented later if needed
      // For now, we're using Firestore timestamps which update automatically
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  };

  useEffect(() => {
    loadCanvases();
    updateLastAccessed();

    // Load project data
    if (projectId) {
      getProject(projectId).then(projectData => {
        if (projectData) {
          setProject(projectData);
        }
      }).catch(error => {
        console.error('Error loading project:', error);
      });
    }
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Construct canvas path for Firestore
  const canvasPath = projectId && canvasId ? `projects/${projectId}/canvases/${canvasId}` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        projectName={project?.name}
        projectId={projectId}
        onShareClick={() => setShowShareDialog(true)}
      />
      <div style={{ display: 'flex', flex: 1, marginTop: '60px' }}>
        <CanvasSidebar
          projectId={projectId!}
          canvases={canvases}
          activeCanvasId={canvasId}
          onCanvasesChange={loadCanvases}
        />
        {canvasId && (
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <Canvas
              canvasPath={canvasPath}
              onAskVega={() => setIsVegaOpen(!isVegaOpen)}
              isVegaOpen={isVegaOpen}
            />
            <AIChat
              canvasPath={canvasPath}
              isOpen={isVegaOpen}
              onClose={() => setIsVegaOpen(false)}
            />
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

      {showShareDialog && projectId && project && (
        <ShareDialog
          projectId={projectId}
          projectName={project.name}
          canvasId={canvasId}
          canvasName={canvases.find(c => c.id === canvasId)?.name}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};
