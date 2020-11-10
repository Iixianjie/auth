import { __assign } from "tslib";
import { authImpl, middlewareImpl, subscribeImpl } from './common';
export default function create(conf) {
    var _a = middlewareImpl(conf), config = _a[0], patchHandle = _a[1];
    var dependency = config.dependency, validators = config.validators, _b = config.validFirst, validFirst = _b === void 0 ? true : _b;
    var share = {
        dependency: __assign({}, dependency),
        validators: validators,
        validFirst: validFirst,
        listeners: [],
    };
    var setDeps = function (patch) {
        share.dependency = __assign(__assign({}, share.dependency), patch);
        /** 触发listener */
        share.listeners.forEach(function (listener) { return listener(); });
    };
    var auth = authImpl(share);
    var subscribe = subscribeImpl(share);
    var apis = {
        subscribe: subscribe,
        auth: auth,
        setDeps: setDeps,
        getDeps: function () { return share.dependency; },
    };
    patchHandle && patchHandle(apis);
    return apis;
}
