import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { BOTTOM_NAV_HEIGHT } from './BottomNav';
import { SIDEBAR_WIDTH } from './Sidebar';
import MobileHeader from './MobileHeader';

const MOBILE_HEADER_HEIGHT = 60; // Height of mobile header in px

/**
 * AppContent - Main content wrapper with proper spacing for navigation
 * 
 * CRITICAL LAYOUT RULES:
 * 1. This is the ONLY scrollable container in the app
 * 2. Mobile: padding-bottom matches BOTTOM_NAV_HEIGHT, padding-top for header
 * 3. Desktop: padding-left matches SIDEBAR_WIDTH
 * 4. Children should NOT have overflow or fixed heights
 */
export default function AppContent({ children, currentPageName }) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const touchStartY = React.useRef(0);
  const mainRef = React.useRef(null);

  const handleTouchStart = (e) => {
    if (mainRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (mainRef.current?.scrollTop === 0) {
      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY.current;
      
      if (distance > 0 && distance < 120) {
        setIsPulling(true);
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      window.location.reload();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <>
      <MobileHeader />
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/90 dark:bg-black/90 transition-all"
          style={{ 
            height: `${pullDistance}px`,
            opacity: pullDistance / 80
          }}
        >
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        </div>
      )}
      <main
        ref={mainRef}
        className="overflow-y-auto overflow-x-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'none',
          minHeight: '100dvh',
          // Mobile: padding for header + bottom nav + safe areas
          paddingTop: `calc(${MOBILE_HEADER_HEIGHT}px + env(safe-area-inset-top, 0))`,
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
            padding-top: env(safe-area-inset-top, 0) !important;
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
    </>
  );
}