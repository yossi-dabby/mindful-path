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
    <div
      className="relative"
      style={{
        // Root container uses min-height to allow natural expansion
        minHeight: '100dvh',
        // Desktop: make room for sidebar
        paddingLeft: '0',
        // Mobile: make room for bottom nav
        paddingBottom: `${BOTTOM_NAV_HEIGHT}px`,
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .app-content-root {
            padding-left: ${SIDEBAR_WIDTH}px;
            padding-bottom: 0;
          }
        }
      `}</style>
      <div 
        className="app-content-root overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          // Single scroll container
          minHeight: '100dvh',
          paddingBottom: `${BOTTOM_NAV_HEIGHT}px`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              // Content should flow naturally, not use fixed heights
              minHeight: 'auto',
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}