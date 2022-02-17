/**
 * Function to see whether an object has keys
 */

import { O } from "ts-toolbelt"
import { isObject } from "./is-object"

const hasKeys = <Obj extends O.Object>(obj: Obj): boolean => isObject(obj) && !!Object.keys(obj).length

export {
  hasKeys,
}
