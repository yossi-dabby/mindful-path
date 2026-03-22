import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

// Module-level guard: prevents calling redirectToLogin more than once per
// page-load cycle. Even if checkAuth is invoked again (e.g. by StrictMode or
// a consumer calling checkAppState), only one redirect attempt will fire.
// The flag is reset automatically when the page reloads after a successful
// login redirect, ensuring future logins work correctly.
let _loginRedirectAttempted = false;

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
      // Successfully authenticated — reset the redirect guard so future
      // logout→login cycles work correctly without a page reload.
      _loginRedirectAttempted = false;
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      const status = error?.status || error?.response?.status;

      if (status === 401 || status === 403) {
        // Not logged in — redirect to Base44 login (guard prevents loop)
        if (!_loginRedirectAttempted) {
          _loginRedirectAttempted = true;
          base44.auth.redirectToLogin(window.location.href);
        }
        return;
      }

      if (error?.data?.extra_data?.reason === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      } else {
        setAuthError({ type: 'unknown', message: error.message || 'Failed to load app' });
      }
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
    base44.auth.redirectToLogin(window.location.href);
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