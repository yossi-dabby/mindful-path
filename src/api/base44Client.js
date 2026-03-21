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

// Guard: if appId is missing, suppress analytics to prevent /api/apps/null/... requests
if (!appId && base44.analytics) {
  if (import.meta.env.DEV) {
    console.warn('[base44] analytics.track suppressed: appId is not set');
  }
  base44.analytics.track = () => {};
}
