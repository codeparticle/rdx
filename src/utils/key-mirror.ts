import { KeyMirroredObject } from '../types'

function keyMirror<Ks extends string[]>(keys: Ks): KeyMirroredObject<Ks>
function keyMirror<Ks extends readonly string[]>(keys: Ks): KeyMirroredObject<Ks>
function keyMirror(keys) {
  const acc = {}

  if (!keys?.length) {
    return acc
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = `${keys[i]}`?.trim()

    if (key) {
      acc[key] = key
    } else {
      continue
    }
  }

  return acc
}

export { keyMirror }
