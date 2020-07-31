import { isArray, isFunction } from '@lxjx/utils';
import { Auth, AuthKeys, Callback, Share, Subscribe, Validators, ValidMeta } from './types';

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
export function authImpl<D, V extends Validators<D>>({
  validators,
  dependency: deps,
  validFirst,
}: Share<D, V>): Auth<D, V>['auth'] {
  return async (authKeys: AuthKeys<V>, extraOrCb: any, cb?: Callback) => {
    const extraIsFn = isFunction(extraOrCb);
    const extra = extraIsFn ? undefined : extraOrCb;
    const callback: Callback = extraIsFn ? extraOrCb : cb;

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
        const meta = await validItem(key, validators, deps, extra);

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

    callback?.(pass, rejects);

    return {
      pass,
      rejects,
    };
  };
}

/**
 * 生成和实现subscribe() api
 * */
export function subscribeImpl({ listeners }: Share<any, any>): Subscribe {
  return (subscribe: () => void) => {
    listeners.push(subscribe);

    return () => {
      const ind = listeners.indexOf(subscribe);
      if (ind === -1) return;
      listeners.splice(ind, 1);
    };
  };
}
