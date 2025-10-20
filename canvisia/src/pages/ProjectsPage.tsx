import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserProjects, createProject } from '@/services/firestore';
import type { Project } from '@/types/project';
import './ProjectsPage.css';

type TabType = 'recent' | 'shared' | 'owned';

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('recent');
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
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
    if (!user || creatingProject) return;

    try {
      setCreatingProject(true);
      const newProject = await createProject(
        user.uid,
        `Untitled Project ${projects.length + 1}`
      );
      navigate(`/p/${newProject}`);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/p/${projectId}`);
  };

  const getFilteredProjects = () => {
    if (!user) return [];

    switch (activeTab) {
      case 'recent':
        return [...projects].sort((a, b) =>
          b.lastModified.getTime() - a.lastModified.getTime()
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
      <header className="projects-header">
        <h1>Projects</h1>
        <button
          className="new-project-btn"
          onClick={handleCreateProject}
          disabled={creatingProject}
        >
          {creatingProject ? 'Creating...' : 'New Project'}
        </button>
      </header>

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
              onClick={() => handleOpenProject(project.id)}
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
                <h3 className="project-name">{project.name}</h3>
                <p className="project-modified">
                  Modified {formatTimestamp(project.lastModified)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
