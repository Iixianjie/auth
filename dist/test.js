import { __assign } from "tslib";
import create from '../src';
test('create', function () {
    var auth = create({
        dependency: {
            user: 'lxj',
            age: 18,
        },
        validators: {},
    });
    expect(auth).toMatchObject({
        setDeps: expect.any(Function),
        subscribe: expect.any(Function),
        getDeps: expect.any(Function),
        auth: expect.any(Function),
    });
});
test('update & getDeps', function () {
    var auth = create({
        dependency: {
            user: 'lxj',
            age: 18,
        },
        validators: {},
    });
    expect(auth.getDeps()).toEqual({
        user: 'lxj',
        age: 18,
    });
    auth.setDeps({
        user: 'jxl',
    });
    expect(auth.getDeps()).toEqual({
        user: 'jxl',
        age: 18,
    });
});
test('subscribe & unSubscribe', function () {
    var auth = create({
        dependency: {
            user: 'lxj',
            age: 18,
        },
        validators: {},
    });
    var ls1 = jest.fn(function () { });
    var ls2 = jest.fn(function () { });
    var usLs1 = auth.subscribe(ls1);
    auth.setDeps({
        age: 19,
    });
    usLs1();
    auth.subscribe(ls2);
    auth.setDeps({
        age: 18,
    });
    usLs1();
    expect(ls1).toHaveBeenCalledTimes(1);
    expect(ls2).toHaveBeenCalledTimes(1);
});
describe('auth & validators', function () {
    var getAuth = function () {
        return create({
            dependency: {
                verify: false,
                usr: {
                    name: 'lxj',
                    audit: true,
                    vip: false,
                },
            },
            validators: {
                verify: function (_a) {
                    var verify = _a.verify;
                    if (!verify) {
                        return {
                            label: 'not verify',
                            desc: 'Basic information is not verified',
                        };
                    }
                },
                login: function (_a) {
                    var usr = _a.usr;
                    if (!usr) {
                        return {
                            label: 'not log',
                            desc: 'Please log in first',
                        };
                    }
                },
                audit: function (_a) {
                    var usr = _a.usr;
                    if (!usr.audit) {
                        return {
                            label: 'not audit',
                            desc: 'User is not audit',
                        };
                    }
                },
                vip: function (_a) {
                    var usr = _a.usr;
                    if (!usr.vip) {
                        return {
                            label: 'not vip',
                            desc: 'User is not vip',
                        };
                    }
                },
                self: function (_a, extra) {
                    var usr = _a.usr;
                    if (usr && usr.name !== extra) {
                        return {
                            label: 'not self',
                            desc: 'Can only be operated by self',
                        };
                    }
                },
                asyncValid: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve({
                                label: 'async valid',
                            });
                        }, 2000);
                    });
                },
            },
        });
    };
    test('base', function (done) {
        var auth = getAuth();
        auth.auth(['login', 'vip', 'audit'], function (rejects) {
            expect(rejects).toEqual([
                {
                    label: 'not vip',
                    desc: 'User is not vip',
                },
            ]);
            done();
        });
    });
    test('or', function (done) {
        var auth = getAuth();
        auth.auth(['login', ['vip', 'audit']], function (rejects) {
            expect(rejects).toEqual(null);
            done();
        });
    });
    test('extra', function (done) {
        var auth = getAuth();
        auth.auth(['self'], { extra: 'lxj' }, function (rejects) {
            expect(rejects).toEqual(null);
            done();
        });
    });
    test('local validators', function (done) {
        var auth = getAuth();
        auth.auth(['isJxl', 'self'], {
            extra: 1,
            validators: {
                isJxl: function (deps, extra) {
                    if (deps.usr.name !== 'jxl') {
                        return {
                            label: "Must be jxl" + extra,
                        };
                    }
                },
            },
        }, function (rejects) {
            expect(rejects).toEqual([{ label: 'Must be jxl1' }]);
            done();
        });
    });
    test('async & promise', function () {
        var auth = getAuth();
        var now = Date.now();
        return auth.auth(['login', 'asyncValid']).then(function (rejects) {
            expect(rejects).toEqual([
                {
                    label: 'async valid',
                },
            ]);
            expect(Date.now() - now >= 2000).toBe(true);
        });
    });
});
test('middleware', function () {
    expect.assertions(3); // 两次patch是否执行、1次初始配置更改是否成功
    var mid1 = function (bonus) {
        if (bonus.init) {
            var conf = bonus.config;
            var deps = conf.dependency;
            return __assign(__assign({}, conf), { dependency: __assign(__assign({}, deps), { field3: 'hello' }) });
        }
        bonus.monkey('setDeps', function (next) { return function (patch) {
            expect(true).toBe(true);
            next(patch);
        }; });
    };
    var mid2 = function (bonus) {
        if (bonus.init) {
            var conf = bonus.config;
            var deps = conf.dependency;
            return __assign(__assign({}, conf), { dependency: __assign(__assign({}, deps), { field4: 'world' }) });
        }
        bonus.monkey('subscribe', function (next) { return function (listener) {
            expect(true).toBe(true);
            return next(listener);
        }; });
    };
    var auth = create({
        middleware: [mid1, mid2],
        dependency: {
            user: 'lxj',
            age: 18,
        },
        validators: {},
    });
    expect(auth.getDeps()).toEqual({
        user: 'lxj',
        age: 18,
        field3: 'hello',
        field4: 'world',
    });
    auth.setDeps({
        user: 'jxl',
    });
    auth.subscribe(function () { });
});
