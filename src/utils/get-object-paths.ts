/**
 * generates a list of list paths for every possible path of an object
 * @param root root object
 */

import { O } from "ts-toolbelt"
import type { ReflectedStatePath } from "../types"
import { isObject } from "./is-object"
import { trampoline } from "./trampoline"

const getNextLevelOfObjectPaths = <Obj extends object>(
  root: Obj,
  currentPathToExtend?: string,
  existingPaths: string[] = [],
  pendingPaths: Array<[string, O.Object]> = [],
) => {
  const paths: string[] = existingPaths
  const pending: Array<[string, O.Object]> = pendingPaths
  const keys = Object.keys(root)
  const isPathExtension = !!currentPathToExtend

  const extension = currentPathToExtend?.startsWith(`.`)
    ? currentPathToExtend.slice(1)
    : currentPathToExtend

  if ((keys.length === 0) && (pending.length === 0)) {
    return []
  }

  if (isPathExtension) {
    paths.push(extension as string)
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const value = root[key]

    if (isObject(value)) {
      pending.push([`${extension}.${key}`, value as O.Object])
    } else {
      paths.push(isPathExtension ? `${extension}.${key}` : key)
    }
  }

  if (pending.length === 0) {
    return paths.filter(Boolean) as Array<ReflectedStatePath<Obj>>
  } else {
    // @ts-expect-error iterator type
    const [nextKey, nextRoot] = pending.pop()

    return () => getNextLevelOfObjectPaths(
      nextRoot,
      nextKey as string,
      paths,
      pending,
    )
  }
}

const _getObjectPaths = trampoline(getNextLevelOfObjectPaths as unknown as <Obj extends O.Object>(...args: any[]) => Array<ReflectedStatePath<Obj>>)

function getObjectPaths<Obj extends O.Object> (
  root: Obj,
  currentPathToExtend = ``,
  existingPaths: Array<ReflectedStatePath<Obj>> = [],
  pendingPaths: O.Object[] = [],
): Array<ReflectedStatePath<Obj>> {
  return _getObjectPaths(root, currentPathToExtend, existingPaths, pendingPaths) as unknown as Array<ReflectedStatePath<Obj>>
}

export {
  getObjectPaths,
}
