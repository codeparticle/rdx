/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */

import { isObject } from "./is-object"
import { DelimiterCase } from "type-fest"

const get = <State>(state: State, path: DelimiterCase<string, '.'>, backupValue: any = null): any => {
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

  const keys = path.split(`.`)

  for (let i = -1, len = keys.length; ++i < len;) {
    currentLevel =  currentLevel?.[keys[i]] ?? backupValue
  }

  return currentLevel
}

export { get }
