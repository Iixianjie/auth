import { isNumber, isObject } from '@lxjx/utils';
import { Middleware } from './types';

const PREFIX = 'AUTH_CACHE_';

/**
 * 在deps每次变更时，将其缓存到本地localstorage中，并在下次重新以当前key创建时将其还原
 * */
export default function cache(key: string, expireMs?: number) {
  const upK = key.toUpperCase();
  const k = `${PREFIX}${upK}`;
  const expireKey = `${upK}_EXPIRE`;

  if (expireMs) checkExpire(k, expireKey);

  const cacheMiddleware: Middleware = bonus => {
    if (bonus.init) {
      const conf = bonus.config;

      const cacheData = get(k);

      if (!cacheData) return conf;

      return { ...conf, dependency: cacheData };
    }

    bonus.apis.subscribe(() => {
      set(k, bonus.apis.getDeps());
      if (isNumber(expireMs) && expireMs > 0) {
        setExpire(expireKey, expireMs);
      }
    });
  };

  return cacheMiddleware;
}

function get(key: string) {
  const cData = localStorage.getItem(key);

  if (!cData) return;

  const parseData = JSON.parse(cData);

  if (!isObject(parseData)) return;

  return parseData;
}

function set(key: string, val: any) {
  localStorage.setItem(key, JSON.stringify(val));
}

function setExpire(expireKey: string, expireMs: number) {
  const exT = localStorage.getItem(expireKey);
  if (exT) return; // 只在第一次缓存时间
  localStorage.setItem(expireKey, String(Date.now() + expireMs));
}

function checkExpire(k: string, expireKey: string) {
  const exT = localStorage.getItem(expireKey);

  if (!exT) return;

  if (Date.now() > Number(exT)) {
    localStorage.removeItem(k);
    localStorage.removeItem(expireKey);
  }
}
