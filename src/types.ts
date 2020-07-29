import { AnyFunction, AnyObject } from '@lxjx/utils';

/** 验证失败时提供给用户的一项操作 */
export interface Action {
  /** 操作名 */
  label: string;
  /** 要执行的操作 */
  handler: AnyFunction;
  /** 可以在这里传递，事件类型(onClick)，渲染类型(link)等，帮助控制具体的显示 */
  [key: string]: any;
}

/** 验证器返回的结果 */
export interface ValidMate {
  /** 验证是否通过 */
  pass: boolean;
  /** 该权限名称 */
  title: string;
  /** 该权限的文字描述 */
  desc?: string;
  /** 验证失败时提供给用户的一组操作 */
  actions?: Action[];
}

export interface Validator {
  (payload: AnyObject): ValidMate;
}

export interface Validators {
  [key: string]: Validator;
}

export interface Update<D> {
  (patch: Partial<D>): void;
}

export interface Auth<D, V> {
  /** 更新dependency */
  update: Update<D>;
  /** 订阅dependency变更, 返回函数用于取消改订阅 */
  subscribe: () => () => void;
  /**  */
  getAuth(auth: Array<keyof V | Array<keyof V>>): void;
}

export interface CreateAuthConfig<D, V> {
  dependency: D;
  validators: V;
}

function createAuth<D = AnyObject, V extends Validators = Validators>({
  dependency,
  validators,
}: CreateAuthConfig<D, V>): Auth<D, V> {
  return {
    update: () => {},
    subscribe: () => () => {},
    getAuth() {},
  };
}

const res = createAuth({
  dependency: {
    name: 'lxj',
    age: 18,
  },
  validators: {
    login() {
      return {
        pass: true,
        title: '未登录',
        desc: '请登录',
      };
    },
    vip() {
      return {
        pass: true,
        title: 'vip可用',
        desc: '请开通vip',
      };
    },
  },
});

res.update({});

res.getAuth(['login', ['login', 'vip']]);
