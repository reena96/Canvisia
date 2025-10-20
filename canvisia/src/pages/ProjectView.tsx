import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '../components/canvas/Canvas';
import { CanvasSidebar } from '../components/canvas/CanvasSidebar';
import { AIChat } from '@/components/ai/AIChat';
import { Header } from '@/components/layout/Header';
import { ShareDialog } from '@/components/share/ShareDialog';
import { useAuth } from '@/components/auth/AuthProvider';
import { getProject, subscribeToProjectCanvases } from '@/services/firestore';
import type { Project } from '@/types/project';
import type { Presence } from '@/types/user';

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
  const { user } = useAuth();
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVegaOpen, setIsVegaOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Presence[]>([]);
  const [canvasCleanup, setCanvasCleanup] = useState<(() => Promise<void>) | null>(null);

  const loadCanvases = async () => {
    // This function is now only used for the onCanvasesChange callback
    // The actual real-time subscription is set up in useEffect
  };

  useEffect(() => {
    if (!projectId || !user) {
      console.log('[ProjectView] Missing projectId or user', { projectId, user: user?.uid });
      return;
    }

    console.log('[ProjectView] Initializing project view', { projectId, userId: user.uid, userEmail: user.email });

    // Load project data
    getProject(projectId).then(projectData => {
      if (projectData) {
        setProject(projectData);
      }
    }).catch(error => {
      console.error('[ProjectView] Error loading project:', error);
    });

    // Set up real-time subscription to canvases
    setLoading(true);
    const unsubscribe = subscribeToProjectCanvases(projectId, (canvasesData) => {
      setCanvases(canvasesData);
      setLoading(false);

      // If no canvas is specified but we have canvases, navigate to the first one
      if (!canvasId && canvasesData && canvasesData.length > 0) {
        navigate(`/p/${projectId}/${canvasesData[0].id}`, { replace: true });
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [projectId, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Construct canvas path for Firestore
  const canvasPath = projectId && canvasId ? `projects/${projectId}/canvases/${canvasId}` : '';

  // Handle cleanup before sign out
  const handleSignOut = async () => {
    console.log('[ProjectView] Sign out requested - running cleanup')
    if (canvasCleanup) {
      try {
        await canvasCleanup()
        console.log('[ProjectView] Canvas cleanup completed successfully')
      } catch (error) {
        console.error('[ProjectView] Canvas cleanup failed:', error)
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        projectName={project?.name}
        projectId={projectId}
        onShareClick={() => setShowShareDialog(true)}
        activeUsers={activeUsers}
        onSignOut={handleSignOut}
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
              onPresenceChange={setActiveUsers}
              onMountCleanup={setCanvasCleanup}
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
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};
