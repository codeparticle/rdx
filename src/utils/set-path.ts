import { O } from "ts-toolbelt"
import { ReflectedStatePath } from "../types"

const setPath = <Obj extends O.Object, Path extends string = ReflectedStatePath<Obj>>(obj: Obj, path: Path, val: any): Obj => {
  const pathArray: string[] = `${path}`.includes(`.`)
    ? `${path}`.split(`.`)
    // @ts-expect-error array wants a type
    : [].concat(path)

  if (pathArray.length === 0) {
    // eslint-disable-next-line
    // @ts-ignore -- this is for performance
    return val// eslint-disable-line
  }

  const key = pathArray[0]

  if (pathArray.length > 1) {
    const nextObj = (obj != null && key in obj) ? obj[key] : {}

    // eslint-disable-next-line
    // @ts-ignore -- this is for performance
    val = setPath(nextObj, Array.prototype.slice.call(pathArray, 1), val)
  }

  // eslint-disable-next-line
  // @ts-ignore
  const result = { ...obj, [key]: val }

  return result
}

export { setPath }
