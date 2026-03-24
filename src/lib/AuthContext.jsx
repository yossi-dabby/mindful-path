import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false); // No longer blocks render
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (retryCount = 0) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      if (retryCount === 0) {
        console.log('[bootstrap:auth] checkAuth — calling base44.auth.me()');
      }
      const currentUser = await base44.auth.me();
      console.log('[bootstrap:auth] auth.me() succeeded — userId:', currentUser?.id);
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      const status = error?.status || error?.response?.status;
      const reason = error?.data?.extra_data?.reason;

      // Log the first real failure clearly (retryCount === 0 for original attempt).
      if (retryCount === 0) {
        console.error(
          '[bootstrap:auth] auth.me() FAILED —',
          'status:', status ?? '(no status)',
          '| reason:', reason ?? error?.message ?? '(unknown)',
          '| retryCount:', retryCount
        );
      }

      // Check user_not_registered BEFORE the generic 401/403 guard.
      if (reason === 'user_not_registered') {
        console.warn('[bootstrap:auth] auth.me() → user_not_registered — not redirecting to login');
        setIsAuthenticated(false);
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
        setIsLoadingAuth(false);
        return;
      }

      // After OAuth (Google/social) redirect, the session cookie may not yet
      // be fully committed when checkAuth fires. Retry once after a short delay
      // before treating it as unauthenticated.
      if ((status === 401 || status === 403) && retryCount < 1) {
        console.log('[bootstrap:auth] auth.me() → 401/403 on first attempt — retrying once after 800ms');
        await new Promise(resolve => setTimeout(resolve, 800));
        return checkAuth(retryCount + 1);
      }

      setIsAuthenticated(false);

      if (status === 401 || status === 403) {
        const redirectTarget = window.location.pathname + window.location.search;
        console.warn('[bootstrap:auth] redirectToLogin triggered — reason: 401/403 after retry | target:', redirectTarget);
        base44.auth.redirectToLogin(redirectTarget);
        setIsLoadingAuth(false);
        return;
      }

      console.error('[bootstrap:auth] unhandled auth error — type: unknown | message:', error?.message);
      setAuthError({ type: 'unknown', message: error.message || 'Failed to load app' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname + window.location.search);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};