import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { normalizeEntityList } from '@/lib/entityListNormalizer';

const { appId, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId: appId || undefined,
  token,
  functionsVersion,
  requiresAuth: false
});

// Prevent /api/apps/null/analytics/track/batch requests when appId is missing or falsy.
// cleanup() stops the heartbeat processor and the internal batch flush loop.
if (!appId) {
  base44.analytics.cleanup();
  base44.analytics = { track: () => {}, cleanup: () => {} };
}

// ---------------------------------------------------------------------------
// Override auth.updateMe to use PATCH instead of PUT.
//
// The Base44 server returns HTTP 405 Method Not Allowed for PUT requests on
// /api/apps/{appId}/entities/User/me. The endpoint only accepts PATCH for
// partial user profile updates. The SDK (v0.8.x) still sends PUT, so we
// replace the method here so every caller (WelcomeWizard, Settings, etc.)
// benefits from the fix without any call-site changes.
// ---------------------------------------------------------------------------
if (appId) {
  base44.auth.updateMe = async (data) => {
    const token =
      typeof window !== 'undefined'
        ? (window.localStorage?.getItem('base44_access_token') ?? null)
        : null;

    const res = await fetch(`/api/apps/${encodeURIComponent(appId)}/entities/User/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg =
        errData.message || errData.detail || `Request failed with status code ${res.status}`;
      const err = new Error(msg);
      err.name = 'Base44Error';
      err.status = res.status;
      err.code = errData.code;
      err.data = errData;
      throw err;
    }

    return res.json();
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
