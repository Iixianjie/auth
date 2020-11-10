import { createRandString } from '@lxjx/utils';
import create, { Middleware } from '../src';
import cache from '../src/cacheMiddleware';

const auth = create({
  middleware: [cache('test_cache', 5000)],
  dependency: {
    name: 'lxj1',
    age: 17,
  },
  validators: {
    isLxj(deps, extr) {
      console.log(deps.name, extr);
      if (deps.name !== 'lxj') {
        return {
          label: '你不是lxj',
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

// console.log(auth.getDeps());

// auth.setDeps({
//   name: createRandString(),
// });

// setInterval(() => {

//
//   console.log(auth.getDeps());
// }, 2000);

// auth.auth(
//   ['isLxj', 'isLxj2', 'is18p'],
//   {
//     extra: 'heh',
//     validators: {
//       isLxj2(deps, extr) {
//         console.log(222, deps.name, extr);
//         if (deps.name !== 'lxj') {
//           return {
//             label: '你不是lxj222',
//           };
//         }
//       },
//     },
//   },
//   rejects => {
//     console.log(rejects);
//
//     auth.setDeps({
//       name: 'lxj',
//     });
//
//     auth.auth(['isLxj', 'is18p'], rejects2 => {
//       console.log(rejects2);
//     });
//   },
// );
