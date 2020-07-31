import { __assign } from "tslib";
import { authImpl, subscribeImpl } from './common';
export default function create(_a) {
    var dependency = _a.dependency, validators = _a.validators, _b = _a.validFirst, validFirst = _b === void 0 ? false : _b;
    var deps = __assign({}, dependency);
    var share = {
        dependency: deps,
        validators: validators,
        validFirst: validFirst,
        listeners: [],
    };
    var update = function (patch) {
        deps = __assign(__assign({}, deps), patch);
        /** 触发listener */
        share.listeners.forEach(function (listener) {
            listener();
        });
    };
    var auth = authImpl(share);
    var subscribe = subscribeImpl(share);
    return {
        update: update,
        subscribe: subscribe,
        auth: auth,
        getDeps: function () { return deps; },
    };
}
