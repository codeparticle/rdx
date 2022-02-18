/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
import { isObject } from './is-object'

import type { ReflectedStatePath, StateSelection } from "../types"
import type { O, F } from 'ts-toolbelt'
import type { Split } from 'ts-toolbelt/out/String/Split'
import type { Tail } from 'ts-toolbelt/out/List/Tail'

const get = <State extends O.Object, Path extends string = ReflectedStatePath<State>, BackupValue = null>(
  state: State,
  path: F.AutoPath<State, Path>,
  backupValue?: BackupValue,
): StateSelection<State, Path, BackupValue> => {
  let currentLevel = state

  if (!state) {
    // @ts-expect-error ---
    return (backupValue ?? null)
  }

  if (!isObject(state)) {
    // eslint-disable-next-line
    throw new Error(`rdx.get only works on objects, was supplied this instead: ${state}`)
  }

  if (!path) {
    // @ts-expect-error ---
    return (state ?? backupValue ?? null)
  }

  const keys = path.includes(`.`) ? path.split(`.`) : [path]

  for (let i = 0, len = keys.length; i < len; i++) {
    // @ts-expect-error ---
    currentLevel = (currentLevel?.[keys[i]] as O.Path<State, Tail<Split<Path, '.'>>>) ?? backupValue
  }

  // @ts-expect-error excessive depth warning BC TS doesn't know about the depth
  return currentLevel
}

export { get }
