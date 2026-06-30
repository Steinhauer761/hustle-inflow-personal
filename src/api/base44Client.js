import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// Protect admins from inadvertently viewing or overwriting other users' data on the client-side.
// Since admins bypass RLS, we automatically scope their queries to their own data unless explicitly specified.
const originalEntities = base44.entities;
if (originalEntities) {
  base44.entities = new Proxy(originalEntities, {
    get: function(target, entityName) {
      if (entityName === 'User' || entityName === 'subscribe' || entityName === 'get') {
        return target[entityName];
      }
      const originalEntity = target[entityName];
      if (!originalEntity) return originalEntity;

      return new Proxy(originalEntity, {
        get: function(entTarget, method) {
          if (method === 'list') {
            return async function(...args) {
              try {
                const currentUser = await base44.auth.me();
                if (currentUser && currentUser.role === 'admin') {
                  return await entTarget.filter({ created_by_id: currentUser.id }, ...args);
                }
              } catch (e) {
                // Ignore auth error
              }
              return await entTarget.list(...args);
            };
          }
          if (method === 'filter') {
            return async function(query, ...restArgs) {
              try {
                const currentUser = await base44.auth.me();
                if (currentUser && currentUser.role === 'admin') {
                  const safeQuery = query || {};
                  if (!safeQuery.created_by_id) {
                    safeQuery.created_by_id = currentUser.id;
                  }
                  return await entTarget.filter(safeQuery, ...restArgs);
                }
              } catch (e) {
                // Ignore auth error
              }
              return await entTarget.filter(query || {}, ...restArgs);
            };
          }
          return entTarget[method];
        }
      });
    }
  });
}