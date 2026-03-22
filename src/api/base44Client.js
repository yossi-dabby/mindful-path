import { createClient } from '@base44/sdk';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
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

// Wrap entity collection methods so callers always receive a plain array,
// even when the SDK returns a paginated envelope { count, results: [...] }.
const _entityProxy = new Proxy(base44.entities, {
  get(target, entityName) {
    const entity = target[entityName];
    if (!entity || typeof entity !== 'object') return entity;
    return new Proxy(entity, {
      get(eTarget, method) {
        if (method === 'list' || method === 'filter') {
          const original = eTarget[method];
          if (typeof original === 'function') {
            return (...args) => original.apply(eTarget, args).then(normalizeEntityList);
          }
        }
        return eTarget[method];
      }
    });
  }
});

base44.entities = _entityProxy;

// Override base44.auth.updateMe to use PATCH instead of PUT.
// The Base44 server returns HTTP 405 for PUT on /api/apps/{appId}/entities/User/me;
// the SDK (v0.8.x) uses PUT by default. This client-side fix resolves home setup
// completion failures in Railway production.
// NOTE: File an issue with the Base44 SDK maintainers to support PATCH natively.
const _serverUrl = (import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://base44.app')
  .replace(/\/+$/, '');
const _updateMeAxios = createAxiosClient({
  baseURL: `${_serverUrl}/api`,
  token,
  interceptResponses: true,
});

base44.auth.updateMe = (data) => {
  // Read the latest auth token from localStorage before each request so the
  // PATCH client stays in sync even if the SDK refreshes the token after init.
  const storedToken = typeof window !== 'undefined' && window.localStorage
    ? window.localStorage.getItem('base44_access_token')
    : null;
  if (storedToken) {
    _updateMeAxios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  }
  return _updateMeAxios.patch(`/apps/${appId}/entities/User/me`, data);
};