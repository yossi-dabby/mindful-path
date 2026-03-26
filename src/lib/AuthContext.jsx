import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { checkAndArmRedirectGuard } from '@/lib/authRedirectGuard';

const AuthContext = createContext();

// Wraps base44.auth.redirectToLogin with a loop guard that prevents the
// "auth-fail → redirect → auth-fail" infinite cycle. See authRedirectGuard.js.
function safeRedirectToLogin(nextUrl) {
  if (!checkAndArmRedirectGuard()) {
    return false;
  }
  base44.auth.redirectToLogin(nextUrl);
  return true;
}

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
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      const status = error?.status || error?.response?.status;

      // Check user_not_registered BEFORE the generic 401/403 guard.
      if (error?.data?.extra_data?.reason === 'user_not_registered') {
        setIsAuthenticated(false);
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
        setIsLoadingAuth(false);
        return;
      }

      // After OAuth (Google/social) redirect, the session cookie may not yet
      // be fully committed when checkAuth fires. Retry once after a short delay
      // before treating it as unauthenticated.
      if ((status === 401 || status === 403) && retryCount < 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return checkAuth(retryCount + 1);
      }

      setIsAuthenticated(false);

      if (status === 401 || status === 403) {
        const redirectAllowed = safeRedirectToLogin(window.location.href);
        if (!redirectAllowed) {
          console.warn('[AuthContext] Redirect to login suppressed by cooldown guard (loop prevention).');
        }
        setIsLoadingAuth(false);
        return;
      }

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
    safeRedirectToLogin(window.location.href);
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