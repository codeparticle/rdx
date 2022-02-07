/**
 * generates a list of list paths for every possible path of an object
 * @param root root object
 */

import { O } from "ts-toolbelt"
import type { Paths } from "../types"
import { isObject } from "./is-object"
import { trampoline } from "./trampoline"

const getNextLevelOfObjectPaths = <Obj extends object,>(
  root: Obj,
  currentPathToExtend?: string,
  existingPaths: string[] = [], 
  pendingPaths: [string, O.Object][] = [],
) => {

  const paths: string[] = existingPaths
  const pending: [string, O.Object][] = pendingPaths
  const keys = Object.keys(root)
  const isPathExtension = !!currentPathToExtend
  const extension = currentPathToExtend.startsWith(`.`) ? currentPathToExtend.slice(1) : currentPathToExtend

  if (!keys.length && !pending.length) {
    return []
  }

  if (isPathExtension) {
    paths.push(extension)
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const value = root[key]

    if (isObject(value)) {
      pending.push([`${extension}.${key}`, value as O.Object])
    } else {
      paths.push( isPathExtension ? `${extension}.${key}` : key )
    }
  }

  if ( !pending.length ) {

    return paths as Paths<Obj, 5, '.'>[]
  } else {  
    const [nextKey, nextRoot] = pending.pop()

    return () => getNextLevelOfObjectPaths(
      nextRoot,
      nextKey,
      paths,
      pending,
    )
  }
}

const _getObjectPaths = trampoline(getNextLevelOfObjectPaths as unknown as <Obj extends O.Object>(...args: any[]) => Paths<Obj, 5, '.'>[])

function getObjectPaths<Obj extends O.Object> (
  root: Obj,
  currentPathToExtend = ``, 
  existingPaths: Paths<Obj, 5, '.'>[] = [],
  pendingPaths: O.Object[] = [],
): Paths<Obj, 5, '.'>[] {
  return _getObjectPaths(root, currentPathToExtend, existingPaths, pendingPaths) as unknown as Paths<Obj, 5, '.'>[]
}

export { 
  getObjectPaths,
}
