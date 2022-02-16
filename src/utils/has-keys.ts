/**
 * Function to see whether an object has keys
 */

import { O } from "ts-toolbelt"

const hasKeys = <Obj extends O.Object>(obj: Obj): boolean => !!Object.keys(obj).length

export {
  hasKeys,
}
