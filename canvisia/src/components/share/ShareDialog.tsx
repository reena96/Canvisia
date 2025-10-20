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
  const [linkEnabled, setLinkEnabled] = useState(false);
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
      setLinkEnabled(level === 'editor');
    } catch (error) {
      console.error('Error loading access level:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      // Enable link sharing if not already enabled
      if (!linkEnabled) {
        setUpdating(true);
        await setProjectAccessLevel(projectId, 'editor');
        setLinkEnabled(true);
        setUpdating(false);
      }

      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link');
      setUpdating(false);
    }
  };

  const handleToggleLinkSharing = async () => {
    try {
      setUpdating(true);
      if (linkEnabled) {
        // Disable link sharing
        await setProjectAccessLevel(projectId, null);
        setLinkEnabled(false);
      } else {
        // Enable link sharing as editor
        await setProjectAccessLevel(projectId, 'editor');
        setLinkEnabled(true);
      }
    } catch (error) {
      console.error('Error toggling link sharing:', error);
      alert('Failed to update link sharing');
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
          {/* Link Sharing Status */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                Link sharing
              </label>
              <button
                onClick={handleToggleLinkSharing}
                disabled={updating || loading}
                style={{
                  padding: '0.375rem 0.875rem',
                  border: linkEnabled ? '1px solid #DC2626' : '1px solid #10B981',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: linkEnabled ? '#DC2626' : '#10B981',
                  backgroundColor: 'white',
                  cursor: updating || loading ? 'not-allowed' : 'pointer',
                  opacity: updating || loading ? 0.6 : 1,
                }}
              >
                {linkEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
              {linkEnabled
                ? 'Anyone with the link can edit this project'
                : 'Link sharing is currently disabled'}
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
