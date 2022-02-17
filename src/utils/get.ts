/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
import { isObject } from './is-object'

import type { ReflectedStatePath, StateSelection } from "../types"
import { O } from 'ts-toolbelt'
import { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'
import { Split } from 'ts-toolbelt/out/String/Split'
import { Path as ValueAtPath } from 'ts-toolbelt/out/Object/Path'
import { Tail } from 'ts-toolbelt/out/List/Tail'

const get = <State extends O.Object, Path extends string = ReflectedStatePath<State>, BackupValue = null>(
  state: State,
  path: AutoPath<State, Path>,
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
    currentLevel = (currentLevel?.[keys[i]] as ValueAtPath<State, Tail<Split<Path, '.'>>>) ?? backupValue
  }

  // @ts-expect-error excessive depth warning BC TS doesn't know about the depth
  return currentLevel
}

export { get }
