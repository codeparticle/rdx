/**
 * function to return a copy of an object with the specified keys omitted
 */

import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import type { PathsOf } from '../types'

const omit = <Obj extends _Object, Keys extends Array<PathsOf<Obj, 0>>>(keys: Keys, obj: Obj) => {
  const result = { ...obj }

  for (let i = 0, len = keys.length; i < len; i++) {
    // immutability is preserved
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete result[keys[i]]
  }

  return result as Omit<Obj, keyof typeof keys>
}

export { omit }
