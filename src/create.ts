import { AnyObject } from '@lxjx/utils';
import { Auth, CreateAuthConfig, SetDeps, Validators, Share } from './types';
import { authImpl, subscribeImpl } from './common';

export default function create<
  D extends AnyObject = AnyObject,
  V extends Validators<D> = Validators<D>
>({ dependency, validators, validFirst = true }: CreateAuthConfig<D, V>): Auth<D, V> {
  const share: Share<D, V> = {
    dependency: { ...dependency! },
    validators,
    validFirst,
    listeners: [],
  };

  const setDeps: SetDeps<D> = patch => {
    share.dependency = { ...share.dependency!, ...patch };
    /** 触发listener */
    share.listeners.forEach(listener => listener());
  };

  const auth = authImpl(share);

  const subscribe = subscribeImpl(share);

  return {
    setDeps,
    subscribe,
    auth,
    getDeps: () => share.dependency!,
  };
}
