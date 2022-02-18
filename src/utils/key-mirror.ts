import { KeyMirroredObject } from "../types"

function keyMirror<Ks extends readonly string[]> (keys: Ks): KeyMirroredObject<Ks>
function keyMirror<Ks extends string[]> (keys: Ks): KeyMirroredObject<Ks> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const acc = {} as KeyMirroredObject<Ks>

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

