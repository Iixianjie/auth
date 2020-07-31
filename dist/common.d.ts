import { Auth, Share, Subscribe, Validators, ValidMeta } from './types';
/**
 * 传入验证key、所有验证器、依赖数据、额外数据。对该key进行验证后返回验证Promise形式的结果(void 或 ValidMeta)
 * */
export declare const validItem: (key: string, validators: Validators<any>, deps: any, extra: any) => Promise<void | ValidMeta>;
/**
 * 实现auth() api
 * */
export declare function authImpl<D, V extends Validators<D>>({ validators, dependency: deps, validFirst, }: Share<D, V>): Auth<D, V>['auth'];
/**
 * 生成和实现subscribe() api
 * */
export declare function subscribeImpl({ listeners }: Share<any, any>): Subscribe;
