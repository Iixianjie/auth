import { AnyObject } from '@lxjx/utils';
import { Auth, CreateAuthConfig, Update, Validators, Share } from './types';
import { authImpl, subscribeImpl } from './common';

export default function create<
  D extends AnyObject = AnyObject,
  V extends Validators<D> = Validators<D>
>({ dependency, validators, validFirst = false }: CreateAuthConfig<D, V>): Auth<D, V> {
  let deps = { ...dependency } as D;

  const share: Share<D, V> = {
    dependency: deps,
    validators,
    validFirst,
    listeners: [],
  };

  const update: Update<D> = patch => {
    deps = { ...deps, ...patch };
    /** 触发listener */
    share.listeners.forEach(listener => {
      listener();
    });
  };

  const auth = authImpl(share);

  const subscribe = subscribeImpl(share);

  return {
    update,
    subscribe,
    auth,
    getDeps: () => deps,
  };
}
