import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { normalizeEntityList } from '@/lib/entityListNormalizer';

const { token, functionsVersion } = appParams;

// App ID is hardcoded as a fallback to ensure login redirects always work
// even when VITE_BASE44_APP_ID is not set at Railway build time.
const APP_ID = import.meta.env.VITE_BASE44_APP_ID || '69504b725a07f5aa75aeaf7d';

//Create a client with authentication required
export const base44 = createClient({
  appId: APP_ID,
  token,
  functionsVersion,
  requiresAuth: false,
  // appBaseUrl is required so that auth.redirectToLogin() and auth.logout()
  // redirect to the real Base44 platform login page rather than constructing
  // a relative `/login` URL that does not exist in this React app.
  // Without this, unauthenticated users land on a 404 in Railway production.
  appBaseUrl: 'https://base44.app',
});

// ---------------------------------------------------------------------------
// Override auth.redirectToLogin to include app_id in the redirect URL.
//
// The SDK's redirectToLogin() builds the URL as:
//   https://base44.app/login?from_url=<url>
// — without app_id — so Base44 cannot identify which app to authenticate
// for and returns "App not found".
// We override it here to append &app_id=<APP_ID> so the Base44 platform
// can resolve the app context correctly on every login redirect.
// ---------------------------------------------------------------------------
base44.auth.redirectToLogin = (nextUrl) => {
  if (typeof window === 'undefined') return;
  const redirectUrl = nextUrl
    ? new URL(nextUrl, window.location.origin).toString()
    : window.location.href;
  const loginUrl =
    `https://base44.app/login` +
    `?from_url=${encodeURIComponent(redirectUrl)}` +
    `&app_id=${encodeURIComponent(APP_ID)}`;
  window.location.href = loginUrl;
};

// ---------------------------------------------------------------------------
// Override auth.updateMe to use PATCH instead of PUT.
//
// The Base44 server returns HTTP 405 Method Not Allowed for PUT requests on
// /api/apps/{appId}/entities/User/me. The endpoint only accepts PATCH for
// partial user profile updates. The SDK (v0.8.x) still sends PUT, so we
// replace the method here so every caller (WelcomeWizard, Settings, etc.)
// benefits from the fix without any call-site changes.
// ---------------------------------------------------------------------------
base44.auth.updateMe = async (data) => {
  const token =
    typeof window !== 'undefined'
      ? (window.localStorage?.getItem('base44_access_token') ?? null)
      : null;

  const res = await fetch(`/api/apps/${encodeURIComponent(APP_ID)}/entities/User/me`, {
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
