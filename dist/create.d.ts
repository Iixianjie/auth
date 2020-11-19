import { AnyObject } from '@lxjx/utils';
import { Auth, CreateAuthConfig, Validators } from './types';
export default function create<D extends AnyObject = AnyObject, V extends Validators<D> = Validators<D>>(conf: CreateAuthConfig<D, V>): Auth<D, V>;
//# sourceMappingURL=create.d.ts.map