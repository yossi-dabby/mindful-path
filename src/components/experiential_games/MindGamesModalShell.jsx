import React from 'react';

/**
 * Shared styling shell for all Mind Games modals
 * Ensures consistent mint/teal theme across all mini-games
 */
export default function MindGamesModalShell({ children, title }) {
  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1A3A34' }}>
          {title}
        </h2>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Shared overlay styling (for Dialog component)
 * Apply to DialogContent via className
 */
export const mindGamesOverlayClass = `
  data-[state=open]:bg-[rgba(180,220,210,0.85)]
  backdrop-blur-sm
`;

/**
 * Shared modal content styling
 * Apply to DialogContent via style prop
 */
export const mindGamesModalStyle = {
  borderRadius: '24px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(232, 246, 243, 0.95) 100%)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 16px 48px rgba(38, 166, 154, 0.15), 0 6px 20px rgba(0,0,0,0.05)',
  border: '1px solid rgba(38, 166, 154, 0.2)',
  maxHeight: '90vh',
  overflowY: 'auto'
};