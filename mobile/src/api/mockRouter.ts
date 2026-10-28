import { handleMockCore } from './mockHandlersCore';
import { handleMockCommunity } from './mockHandlersCommunity';
import { handleMockExtras } from './mockHandlersExtras';

export function resolveMockRequest<T>(method: string, path: string, body?: any): T {
  const coreResult = handleMockCore(method, path, body);
  if (coreResult !== null) return coreResult as T;
  const communityResult = handleMockCommunity(method, path, body);
  if (communityResult !== null) return communityResult as T;
  return handleMockExtras(method, path, body) as T;
}
