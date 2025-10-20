import React, { useState, useEffect } from 'react';
import { X, Link2, Check } from 'lucide-react';
import {
  setProjectAccessLevel,
  getProjectAccessLevel,
} from '@/services/firestore';
import './ShareDialog.css';

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  projectId,
  projectName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'viewer' | 'editor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const shareUrl = `${window.location.origin}/p/${projectId}`;

  useEffect(() => {
    loadAccessLevel();
  }, [projectId]);

  const loadAccessLevel = async () => {
    try {
      setLoading(true);
      const level = await getProjectAccessLevel(projectId);
      setAccessLevel(level);
    } catch (error) {
      console.error('Error loading access level:', error);
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

  const handleAccessLevelChange = async (newLevel: 'viewer' | 'editor') => {
    try {
      setUpdating(true);
      await setProjectAccessLevel(projectId, newLevel);
      setAccessLevel(newLevel);
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
          <h2>Share "{projectName}"</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="share-dialog-content">
          {/* Access Level Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
              Anyone with the link can:
            </label>
            <select
              value={accessLevel || 'viewer'}
              onChange={(e) => handleAccessLevelChange(e.target.value as 'viewer' | 'editor')}
              disabled={updating || loading}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#374151',
                backgroundColor: 'white',
                cursor: updating || loading ? 'not-allowed' : 'pointer',
                opacity: updating || loading ? 0.6 : 1,
              }}
            >
              <option value="viewer">View (read-only)</option>
              <option value="editor">Edit (full access)</option>
            </select>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
              {accessLevel === 'editor'
                ? 'Link users can create, edit, and delete shapes'
                : 'Link users can only view, cannot make changes'}
            </p>
          </div>

          {/* Copy Link Section */}
          <div className="copy-link-section">
            <h3>
              <Link2 size={16} />
              Project link
            </h3>
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
        </div>
      </div>
    </div>
  );
};
