import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { normalizeEntityList } from '@/lib/entityListNormalizer';

const { appId, token, functionsVersion } = appParams;

// Base URL is configurable via VITE_BASE44_APP_BASE_URL.
// Falls back to the current origin so that auth.redirectToLogin() always
// redirects to THIS app's /login page (e.g. https://share--...base44.app/login)
// rather than the platform root (https://base44.app/login) which returns 404.
const APP_BASE_URL = import.meta.env.VITE_BASE44_APP_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://base44.app');

//Create a client with authentication required
export const base44 = createClient({
  appId: appId || undefined,
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl: APP_BASE_URL,
});

// Prevent /api/apps/null/analytics/track/batch requests when appId is missing or falsy.
// cleanup() stops the heartbeat processor and the internal batch flush loop.
if (!appId) {
  base44.analytics.cleanup();
  base44.analytics = { track: () => {}, cleanup: () => {} };
}

// ---------------------------------------------------------------------------
// Override base44.auth.updateMe to use the entity SDK instead of raw fetch.
//
// The Base44 SDK's updateMe convenience method sends a request that returns
// 405 in this deployment. Using entities.User.update() with the current
// user's ID is functionally equivalent and uses the SDK's own auth session.
// ---------------------------------------------------------------------------
if (appId) {
  base44.auth.updateMe = async (data) => {
    const me = await base44.auth.me();
    return base44.entities.User.update(me.id, data);
  };
}

// ---------------------------------------------------------------------------
// Shared entity-response normalization
//
// Wrap every entity's .list() and .filter() methods so that paginated
// envelopes ({ count, results }) are transparently converted to bare arrays.
// All other entity methods (create, update, delete, get, …) are untouched.
// See src/lib/entityListNormalizer.js for the normalizer logic and rationale.
// ---------------------------------------------------------------------------
try {
  const entities = base44.entities;
  if (entities && typeof entities === 'object') {
    Object.keys(entities).forEach((entityName) => {
      const entity = entities[entityName];
      if (!entity || typeof entity !== 'object') return;
      ['list', 'filter'].forEach((method) => {
        const original = entity[method];
        if (typeof original !== 'function') return;
        entity[method] = (...args) =>
          Promise.resolve(original.apply(entity, args)).then(normalizeEntityList);
      });
    });
  }
} catch (_) {
  // Normalization patching is best-effort — never crash client initialization.
}