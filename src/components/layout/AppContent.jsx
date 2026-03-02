import React from 'react';
import { BOTTOM_NAV_HEIGHT } from './BottomNav';
import { SIDEBAR_WIDTH } from './Sidebar';
import MobileHeader, { MOBILE_HEADER_HEIGHT } from './MobileHeader';

/**
 * AppContent - Main content wrapper with proper spacing for navigation
 * 
 * CRITICAL LAYOUT RULES:
 * 1. This is the ONLY scrollable container in the app
 * 2. Mobile: padding-bottom matches BOTTOM_NAV_HEIGHT, padding-top for header
 * 3. Desktop: padding-left matches SIDEBAR_WIDTH
 * 4. Children should NOT have overflow or fixed heights
 * 5. Pull-to-refresh is handled by page-level PullToRefresh components
 */
export default function AppContent({ children }) {
  const mainRef = React.useRef(null);

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#app-scroll-container"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-md"
        style={{
          background: 'rgb(38, 166, 154)',
          color: '#fff'
        }}
      >
        Skip to main content
      </a>
      <MobileHeader />
      <main
        id="app-scroll-container"
        ref={mainRef}
        tabIndex="-1"
        className="overflow-y-auto overflow-x-hidden"
        style={{
          overscrollBehavior: 'none',
          height: '100dvh',
          // Mobile: padding for header + bottom nav + safe areas
          paddingTop: `calc(${MOBILE_HEADER_HEIGHT}px + env(safe-area-inset-top, 0))`,
          paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0))`,
          paddingLeft: '0',
          paddingRight: '0',
        }}
      >
      <style>{`
        @media (min-width: 768px) {
          #app-scroll-container {
            padding-left: ${SIDEBAR_WIDTH}px !important;
            padding-bottom: env(safe-area-inset-bottom, 0px) !important;
            padding-top: env(safe-area-inset-top, 0px) !important;
          }
        }
      `}</style>
      {children}
      </main>
    </>
  );
}