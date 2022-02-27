import type { A, L, O } from "ts-toolbelt"
import { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'
import type { Split } from "ts-toolbelt/out/String/Split"
import { Join as _Join } from 'type-fest'
import { isObject } from "./is-object"

/**
 * Updates an object or array with the given dot-separated path and value.
 * like ramda's assocPath, but without the need to use ramda or array paths.
 * returns the entire object back. If the path is not found, it will be created.
 * @param {object|array} obj
 * @param {string} path
 * @param {any} val
 * @returns {object}
 */
function setPath <Obj extends O.Object, Path extends string | string[], Value = any> (obj: Obj, path: AutoPath<Obj, Path extends string[] ? _Join<Path, '.'> : Path>, val: Value):
[Path] extends [''] ? Obj :
  Path extends string[] ? O.P.Update<Obj, Path, Value> :
    Path extends string ? O.P.Update<Obj, Split<Path, '.'>, Value> : Obj
function setPath <Obj extends O.Object, Path extends string | string[], Value = any> (obj: Obj, path: AutoPath<Obj, Path extends string[] ? _Join<Path, '.'> : Path> | Path, val: Value):
[Path] extends [''] ? Obj :
  Path extends string[] ? O.P.Update<Obj, Path, Value> :
    Path extends string ? O.P.Update<Obj, Split<Path, '.'>, Value> : Obj
function setPath <Obj extends L.List<A.Key>, Path extends string | string[], Value = any> (obj: Obj, path: AutoPath<Obj, Path extends string[] ? _Join<Path, '.'> : Path> | Path, val: Value):
[Path] extends [''] ? Obj :
  Path extends string[] ? O.P.Update<Obj, Path, Value> :
    Path extends string ? O.P.Update<Obj, Split<Path, '.'>, Value> : Obj
function setPath (obj, path, val) {
  if (!path) {
    return obj
  }

  const pathArray = `${path}`.includes(`.`)
    ? `${path}`.split(`.`)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    : [].concat(path)

  if (pathArray.length === 0) {
    return val
  }

  const [key, ...tail] = pathArray

  if (tail.length) {
    const nextObj = isObject(obj) && obj?.[key] ? obj[key] : Array.isArray(obj) ? [] : {}

    val = setPath(nextObj, tail, val)
  }

  // below is a check to make sure that the current path section is an integer for array access.
  if ((parseInt(key, 10) << 0) === parseInt(key, 10) && Array.isArray(obj)) {
    // @ts-expect-error array types
    const arr = [].concat(obj)

    arr[key] = val

    return arr
  }

  const result = {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Object.keys(obj).forEach(k => {
    result[k] = obj[k]
  })

  result[key] = val

  return result
}

export { setPath }
