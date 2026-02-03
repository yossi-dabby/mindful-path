import React from 'react';

/**
 * Shared styling shell for all Mind Games modals
 * Ensures consistent mint/teal theme across all mini-games
 * Handles mobile-safe sizing and scrolling automatically
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