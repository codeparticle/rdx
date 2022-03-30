/**
 * Function to see whether an object has keys
 */

import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import { isObject } from './is-object'

const hasKeys = <Obj extends _Object>(obj: Obj): boolean =>
  isObject(obj) && Object.keys(obj).length > 0

export { hasKeys }
