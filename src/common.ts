import { isArray, isFunction } from '@lxjx/utils';
import {
  Auth,
  AuthConfig,
  AuthKeys,
  Callback,
  Share,
  Subscribe,
  Validators,
  ValidMeta,
} from './types';

/**
 * 传入验证key、所有验证器、依赖数据、额外数据。对该key进行验证后返回验证Promise形式的结果(void 或 ValidMeta)
 * */
export const validItem = async (
  key: string,
  validators: Validators<any>,
  deps: any,
  extra: any,
) => {
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

/**
 * 实现auth() api
 * */
export function authImpl<D, V extends Validators<D>>(share: Share<D, V>): Auth<D, V>['auth'] {
  return async (authKeys: AuthKeys<V>, configOrCb: any, cb?: Callback) => {
    const { validators, dependency: deps, validFirst } = share;
    const confIsFn = isFunction(configOrCb);
    const { extra, validators: localValidators }: AuthConfig<D> = confIsFn ? {} : configOrCb || {};
    const callback: Callback = confIsFn ? configOrCb : cb;

    /** 所有验证失败结果 */
    const rejects: ValidMeta[] = [];
    /** 是否通过 */
    let pass = true;

    /**
     * 传入单个权限key或key数组进行验证, 并将验证结果写入pass和rejects
     * 单个验证时: 验证该项并返回验证meta信息，验证正确时无返回
     * key数组时: 作为调节`or`进行验证，只要其中任意一项通过了验证则通过验证
     * */
    const test = async (key: any, isOr?: boolean) => {
      if (isArray(key)) {
        const tempRejects: ValidMeta[] = [];
        let flag = false;

        for (const authItem of key) {
          // if (pass) {
          const meta = await test(authItem, true);
          if (meta) {
            tempRejects.push(meta);
          }
          if (!meta) {
            flag = true;
            break;
          }
          // }
        }
        if (!flag) {
          pass = false;
          validFirst ? rejects.push(tempRejects[0]) : rejects.push(...tempRejects);
        }
      } else {
        const meta = await validItem(key, { ...localValidators, ...validators }, deps, extra);

        if (!meta) return;

        if (!isOr) {
          pass = false;
          rejects.push(meta);
        }

        return meta;
      }
    };

    if (validFirst) {
      for (const authItem of authKeys) {
        if (pass) {
          await test(authItem);
        }
      }
    } else {
      await Promise.all(authKeys.map(ak => test(ak)));
    }

    const rjs = rejects.length ? rejects : null;

    callback?.(rjs);

    return rjs;
  };
}

/**
 * 生成和实现subscribe() api
 * */
export function subscribeImpl(share: Share<any, any>): Subscribe {
  return (subscribe: () => void) => {
    share.listeners.push(subscribe);

    return () => {
      const ind = share.listeners.indexOf(subscribe);
      if (ind === -1) return;
      share.listeners.splice(ind, 1);
    };
  };
}
