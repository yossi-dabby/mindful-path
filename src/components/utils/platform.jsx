import { base44 } from '@/api/base44Client';

/**
 * Logs the user out and reloads to the login page.
 * Used after account deletion or explicit sign-out.
 */
export function performLogout() {
  base44.auth.logout();
}