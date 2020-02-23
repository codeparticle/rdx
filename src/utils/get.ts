/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */

import { valueOr } from "./value-or"
import { isObject } from "util"

const get = <State>(state: State, path: string[], backupValue: any = null) => {
  let currentLevel = state

  if (!state) {
    return backupValue
  }

  if (!isObject(state)) {
    throw new Error(`rdx.get only works on objects, was supplied this instead: ${state}`)
  }

  if (!path) {
    return state ?? backupValue
  }

  for (let i = -1, len = path.length; ++i < len;) {
    currentLevel =  valueOr(currentLevel?.[path[i]], backupValue)
  }

  return currentLevel
}

export { get }