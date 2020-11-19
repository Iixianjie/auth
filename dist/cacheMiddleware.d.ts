import { Middleware } from './types';
/**
 * 在deps每次变更时，将其缓存到本地localstorage中，并在下次重新以当前key创建时将其还原
 * */
export default function cache(key: string, expireMs?: number): Middleware;
//# sourceMappingURL=cacheMiddleware.d.ts.map