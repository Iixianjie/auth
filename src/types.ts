import { AnyFunction, AnyObject } from '@lxjx/utils';

export type Share<D, V> = CreateAuthConfig<D, V> & {
  listeners: Array<() => void>;
};

/** 验证失败时提供给用户的一项操作(仅作为约定，可以执行根据需要调整) */
export interface Action {
  /** 操作名称 */
  label: string;
  /** 要执行的操作 */
  handler?: AnyFunction;
  /** 如果传入，则渲染a链接 */
  href?: string;
  /** 可以在这里传递，事件类型(onClick)，渲染类型(link)等，帮助控制具体的显示 */
  [key: string]: any;
}

/** 验证器返回的结果 */
export interface ValidMeta {
  /** 该权限名称 */
  label: string;
  /** 该权限的文字描述 */
  desc?: string;
  /** 验证失败时提供给用户的一组操作 */
  actions?: Action[];
}

/** 验证器, 一旦验证器返回了ValidMeta或resolve了ValidMeta则该次验证视为不通过 */
export interface Validator<D> {
  (deps: D, extra?: any): ValidMeta | Promise<ValidMeta | void> | void;
}

export interface Validators<D = AnyObject> {
  [key: string]: Validator<D>;
}

export interface SetDeps<D> {
  (patch: Partial<D>): void;
}

export type Subscribe = (listener: () => void) => () => void;

/** 验证结束的回调 */
export interface Callback {
  (rejects: ValidMeta[] | null): void;
}

/** 验证结束的Promise */
export type PromiseBack = ValidMeta[] | null;

/** 用于验证的auth keys */
export type AuthKeys<V, C = AnyObject> = Array<keyof (V & C) | Array<keyof (V & C)>>;

export interface AuthConfig<D> {
  /** 传递给验证器的额外参数 */
  extra?: any;
  /** 局部验证器 */
  validators?: Validators<D>;
}

export interface Auth<D, V> {
  /** 更新dependency */
  setDeps: SetDeps<D & { [key: string]: any }>;
  /** 订阅dependency变更, 返回函数用于取消改订阅 */
  subscribe: Subscribe;
  /** 获取当前的dependency */
  getDeps(): D;
  /**
   * @param authKeys - 所属权限, 如果数组项为数组则表示逻辑`or`
   * @param callback - 验证结束的回调
   *    回调接收:
   *      * pass 是否通过了所有指定的验证
   *      * rejects 未通过的验证器返回的元数据列表
   * @return - resolve callback同样参数对象的Promise，和callback二选一
   * */
  auth(authKeys: AuthKeys<V>, callback?: Callback): Promise<PromiseBack>;
  /**
   * @param authKeys - 所属权限, 如果数组项为数组则表示逻辑`or`
   * @param config - 配置
   * @param config.extra - 传递给验证器的额外参数
   * @param config.validators - 局部验证器
   * @param callback - 验证结束的回调
   *    回调接收:
   *      * pass 是否通过了所有指定的验证
   *      * rejects 未通过的验证器返回的元数据列表
   * @return - resolve callback同样参数对象的Promise，和callback二选一
   * */
  auth(authKeys: AuthKeys<V>, config: AuthConfig<D>, callback?: Callback): Promise<PromiseBack>;
}

export interface CreateAuthConfig<D, V> {
  /** 被所有验证器依赖的值组成的对象 */
  dependency?: D;
  /** 待注册的验证器 */
  validators: V;
  /**
   * 如果一个验证未通过，则阻止后续验证
   * * 对于or中的子权限，即使开启了validFirst，依然会对每一项进行验证，但是只会返回第一个
   * * 在执行auth()时将优先级更高的权限key放到前面有助于提高验证反馈的精度, 如 login > vip, 因为vip状态是以登录状态为基础的
   *  */
  validFirst?: boolean;
}
