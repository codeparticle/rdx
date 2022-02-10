/**
 * function to return a copy of an object with the specified keys omitted
 */

import type { Paths } from "../types"
import { O } from 'ts-toolbelt'

const omit = <Obj extends O.Object, Keys extends Array<Paths<Obj, 0, ''>>>(keys: Keys, obj: Obj) => {
  const result = { ...obj }

  for (let i = 0, len = keys.length; i < len; i++) {
    delete result[keys[i]]
  }

  return result as Omit<Obj, keyof typeof keys>
}

export { omit }
