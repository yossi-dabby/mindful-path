import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false
});

// Prevent /api/apps/null/analytics/track/batch requests when appId is missing or falsy.
// cleanup() stops the heartbeat processor and the internal batch flush loop.
if (!appId) {
  if (import.meta.env.DEV) {
    console.warn('[base44] analytics suppressed: appId is not set');
  }
  if (base44.analytics) {
    base44.analytics.cleanup();
  }
  base44.analytics = { track: () => {}, cleanup: () => {} };
}
