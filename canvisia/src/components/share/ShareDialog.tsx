import React, { useState, useEffect } from 'react';
import { X, Link2, Check, Globe, Lock } from 'lucide-react';
import {
  setProjectPublicAccess,
  setCanvasPublicAccess,
  isProjectPublic,
  isCanvasPublic,
  getProjectPublicAccessLevel,
  getCanvasPublicAccessLevel,
} from '@/services/firestore';
import './ShareDialog.css';

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  canvasId?: string; // Optional: if provided, share canvas instead of project
  canvasName?: string; // Optional: canvas name for display
  onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  projectId,
  projectName,
  canvasId,
  canvasName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'viewer' | 'editor'>('viewer');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Determine if we're sharing a canvas or a project
  const isCanvasShare = !!canvasId;
  const shareUrl = isCanvasShare
    ? `${window.location.origin}/p/${projectId}/${canvasId}`
    : `${window.location.origin}/p/${projectId}`;
  const shareName = isCanvasShare ? canvasName || 'Canvas' : projectName;

  useEffect(() => {
    loadPublicStatus();
  }, [projectId, canvasId]);

  const loadPublicStatus = async () => {
    try {
      setLoading(true);
      const publicStatus = isCanvasShare
        ? await isCanvasPublic(projectId, canvasId!)
        : await isProjectPublic(projectId);
      setIsPublic(publicStatus);

      // Load access level if public
      if (publicStatus) {
        const level = isCanvasShare
          ? await getCanvasPublicAccessLevel(projectId, canvasId!)
          : await getProjectPublicAccessLevel(projectId);
        setAccessLevel(level || 'viewer');
      }
    } catch (error) {
      console.error('Error loading public status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
    }
  };

  const handleTogglePublic = async () => {
    try {
      setUpdating(true);
      const newPublicStatus = !isPublic;

      if (isCanvasShare) {
        await setCanvasPublicAccess(projectId, canvasId!, newPublicStatus, accessLevel);
      } else {
        await setProjectPublicAccess(projectId, newPublicStatus, accessLevel);
      }

      setIsPublic(newPublicStatus);
    } catch (error) {
      console.error('Error updating public access:', error);
      alert('Failed to update sharing settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleAccessLevelChange = async (newLevel: 'viewer' | 'editor') => {
    try {
      setUpdating(true);
      setAccessLevel(newLevel);

      // Update access level if already public
      if (isPublic) {
        if (isCanvasShare) {
          await setCanvasPublicAccess(projectId, canvasId!, true, newLevel);
        } else {
          await setProjectPublicAccess(projectId, true, newLevel);
        }
      }
    } catch (error) {
      console.error('Error updating access level:', error);
      alert('Failed to update access level');
    } finally {
      setUpdating(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="share-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="share-dialog">
        <div className="share-dialog-header">
          <h2>Share "{shareName}"</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="share-dialog-content">
          {/* Public Access Toggle */}
          <div className="public-access-section">
            <div className="public-access-header">
              {isPublic ? <Globe size={20} /> : <Lock size={20} />}
              <div>
                <h3 style={{ margin: 0 }}>
                  {isPublic ? 'Public access enabled' : 'Private'}
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  {isPublic
                    ? `Anyone with the link can ${accessLevel === 'editor' ? 'edit' : 'view'} this ${isCanvasShare ? 'canvas' : 'project'}`
                    : `Only you can access this ${isCanvasShare ? 'canvas' : 'project'}`}
                </p>
              </div>
            </div>
            <button
              className="toggle-button"
              onClick={handleTogglePublic}
              disabled={updating || loading}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: updating || loading ? 'not-allowed' : 'pointer',
                backgroundColor: isPublic ? '#EF4444' : '#8B5CF6',
                color: 'white',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'background-color 0.2s',
                opacity: updating || loading ? 0.6 : 1,
              }}
            >
              {updating ? 'Updating...' : isPublic ? 'Make Private' : 'Make Public'}
            </button>
          </div>

          {/* Access Level Selector - Only show when public */}
          {isPublic && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Public access level
              </label>
              <select
                value={accessLevel}
                onChange={(e) => handleAccessLevelChange(e.target.value as 'viewer' | 'editor')}
                disabled={updating}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  opacity: updating ? 0.6 : 1,
                }}
              >
                <option value="viewer">Can view (read-only)</option>
                <option value="editor">Can edit (full access)</option>
              </select>
            </div>
          )}

          <div className="divider" />

          {/* Copy Link Section */}
          <div className="copy-link-section">
            <h3>
              <Link2 size={16} />
              Share link
            </h3>
            <p className="copy-link-description">
              {isPublic
                ? `Anyone with this link can access this ${isCanvasShare ? 'canvas' : 'project'}`
                : `Enable public access to share this ${isCanvasShare ? 'canvas' : 'project'} with others`}
            </p>
            <div className="copy-link-input-group">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="link-input"
                onClick={(e) => e.currentTarget.select()}
                disabled={!isPublic}
                style={{
                  opacity: isPublic ? 1 : 0.5,
                  cursor: isPublic ? 'text' : 'not-allowed',
                }}
              />
              <button
                className={`copy-button ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
                disabled={!isPublic}
                style={{
                  opacity: isPublic ? 1 : 0.5,
                  cursor: isPublic ? 'pointer' : 'not-allowed',
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
