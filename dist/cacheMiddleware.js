import { __assign } from "tslib";
import { isNumber, isObject } from '@lxjx/utils';
var PREFIX = 'AUTH_CACHE_';
/**
 * 在deps每次变更时，将其缓存到本地localstorage中，并在下次重新以当前key创建时将其还原
 * */
export default function cache(key, expireMs) {
    var upK = key.toUpperCase();
    var k = "" + PREFIX + upK;
    var expireKey = upK + "_EXPIRE";
    if (expireMs)
        checkExpire(k, expireKey);
    var cacheMiddleware = function (bonus) {
        if (bonus.init) {
            var conf = bonus.config;
            var cacheData = get(k);
            if (!cacheData)
                return conf;
            return __assign(__assign({}, conf), { dependency: cacheData });
        }
        bonus.apis.subscribe(function () {
            set(k, bonus.apis.getDeps());
            if (isNumber(expireMs) && expireMs > 0) {
                setExpire(expireKey, expireMs);
            }
        });
    };
    return cacheMiddleware;
}
function get(key) {
    var cData = localStorage.getItem(key);
    if (!cData)
        return;
    var parseData = JSON.parse(cData);
    if (!isObject(parseData))
        return;
    return parseData;
}
function set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
function setExpire(expireKey, expireMs) {
    var exT = localStorage.getItem(expireKey);
    if (exT)
        return; // 只在第一次缓存时间
    localStorage.setItem(expireKey, String(Date.now() + expireMs));
}
function checkExpire(k, expireKey) {
    var exT = localStorage.getItem(expireKey);
    if (!exT)
        return;
    if (Date.now() > Number(exT)) {
        localStorage.removeItem(k);
        localStorage.removeItem(expireKey);
    }
}
