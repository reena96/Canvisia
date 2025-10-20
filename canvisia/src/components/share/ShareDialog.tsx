import React, { useState, useEffect } from 'react';
import { X, Link2, Check, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import {
  getProjectCollaborators,
  inviteUserByEmail,
  updatePermissionRole,
  removeProjectCollaborator,
  getCanvasCollaborators,
  inviteUserToCanvas,
  updateCanvasPermissionRole,
  removeCanvasCollaborator,
  type CanvasPermission,
} from '@/services/firestore';
import type { Permission } from '@/types/project';
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
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviting, setInviting] = useState(false);
  const [collaborators, setCollaborators] = useState<(Permission & { userName?: string })[] | (CanvasPermission & { userName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine if we're sharing a canvas or a project
  const isCanvasShare = !!canvasId;
  const canvasPath = canvasId ? `projects/${projectId}/canvases/${canvasId}` : '';
  const shareUrl = isCanvasShare
    ? `${window.location.origin}/p/${projectId}/${canvasId}`
    : `${window.location.origin}/p/${projectId}`;
  const shareName = isCanvasShare ? canvasName || 'Canvas' : projectName;

  useEffect(() => {
    loadCollaborators();
  }, [projectId, canvasId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const collab = isCanvasShare
        ? await getCanvasCollaborators(canvasPath)
        : await getProjectCollaborators(projectId);
      setCollaborators(collab);
    } catch (error) {
      console.error('Error loading collaborators:', error);
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user) return;

    try {
      setInviting(true);
      // NOTE: In production, you would look up the userId by email
      // For now, we'll use a placeholder. This requires backend support.
      const tempUserId = `pending_${inviteEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

      if (isCanvasShare) {
        await inviteUserToCanvas(canvasPath, projectId, inviteEmail, tempUserId, inviteRole as 'editor' | 'viewer', user.uid);
      } else {
        await inviteUserByEmail(projectId, inviteEmail, tempUserId, inviteRole, user.uid);
      }

      setInviteEmail('');
      await loadCollaborators();
    } catch (error) {
      console.error('Error inviting user:', error);
      alert('Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'editor' | 'viewer') => {
    try {
      if (isCanvasShare) {
        await updateCanvasPermissionRole(canvasPath, userId, newRole);
      } else {
        await updatePermissionRole(projectId, userId, newRole);
      }
      await loadCollaborators();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    const confirmMessage = isCanvasShare
      ? 'Remove this collaborator from the canvas?'
      : 'Remove this collaborator from the project?';

    if (!confirm(confirmMessage)) return;

    try {
      if (isCanvasShare) {
        await removeCanvasCollaborator(canvasPath, userId);
      } else {
        await removeProjectCollaborator(projectId, userId);
      }
      await loadCollaborators();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      alert('Failed to remove collaborator');
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
          <div className="copy-link-section">
            <h3>
              <Link2 size={16} />
              Copy link
            </h3>
            <p className="copy-link-description">
              Anyone with this link can view this {isCanvasShare ? 'canvas' : 'project'}
            </p>
            <div className="copy-link-input-group">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="link-input"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                className={`copy-button ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
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

          <div className="divider" />

          {/* Invite users section */}
          <div className="invite-section">
            <h3>
              <UserPlus size={16} />
              Invite people
            </h3>
            <form onSubmit={handleInvite} className="invite-form">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="invite-email-input"
                disabled={inviting}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                className="role-select"
                disabled={inviting}
              >
                <option value="editor">Can edit</option>
                <option value="viewer">Can view</option>
              </select>
              <button
                type="submit"
                className="invite-button"
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </form>
          </div>

          {/* Collaborators list */}
          <div className="collaborators-section">
            <h3>People with access</h3>
            {loading ? (
              <p className="loading-text">Loading collaborators...</p>
            ) : (
              <div className="collaborators-list">
                {collaborators.map((collab) => (
                  <div key={collab.userId} className="collaborator-item">
                    <div className="collaborator-info">
                      <div className="collaborator-name">
                        {collab.userName || collab.userEmail}
                      </div>
                      <div className="collaborator-email">
                        {collab.userEmail}
                        {collab.role === 'owner' && ' (Owner)'}
                        {!collab.acceptedAt && ' (Pending)'}
                      </div>
                    </div>
                    {collab.role !== 'owner' && user?.uid !== collab.userId && (
                      <div className="collaborator-actions">
                        <select
                          value={collab.role}
                          onChange={(e) =>
                            handleRoleChange(collab.userId, e.target.value as 'editor' | 'viewer')
                          }
                          className="role-select-small"
                        >
                          <option value="editor">Can edit</option>
                          <option value="viewer">Can view</option>
                        </select>
                        <button
                          onClick={() => handleRemoveCollaborator(collab.userId)}
                          className="remove-button"
                          title="Remove access"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
