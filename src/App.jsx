import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from 'next-themes';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// z-index for the auth loading overlay — must sit above all other layers
// (BottomNav: 35, MobileHeader: 40, DraggableAiCompanion: 40, pull-to-refresh: 50)
const AUTH_OVERLAY_Z_INDEX = 9999;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Handle authentication errors (checked after loading completes)
  if (!isLoadingPublicSettings && !isLoadingAuth && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Always render the main app routes so that the Layout shell (including
  // #app-scroll-container and navigation buttons) is present in the DOM from
  // the very first render.  This ensures E2E tests that query for buttons or
  // the scroll container work correctly even before auth finishes loading.
  // During the auth check a full-screen overlay is shown on top of the routes.
  return (
    <>
      {/* Loading overlay — shown while auth / public-settings are being fetched.
          pointer-events: none lets underlying DOM elements still receive events
          (needed for touch-event E2E tests), while the backdrop visually hides
          the partially-loaded content from the user.
          aria-hidden keeps screen readers focused on the overlay message only. */}
      {(isLoadingPublicSettings || isLoadingAuth) && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading application"
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: AUTH_OVERLAY_Z_INDEX, background: 'rgb(var(--bg, 248 248 246))', pointerEvents: 'none' }}
        >
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" aria-hidden="true" />
        </div>
      )}
      <Routes>
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
