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