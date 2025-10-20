import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserProjects, createProject, updateProject, deleteProject } from '@/services/firestore';
import type { Project } from '@/types/project';
import { ShareDialog } from '@/components/share/ShareDialog';
import { Header } from '@/components/layout/Header';
import './ProjectsPage.css';

type TabType = 'recent' | 'shared' | 'owned';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [creatingProject, setCreatingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sharingProjectId, setSharingProjectId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[ProjectsPage] User changed:', user);
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    console.log('[ProjectsPage] Create project clicked, user:', user);

    if (!user || creatingProject) {
      console.log('[ProjectsPage] Blocked: user is null or already creating');
      return;
    }

    try {
      setCreatingProject(true);
      console.log('[ProjectsPage] Creating project for user:', user.uid);
      const newProjectId = await createProject(
        user.uid,
        `Untitled Project ${projects.length + 1}`,
        user.email || ''
      );
      console.log('[ProjectsPage] Project created:', newProjectId);

      // Reload projects to show the new one
      await loadProjects();

      // Automatically start renaming the new project
      setEditingProjectId(newProjectId);
      setEditingName(`Untitled Project ${projects.length + 1}`);
    } catch (error) {
      console.error('[ProjectsPage] Error creating project:', error);
      alert('Failed to create project. Check console for details.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/p/${projectId}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('[ProjectsPage] Error signing out:', error);
    }
  };

  const handleStartRename = (projectId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(projectId);
    setEditingName(currentName);
  };

  const handleCancelRename = () => {
    setEditingProjectId(null);
    setEditingName('');
  };

  const handleSaveRename = async (projectId: string) => {
    if (!editingName.trim()) {
      handleCancelRename();
      return;
    }

    try {
      await updateProject(projectId, { name: editingName.trim() });
      await loadProjects();
      setEditingProjectId(null);
      setEditingName('');
    } catch (error) {
      console.error('[ProjectsPage] Error renaming project:', error);
      alert('Failed to rename project');
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(projectId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleShare = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSharingProjectId(projectId);
  };

  const handleDelete = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      console.error('[ProjectsPage] Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const getFilteredProjects = () => {
    if (!user) return [];

    switch (activeTab) {
      case 'recent':
        // Show ALL projects (owned + shared) sorted by lastAccessed
        return [...projects].sort((a, b) =>
          (b.lastAccessed?.getTime() || b.lastModified.getTime()) - (a.lastAccessed?.getTime() || a.lastModified.getTime())
        );
      case 'shared':
        return projects.filter(p =>
          p.ownerId !== user.uid
        );
      case 'owned':
        return projects.filter(p => p.ownerId === user.uid);
      default:
        return projects;
    }
  };

  const formatTimestamp = (timestamp: any): string => {
    const date = timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-state">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <Header onSignOut={handleSignOut} />

      <div style={{ marginTop: '80px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#1F2937' }}>Projects</h1>
          <button
            className="new-project-btn"
            onClick={handleCreateProject}
            disabled={creatingProject}
          >
            {creatingProject ? 'Creating...' : 'New Project'}
          </button>
        </div>

        <div className="projects-tabs">
          <button
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recently viewed
          </button>
          <button
            className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            Shared with me
          </button>
          <button
            className={`tab ${activeTab === 'owned' ? 'active' : ''}`}
            onClick={() => setActiveTab('owned')}
          >
            Owned by me
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>No projects yet</h2>
              <p>Create your first project to get started</p>
              <button
                className="create-first-project-btn"
                onClick={handleCreateProject}
                disabled={creatingProject}
              >
                {creatingProject ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => editingProjectId !== project.id && handleOpenProject(project.id)}
              >
                <div className="project-thumbnail">
                  <div className="thumbnail-placeholder">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="4" fill="#E5E7EB"/>
                      <path d="M20 12L28 28H12L20 12Z" fill="#9CA3AF"/>
                    </svg>
                  </div>
                </div>
                <div className="project-info">
                  {editingProjectId === project.id ? (
                    <input
                      type="text"
                      className="project-name-input"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSaveRename(project.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, project.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="project-name-row">
                      <h3 className="project-name">{project.name}</h3>
                      <div className="project-actions">
                        <button
                          className="share-project-btn"
                          onClick={(e) => handleShare(project.id, e)}
                          title="Share project"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          className="rename-project-btn"
                          onClick={(e) => handleStartRename(project.id, project.name, e)}
                          title="Rename project"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="delete-project-btn"
                          onClick={(e) => handleDelete(project.id, project.name, e)}
                          title="Delete project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="project-modified">
                    Modified {formatTimestamp(project.lastModified)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharingProjectId && (
        <ShareDialog
          projectId={sharingProjectId}
          projectName={projects.find(p => p.id === sharingProjectId)?.name || ''}
          onClose={() => setSharingProjectId(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
