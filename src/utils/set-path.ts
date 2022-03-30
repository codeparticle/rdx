import type { Key } from 'ts-toolbelt/out/Any/Key'
import { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'
import type { List } from 'ts-toolbelt/out/List/List'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import type { Update } from 'ts-toolbelt/out/Object/P/Update'
import type { Split } from 'ts-toolbelt/out/String/Split'
import { Join as _Join } from 'type-fest'

import { isObject } from './is-object'

/**
 * Updates an object or array with the given dot-separated path and value.
 * like ramda's assocPath, but without the need to use ramda or array paths.
 * returns the entire object back. If the path is not found, it will be created.
 * @param {object|array} obj
 * @param {string} path
 * @param {any} val
 * @returns {object}
 */
function setPath<Obj extends _Object, Path extends string | string[], Value = any>(
  obj: Obj,
  path: AutoPath<Obj, Path extends string[] ? _Join<Path, '.'> : Path>,
  val: Value
): [Path] extends ['']
  ? Obj
  : Path extends string[]
    ? Update<Obj, Path, Value>
    : Path extends string
      ? Update<Obj, Split<Path, '.'>, Value>
      : Obj
function setPath<Obj extends _Object, Path extends string | string[], Value = any>(
  obj: Obj,
  path: AutoPath<Obj, Path extends string[] ? _Join<Path, '.'> : Path> | Path,
  val: Value
): [Path] extends ['']
  ? Obj
  : Path extends string[]
    ? Update<Obj, Path, Value>
    : Path extends string
      ? Update<Obj, Split<Path, '.'>, Value>
      : Obj
function setPath<Obj extends List<Key>, Path extends string | string[], Value = any>(
  obj: Obj,
  path: AutoPath<Obj, Path extends string[] ? _Join<Path, '.'> : Path> | Path,
  val: Value
): [Path] extends ['']
  ? Obj
  : Path extends string[]
    ? Update<Obj, Path, Value>
    : Path extends string
      ? Update<Obj, Split<Path, '.'>, Value>
      : Obj
function setPath(obj, path, val) {
  if (!path) {
    return obj
  }

  const pathArray = `${path}`.includes(`.`) ? `${path}`.split(`.`) : [path].flat()

  if (pathArray.length === 0) {
    return val
  }

  const [key, ...tail] = pathArray

  if (tail.length > 0) {
    const nextObj = isObject(obj) && obj?.[key] ? obj[key] : Array.isArray(obj) ? [] : {}

    val = setPath(nextObj, tail, val)
  }

  // below is a check to make sure that the current path section is an integer for array access.
  if (Math.trunc(parseInt(key, 10)) === parseInt(key, 10) && Array.isArray(obj)) {
    const arr = [obj].flat()

    arr[key] = val

    return arr
  }

  const result = {}

  Object.keys(obj).forEach((k) => {
    result[k] = obj[k]
  })

  result[key] = val

  return result
}

export { setPath }
