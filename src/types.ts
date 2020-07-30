import { AnyFunction, AnyObject } from '@lxjx/utils';

/** 验证失败时提供给用户的一项操作 */
export interface Action {
  /** 操作名称 */
  label: string;
  /** 要执行的操作 */
  handler: AnyFunction;
  /** 可以在这里传递，事件类型(onClick)，渲染类型(link)等，帮助控制具体的显示 */
  [key: string]: any;
}

/** 验证器返回的结果 */
export interface ValidMate {
  /** 该权限名称 */
  label: string;
  /** 该权限的文字描述 */
  desc?: string;
  /** 验证失败时提供给用户的一组操作 */
  actions?: Action[];
}

/** 验证器, 一旦验证器返回了ValidMate或resolve了ValidMate则该次验证视为不通过 */
export interface Validator<D> {
  (deps: D, extra?: any): ValidMate | Promise<ValidMate | void> | void;
}

export interface Validators<D = AnyObject> {
  [key: string]: Validator<D>;
}

export interface Update<D> {
  (patch: Partial<D>): void;
}

/** 验证结束的回调 */
export interface Callback {
  (pass: boolean, rejects: ValidMate[]): void;
}

/** 验证结束的Promise */
export type PromiseBack = { pass: boolean, rejects: ValidMate[] };

/** 用于验证的auth keys */
export type AuthKeys<V> = Array<keyof V | Array<keyof V>>;


export interface Auth<D, V> {
  /** 更新dependency */
  update: Update<D>;
  /** 订阅dependency变更, 返回函数用于取消改订阅 */
  subscribe: () => () => void;
  /**
   * @param auth - 所属权限, 如果数组项为数组则表示逻辑`or`
   * @param callback - 验证结束的回调
   *    回调接收:
   *      * pass 是否通过了所有指定的验证
   *      * rejects 未通过的验证器返回的元数据列表
   * @return - resolve callback同样参数对象的Promise，和callback二选一
   * */
  getAuth(auth: AuthKeys<V>, callback?: Callback): Promise<PromiseBack>;
  /**
   * @param auth - 所属权限, 如果数组项为数组则表示逻辑`or`
   * @param extra - 传递给验证器的额外参数
   * @param callback - 验证结束的回调
   *    回调接收:
   *      * pass 是否通过了所有指定的验证
   *      * rejects 未通过的验证器返回的元数据列表
   * @return - resolve callback同样参数对象的Promise，和callback二选一
   * */
  getAuth(auth: AuthKeys<V>, extra: any, callback?: Callback): Promise<PromiseBack>;
}

export interface CreateAuthConfig<D, V> {
  dependency?: D;
  validators: V;
  // 如果一个验证未通过，则阻止后续验证, 开启后,在执行auth()时将优先级更高的权限key放到前面有助于提高验证反馈的精度, 如 login > vip, 因为vip状态永远都是在登录后进行验证的
  validFirst?: boolean;
}
