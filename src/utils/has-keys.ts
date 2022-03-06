/**
 * Function to see whether an object has keys
 */

import { isObject } from "./is-object"
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

const hasKeys = <Obj extends _Object>(obj: Obj): boolean => isObject(obj) && !!Object.keys(obj).length

export {
  hasKeys,
}
