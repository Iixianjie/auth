import create from '../src';

test('create', () => {
  const auth = create({
    dependency: {
      user: 'lxj',
      age: 18,
    },
    validators: {},
  });

  expect(auth).toMatchObject({
    update: expect.any(Function),
    subscribe: expect.any(Function),
    getDeps: expect.any(Function),
    auth: expect.any(Function),
  });
});

test('update & getDeps', () => {
  const auth = create({
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

  auth.update({
    user: 'jxl',
  });

  expect(auth.getDeps()).toEqual({
    user: 'jxl',
    age: 18,
  });
});

test('subscribe & unSubscribe', () => {
  const auth = create({
    dependency: {
      user: 'lxj',
      age: 18,
    },
    validators: {},
  });

  const ls1 = jest.fn(() => {});
  const ls2 = jest.fn(() => {});

  const usLs1 = auth.subscribe(ls1);

  auth.update({
    age: 19,
  });

  usLs1();

  auth.subscribe(ls2);

  auth.update({
    age: 18,
  });

  usLs1();

  expect(ls1).toHaveBeenCalledTimes(1);
  expect(ls2).toHaveBeenCalledTimes(1);
});

describe('auth & validators', () => {
  const getAuth = () => {
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
        verify({ verify }) {
          if (!verify) {
            return {
              label: 'not verify',
              desc: 'Basic information is not verified',
            };
          }
        },
        login({ usr }) {
          if (!usr) {
            return {
              label: 'not log',
              desc: 'Please log in first',
            };
          }
        },
        audit({ usr }) {
          if (!usr.audit) {
            return {
              label: 'not audit',
              desc: 'User is not audit',
            };
          }
        },
        vip({ usr }) {
          if (!usr.vip) {
            return {
              label: 'not vip',
              desc: 'User is not vip',
            };
          }
        },
        self({ usr }, extra) {
          if (usr && usr.name !== extra) {
            return {
              label: 'not self',
              desc: 'Can only be operated by self',
            };
          }
        },
        asyncValid() {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                label: 'async valid',
              });
            }, 2000);
          });
        },
      },
    });
  };

  test('base', done => {
    const auth = getAuth();

    auth.auth(['login', 'vip', 'audit'], (pass, rejects) => {
      expect(pass).toBe(false);
      expect(rejects).toEqual([
        {
          label: 'not vip',
          desc: 'User is not vip',
        },
      ]);

      done();
    });
  });

  test('or', done => {
    const auth = getAuth();

    auth.auth(['login', ['vip', 'audit']], (pass, rejects) => {
      expect(pass).toBe(true);
      expect(rejects).toEqual([]);

      done();
    });
  });

  test('extra', done => {
    const auth = getAuth();

    auth.auth(['self'], 'lxj', (pass, rejects) => {
      expect(pass).toBe(true);
      expect(rejects).toEqual([]);

      done();
    });
  });

  test('async & promise', () => {
    const auth = getAuth();

    const now = Date.now();

    return auth.auth(['login', 'asyncValid']).then(({ pass, rejects }) => {
      expect(pass).toBe(false);
      expect(rejects).toEqual([
        {
          label: 'async valid',
        },
      ]);
      expect(Date.now() - now >= 2000).toBe(true);
    });
  });
});
