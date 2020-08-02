import { __assign } from "tslib";
import { authImpl, subscribeImpl } from './common';
export default function create(_a) {
    var dependency = _a.dependency, validators = _a.validators, _b = _a.validFirst, validFirst = _b === void 0 ? true : _b;
    var share = {
        dependency: __assign({}, dependency),
        validators: validators,
        validFirst: validFirst,
        listeners: [],
    };
    var setDeps = function (patch) {
        share.dependency = __assign(__assign({}, share.dependency), patch);
        /** 触发listener */
        share.listeners.forEach(function (listener) {
            listener();
        });
    };
    var auth = authImpl(share);
    var subscribe = subscribeImpl(share);
    return {
        setDeps: setDeps,
        subscribe: subscribe,
        auth: auth,
        getDeps: function () { return share.dependency; },
    };
}
