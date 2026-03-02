import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';

// Auth token keys used by the base44 SDK
const AUTH_TOKEN_KEYS = ['base44_access_token', 'token'];

/**
 * Detects whether the app is running on a native platform (Android/iOS).
 * @returns {boolean}
 */
export function isNativePlatform() {
  return Capacitor.isNativePlatform();
}

/**
 * Performs logout in a way that works on both web and native (Android/iOS).
 *
 * On web: delegates to base44.auth.logout() which clears tokens and redirects
 * to the server-side logout endpoint for proper session cleanup.
 *
 * On native (Android/iOS): the server-redirect approach used by base44.auth.logout()
 * doesn't work inside a Capacitor webview because the redirect URL points to an
 * external server. Instead, we clear the auth tokens from localStorage and perform
 * a full page reload to `/` so that appParams and the SDK re-initialize without a
 * token, causing the auth check to redirect the user to the login screen.
 */
export function performLogout() {
  if (isNativePlatform()) {
    try {
      AUTH_TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Failed to clear auth tokens:', e);
    }
    // A full page reload (not React Router navigation) is required here so that
    // the module-level appParams and the SDK's axios headers are re-initialized
    // without a token, ensuring a clean unauthenticated app startup.
    window.location.href = '/';
  } else {
    base44.auth.logout();
  }
}
