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
// The SDK auto-queues heartbeat/initialization events; clean those up too.
if (!appId) {
  base44.analytics.cleanup();
  base44.analytics = { track: () => {}, cleanup: () => {} };
  if (typeof window !== 'undefined' && window.base44SharedInstances?.analytics?.instance) {
    window.base44SharedInstances.analytics.instance.requestsQueue = [];
    window.base44SharedInstances.analytics.instance.isProcessing = false;
  }
}
