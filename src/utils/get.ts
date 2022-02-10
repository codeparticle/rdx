/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
import { isObject } from './is-object'

import type { PickFrom } from "../types"
import { O } from 'ts-toolbelt'
import { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'

const get = <State extends O.Object, Path extends string = '', BackupValue = any>(
  state: State,
  path: AutoPath<State, Path>,
  backupValue?: BackupValue,
): PickFrom<State, Path, BackupValue> => {
  let currentLevel = state

  if (!state) {
    return (backupValue ?? null) as PickFrom<State, Path, BackupValue>
  }

  if (!isObject(state)) {
    // eslint-disable-next-line
    throw new Error(`rdx.get only works on objects, was supplied this instead: ${state}`)
  }

  if (!path) {
    return (state ?? backupValue ?? null) as PickFrom<State, Path, BackupValue>
  }

  const keys = path.includes(`.`) ? path.split(`.`) : [path]

  for (let i = 0, len = keys.length; i < len; i++) {
    currentLevel = currentLevel?.[keys[i]] ?? backupValue
  }

  return currentLevel as PickFrom<State, Path, BackupValue>
}

export { get }
