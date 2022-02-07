import { KeyMirroredObject } from "../types"
 
const keyMirror = <K,>(keys: K[]): KeyMirroredObject<K> => {
  const acc = Object.create(null)

  if (!keys?.length) {
    return acc
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    if (`${keys[i]}`.length) {
      // eslint-disable-next-line
      acc[`${keys[i]}` as string] = `${keys[i]}`
    }

  }

  return acc
}

export { keyMirror }
