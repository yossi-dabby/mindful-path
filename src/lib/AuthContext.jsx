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

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      const status = error?.status || error?.response?.status;

      // Check user_not_registered BEFORE the generic 401/403 guard.
      // The Base44 server returns 403 for both "unauthenticated" and
      // "user_not_registered" responses.  If we check the HTTP status first,
      // a user_not_registered 403 incorrectly triggers redirectToLogin, putting
      // new users (especially Google/OAuth registrants) into an infinite redirect
      // loop instead of showing the proper "Access Restricted" error page.
      if (error?.data?.extra_data?.reason === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
        return;
      }

      if (status === 401 || status === 403) {
        // Not logged in — redirect to Base44 login.
        // Pass only the pathname+search (not the full href) so the Base44 SDK
        // can resolve the correct registered domain for the OAuth callback.
        // Passing the full URL (including an unregistered deployment domain)
        // causes Base44 to reject the callback with "Invalid redirect domain" (403).
        base44.auth.redirectToLogin(window.location.pathname + window.location.search);
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