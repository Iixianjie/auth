import { AnyObject } from '@lxjx/utils';
import { Auth, CreateAuthConfig, Validators } from './types';
export default function create<D extends AnyObject = AnyObject, V extends Validators<D> = Validators<D>>({ dependency, validators, validFirst }: CreateAuthConfig<D, V>): Auth<D, V>;
