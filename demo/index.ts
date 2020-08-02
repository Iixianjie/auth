import create from '../src';

const auth = create({
  dependency: {
    name: 'lxj1',
    age: 17,
  },
  validators: {
    isLxj(deps, extr) {
      console.log(deps.name, extr);
      if (deps.name !== 'lxj') {
        return {
          label: '你不是李显杰',
        };
      }
    },
    is18p(deps) {
      if (deps.age < 18) {
        return {
          label: '只能大于18岁用户使用',
        };
      }
    },
  },
});

auth.auth(
  ['isLxj', 'isLxj2', 'is18p'],
  {
    extra: 'heh',
    validators: {
      isLxj2(deps, extr) {
        console.log(222, deps.name, extr);
        if (deps.name !== 'lxj') {
          return {
            label: '你不是李显杰222',
          };
        }
      },
    },
  },
  rejects => {
    console.log(rejects);

    auth.setDeps({
      name: 'lxj',
    });

    auth.auth(['isLxj', 'is18p'], rejects2 => {
      console.log(rejects2);
    });
  },
);
