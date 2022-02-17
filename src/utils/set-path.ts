import type { O } from "ts-toolbelt"
import type { Split } from "ts-toolbelt/out/String/Split"
import type { ReflectedStatePath } from "../types"
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
const setPath = <Obj extends O.Object, Path extends string = ReflectedStatePath<Obj>, Value = any>(obj: Obj, path: Path, val: Value): [Path] extends [''] ? Obj : O.P.Update<Obj, Split<Path, '.'>, Value> => {
  const pathArray: string[] = `${path}`.includes(`.`)
    ? `${path}`.split(`.`)
    // @ts-expect-error array wants a type due to strict null types
    : [].concat(path)

  if (pathArray.length === 0) {
    // eslint-disable-next-line
    // @ts-ignore for performance reasons since update is an expensive type
    return val
  }

  const [key, ...tail] = pathArray

  if (tail.length) {
    const nextObj: O.Object | any[] = isObject(obj) && obj?.[key] ? obj[key] : Array.isArray(obj) ? [] : {}

    // @ts-expect-error val may not be array at the top level, but we know pathArray is
    val = setPath(nextObj, tail, val)
  }

  // below is a check to make sure that the current path section is an integer for array access.
  if ((parseInt(key, 10) << 0) === parseInt(key, 10) && Array.isArray(obj)) {
    // @ts-expect-error array types
    const arr = [].concat(obj)

    arr[key] = val

    // @ts-expect-error array types
    return arr
  }

  const result = {}

  Object.keys(obj).forEach(k => {
    result[k] = obj[k]
  })

  result[key] = val

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return result as O.P.Update<Obj, Split<Path, '.'>, Value>
}

export { setPath }
