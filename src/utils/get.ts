/**
 * Quick version of lodash.get
 * @param state state object
 * @param path array of keys that comprise the path to what we're looking for
 * @param backupValue optional backupValue
 */
import type { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import type { Split } from 'ts-toolbelt/out/String/Split'

import type { PathValue } from '../types'
import { isObject } from './is-object'

type PathOrBackup<State extends _Object, Path extends string, BackupValue = null> = [Path] extends [
  '',
]
  ? BackupValue
  : PathValue<State, Split<Path, '.'>> extends never
    ? BackupValue
    : PathValue<State, Split<Path, '.'>>

function get<State extends _Object, Path extends string = string, BackupValue = null>(
  state: State,
  path: AutoPath<State, Path>,
  backupValue?: BackupValue
): PathOrBackup<State, Path, BackupValue>
function get<State extends _Object>(
  s: State
): <Path extends string, BackupValue = null>(
  path: AutoPath<State, Path>,
  backupValue?: BackupValue
) => PathOrBackup<State, Path, BackupValue>
function get<State extends any[], Path extends string, BackupValue = null>(
  state: State,
  path: AutoPath<State, Path>,
  backupValue?: BackupValue
): PathOrBackup<State, Path, BackupValue>
function get<State extends any[]>(
  s: State
): <Path extends string, BackupValue = null>(
  path: AutoPath<State, Path>,
  backupValue?: BackupValue
) => PathOrBackup<State, Path, BackupValue>
function get(state, path?, backupValue?) {
  let currentLevel = state

  if (!state) {
    return backupValue ?? null
  }

  if (!isObject(state) && !Array.isArray(state)) {
    throw new Error(`rdx.get only works on objects and arrays, was supplied this instead: ${state}`)
  }

  if (Array.isArray(path)) {
    throw new TypeError(`rdx.get requires a string path, was supplied this instead: ${path}`)
  }

  if (typeof path === `undefined`) {
    return (p) => get(state, p, backupValue)
  }

  if (!path) {
    return state ?? backupValue ?? null
  }

  const keys = path.includes(`.`) ? path.split(`.`) : [path]

  for (let i = 0, len = keys.length; i < len; i++) {
    currentLevel = currentLevel?.[keys[i]] ?? backupValue
  }

  return currentLevel
}

export { type PathOrBackup, get }
