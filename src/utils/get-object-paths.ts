/**
 * creates a list of list paths for every possible path of an object
 * @param root root object
 */

import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import type { PathsOf } from '../types'
import { isObject } from './is-object'
import { trampoline } from './trampoline'

function getNextLevelOfObjectPaths<Obj extends object, DepthLimit extends number = 6>(
  root: Obj,
  currentPathToExtend?: string,
  existingPaths?: string[],
  pendingPaths?: Array<[string, _Object]>
): Array<PathsOf<Obj, DepthLimit>>
function getNextLevelOfObjectPaths(
  root,
  currentPathToExtend = ``,
  existingPaths: string[] = [],
  pendingPaths: Array<[string, _Object]> = [],
) {
  const paths = existingPaths
  const pending = pendingPaths
  const keys = Object.keys(root)
  const isPathExtension = !!currentPathToExtend

  const extension = currentPathToExtend?.startsWith(`.`)
    ? currentPathToExtend.slice(1)
    : currentPathToExtend

  if (keys.length === 0 && pending.length === 0) {
    return []
  }

  if (isPathExtension) {
    paths.push(extension)
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const value = root[key]

    if (isObject(value)) {
      pending.push([`${extension}.${key}`, value])
    } else {
      paths.push(isPathExtension ? `${extension}.${key}` : key)
    }
  }

  if (pending.length === 0) {
    return paths.filter(Boolean)
  } else {
    // @ts-expect-error iterator spread types
    const [nextKey, nextRoot] = pending.pop()

    return () => getNextLevelOfObjectPaths(nextRoot, nextKey, paths, pending)
  }
}

const _getObjectPaths = trampoline(getNextLevelOfObjectPaths)

function getObjectPaths<
  /**
   * The object that you're getting paths for.
   * This can be inferred automatically, unless you're specifying a depth limit.
   */
  Obj extends _Object,
  /**
   * The depth limit of the paths as far as typescript should care.
   * If you know that your object is only 4 levels deep, you would set this to 4.
   */
  DepthLimit extends number = 6,
>(
  root: Obj,
  currentPathToExtend?: string,
  existingPaths?: string[],
  pendingPaths?: _Object[]
): Array<PathsOf<Obj, DepthLimit>>
function getObjectPaths(root, currentPathToExtend, existingPaths, pendingPaths) {
  return _getObjectPaths(root, currentPathToExtend || ``, existingPaths || [], pendingPaths || [])
}

export { getObjectPaths }
