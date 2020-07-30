import { AnyObject, isArray, isFunction } from '@lxjx/utils';
import {
  Auth,
  AuthKeys,
  Callback,
  CreateAuthConfig,
  Update,
  Validators,
  ValidMate,
} from './types';

export default function create<D extends AnyObject = AnyObject, V extends Validators<D> = Validators<D>>({
  dependency,
  validators,
  validFirst = true,
}: CreateAuthConfig<D, V>): Auth<D, V> {
  let deps = { ...dependency } as D;

  const update: Update<D> = patch => {
    deps = { ...deps, ...patch };
    /** 触发listener */
  };

  const getAuth: Auth<D, V>['getAuth'] = async (auth: AuthKeys<V>, extraOrCb: any, cb?: Callback) => {
    const extraIsFn = isFunction(extraOrCb);
    const extra = extraIsFn ? undefined : extraOrCb;
    const callback: Callback = extraIsFn ? extraOrCb : cb;

    const rejects: ValidMate[] = [];
    let pass = true;

    const validItem = async (key: keyof V) => {
      const validator = validators[key];
      // 不存在此验证器
      if (!validator) return;

      const result = validator(deps, extra);

      if (!result) return;

      if ('then' in result && 'catch' in result) {
        // eslint-disable-next-line no-return-await
        return await result;
      }
      return result;
    };

    const test = async (key: any) => {

      if (isArray(key)) {
        const tempRejects: ValidMate[] = [];
        let tempPass = false;

        const asyncList = key.map(k => validItem(k));

        const metas = await Promise.all(asyncList);

        for (const meta of metas) {

          if (meta) {
            tempRejects.push(meta);
          } else {
            // 只要有任意一次验证成功则通过
            tempPass = true;
          }
        }

        if (!tempPass) {
          pass = false;
          rejects.push(...tempRejects);
        }
      } else {
        const meta = await validItem(key);
        
        if (!meta) return;
        pass = false;
        rejects.push(meta);
      }
    }

    if (validFirst) {
      for (const authItem of auth) {
        if (pass) {
          // eslint-disable-next-line no-await-in-loop
          await test(authItem);
        }
      }
    } else {
      await Promise.all(auth.map(ak => test(ak)));
    }
    

    console.log('callback');

    callback?.(pass, rejects);

    return {
      pass,
      rejects,
    }
  };

  return {
    update,
    subscribe: () => () => {},
    getAuth,
  };
}
