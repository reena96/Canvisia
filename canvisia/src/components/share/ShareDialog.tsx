import React, { useState } from 'react';
import { X, Link2, Check } from 'lucide-react';
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

  const shareUrl = `${window.location.origin}/p/${projectId}`;

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
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Anyone with this link can view and edit the project
          </p>

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
