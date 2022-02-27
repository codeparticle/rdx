/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
import { isObject } from './is-object'

import type { PathsOf } from "../types"
import type { O } from 'ts-toolbelt'
import type { Split } from 'ts-toolbelt/out/String/Split'
import { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'

type PathOrBackup<State extends O.Object, Path extends string, BackupValue = null> = O.Path<State, Split<Path, '.'>> extends never ? BackupValue : O.Path<State, Split<Path, '.'>>

function get<State extends O.Object, Path extends string = PathsOf<State>, BackupValue = null> (
  state: State,
  path: AutoPath<State, Path>,
  backupValue?: BackupValue,
): PathOrBackup<State, Path, BackupValue>
function get (
  state,
  path,
  backupValue,
) {
  let currentLevel = state

  if (!state) {
    return (backupValue ?? null)
  }

  if (!isObject(state)) {
    // eslint-disable-next-line
    throw new Error(`rdx.get only works on objects, was supplied this instead: ${state}`)
  }

  if (!path) {
    return (state ?? backupValue ?? null)
  }

  const keys = path.includes(`.`) ? path.split(`.`) : [path]

  for (let i = 0, len = keys.length; i < len; i++) {
    currentLevel = (currentLevel?.[keys[i]]) ?? backupValue
  }

  return currentLevel
}

export type { PathOrBackup }
export { get }
