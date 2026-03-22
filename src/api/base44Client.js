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

// When appId is absent the SDK would build /api/apps/null/analytics/track/batch
// which returns 405. Suppress all analytics tracking until a real appId is present.
if (!appId) {
  base44.analytics = { track: () => {} };
}
