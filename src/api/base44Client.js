import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { normalizeEntityList } from '@/lib/entityListNormalizer';

const { appId, token, functionsVersion } = appParams;

// Guard: surface a loud error in development when appId is missing so the
// root cause is immediately visible instead of manifesting as obscure 404s.
if (import.meta.env.DEV && !appId) {
  // eslint-disable-next-line no-console
  console.error(
    '[base44Client] appId is null/empty — createClient will operate without a ' +
    'valid app ID. All API requests will target /api/apps/null/... and fail. ' +
    'Ensure VITE_BASE44_APP_ID is defined at Vite build time.'
  );
}

//Create a client with authentication required
export const base44 = createClient({
  appId: appId || undefined,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false
});

// Prevent /api/apps/null/analytics/track/batch requests when appId is missing or falsy.
// cleanup() stops the heartbeat processor and the internal batch flush loop.
if (!appId) {
  base44.analytics.cleanup();
  base44.analytics = { track: () => {}, cleanup: () => {} };
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
