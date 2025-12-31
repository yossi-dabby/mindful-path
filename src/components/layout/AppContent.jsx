import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOTTOM_NAV_HEIGHT } from './BottomNav';
import { SIDEBAR_WIDTH } from './Sidebar';

/**
 * AppContent - Main content wrapper with proper spacing for navigation
 * 
 * CRITICAL LAYOUT RULES:
 * 1. This is the ONLY scrollable container in the app
 * 2. Mobile: padding-bottom matches BOTTOM_NAV_HEIGHT
 * 3. Desktop: padding-left matches SIDEBAR_WIDTH
 * 4. Children should NOT have overflow or fixed heights
 */
export default function AppContent({ children, currentPageName }) {
  return (
    <main
      className="overflow-y-auto overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        minHeight: '100dvh',
        // Mobile: padding for bottom nav + safe area
        paddingTop: 'env(safe-area-inset-top, 0)',
        paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0))`,
        paddingLeft: '0',
        paddingRight: '0',
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          main {
            padding-left: ${SIDEBAR_WIDTH}px !important;
            padding-bottom: env(safe-area-inset-bottom, 0) !important;
          }
        }
      `}</style>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPageName}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}