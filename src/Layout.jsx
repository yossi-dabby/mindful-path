import React from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DraggableAiCompanion from './components/ai/DraggableAiCompanion';
import BottomNav from './components/layout/BottomNav';
import Sidebar from './components/layout/Sidebar';
import AppContent from './components/layout/AppContent';
import ScrollPreservation from './components/layout/ScrollPreservation';
import { TabNavigationProvider } from './components/layout/TabNavigationProvider';
import './components/i18n/i18nConfig';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [theme, setTheme] = React.useState('default');
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  // Page transition variants for iOS-style navigation
  const pageVariants = {
    initial: {
      x: '100%',
      opacity: 0
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        ease: [0.4, 0.0, 0.2, 1],
        duration: 0.3
      }
    },
    exit: {
      x: '-30%',
      opacity: 0,
      transition: {
        type: 'tween',
        ease: [0.4, 0.0, 0.2, 1],
        duration: 0.3
      }
    }
  };

  // Detect system dark mode preference and update theme-color meta tag only.
  // The dark class on <html> is managed by ThemeProvider (next-themes).
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateThemeColor = (isDark) => {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#0c121c' : '#f8f8f6');
      }
    };

    const handleChange = (e) => {
      updateThemeColor(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    updateThemeColor(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track whether we pushed a sentinel history entry for an open overlay.
  // Using a sentinel push/pop pattern avoids calling history.go(1) from inside
  // a popstate handler, which causes iOS WKWebView "Unified Navigation" warnings.
  const overlayHistoryPushed = React.useRef(false);
  // Record history.length at the time we push so we can verify the sentinel is
  // still at the top of the stack when the overlay closes programmatically.
  const overlayHistoryLength = React.useRef(0);

  // Observe overlay open/close via MutationObserver and manage the sentinel entry.
  React.useEffect(() => {
    const OVERLAY_SELECTOR =
      '[role="dialog"][data-state="open"], [data-vaul-drawer-overlay][data-state="open"]';

    const handleMutation = () => {
      const hasOpenOverlay = !!document.querySelector(OVERLAY_SELECTOR);

      if (hasOpenOverlay && !overlayHistoryPushed.current) {
        // Overlay just opened: push a sentinel entry so back gesture closes the overlay
        // instead of navigating away from the page.
        overlayHistoryLength.current = window.history.length;
        window.history.pushState({ overlayOpen: true }, '');
        overlayHistoryPushed.current = true;
      } else if (!hasOpenOverlay && overlayHistoryPushed.current) {
        // Overlay closed programmatically (X button, backdrop click, ESC key, etc.)
        // without the user pressing the hardware/gesture back button.
        overlayHistoryPushed.current = false;
        // Only go back if the sentinel is still the current entry — i.e. no other
        // navigation happened while the overlay was open.
        if (
          window.history.state?.overlayOpen &&
          window.history.length === overlayHistoryLength.current + 1
        ) {
          window.history.back();
        }
      }
    };

    // Debounce via requestAnimationFrame: Radix UI toggles data-state on multiple
    // elements during open/close animations; batching to one frame avoids redundant
    // selector queries and history mutations.
    let rafId = null;
    const debouncedMutation = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleMutation);
    };

    const observer = new MutationObserver(debouncedMutation);
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state']
    });
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Handle back navigation: close any open overlay instead of navigating away.
  // The history.back() / swipe-back already moved history back, so we only need
  // to close the overlay UI — no history.go(1) required.
  React.useEffect(() => {
    const OVERLAY_SELECTOR =
      '[role="dialog"][data-state="open"], [data-vaul-drawer-overlay][data-state="open"]';

    const handlePopState = () => {
      const hasOpenOverlay = !!document.querySelector(OVERLAY_SELECTOR);

      if (hasOpenOverlay) {
        overlayHistoryPushed.current = false;
        // Close the open overlay via ESC (works for Radix Dialog, Sheet, and Vaul Drawer).
        // Only `key` and `code` are used; deprecated `keyCode`/`which` are omitted.
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(escEvent);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    // Load user theme preference
    base44.auth.me().then((user) => {
      const userTheme = user?.preferences?.theme || 'default';
      setTheme(userTheme);
      
      // Apply theme colors
      const themeColors = {
        default: { primary: '139 178 158', secondary: '185 163 193', accent: '244 146 131' },
        ocean: { primary: '14 165 233', secondary: '6 182 212', accent: '20 184 166' },
        sunset: { primary: '249 115 22', secondary: '236 72 153', accent: '251 146 60' },
        forest: { primary: '16 185 129', secondary: '34 197 94', accent: '132 204 22' },
        lavender: { primary: '168 85 247', secondary: '139 92 246', accent: '217 70 239' },
        minimal: { primary: '71 85 105', secondary: '100 116 139', accent: '51 65 85' }
      };
      
      const colors = themeColors[userTheme] || themeColors.default;
      document.documentElement.style.setProperty('--color-primary', colors.primary);
      document.documentElement.style.setProperty('--color-secondary', colors.secondary);
      document.documentElement.style.setProperty('--color-accent', colors.accent);
    }).catch(() => {
      // User not logged in, use default theme
    });
    }, []);

    // Detect offline/online status
    React.useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
    };
    }, []);

    const themeBackgrounds = {
    default: 'bg-warm-gradient',
    ocean: 'bg-calm-gradient',
    sunset: 'bg-warm-gradient',
    forest: 'bg-theme-forest',
    lavender: 'bg-theme-lavender',
    minimal: 'bg-theme-minimal'
  };

  return (
    <TabNavigationProvider currentPageName={currentPageName}>
      <div className={`min-h-screen overflow-hidden ${themeBackgrounds[theme] || themeBackgrounds.default}`}>
        {/* Preserve scroll position between tab switches */}
        <ScrollPreservation />

        {/* Offline Banner - Global */}
        {isOffline && (
          <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg" style={{ zIndex: 100 }}>
            You're offline. Check your connection.
          </div>
        )}

        {/* AI Companion Widget - Draggable across all pages */}
        <DraggableAiCompanion />
      
      {/* Sidebar - Desktop only */}
      <Sidebar currentPageName={currentPageName} />
      
      {/* Main Content - Single scroll container with page transitions */}
      <AppContent>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </AppContent>
      
        {/* Bottom Navigation - Mobile only */}
        <BottomNav currentPageName={currentPageName} />
      </div>
    </TabNavigationProvider>
  );
}