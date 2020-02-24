import { KeyMirroredObject } from "../types"

const keyMirror = <K>(keys: K extends Array<any> ? K : K[]): KeyMirroredObject | {} => {
  const acc = {}

  if (!keys?.length) {
    return acc
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    if (`${keys[i]}`.length) {
      acc[`${keys[i]}`] = `${keys[i]}`
    }

  }

  return acc
}

export { keyMirror }
