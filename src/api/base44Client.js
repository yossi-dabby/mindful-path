import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { normalizeEntityList } from '@/lib/entityListNormalizer';

const { token, functionsVersion } = appParams;

// App ID is hardcoded as a fallback to ensure login redirects always work
// even when VITE_BASE44_APP_ID is not set at Railway build time.
const APP_ID = import.meta.env.VITE_BASE44_APP_ID || '69504b725a07f5aa75aeaf7d';

// Base URL is hardcoded as a fallback to ensure the Base44 proxy is always
// enabled, even when VITE_BASE44_APP_BASE_URL is not set at Railway build time.
const APP_BASE_URL = import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://mindful-path-75aeaf7d.base44.app';

//Create a client with authentication required
export const base44 = createClient({
  appId: APP_ID,
  appBaseUrl: APP_BASE_URL,
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