import { ConditionalFilter } from '../../../types'

export function dropUntil<T = string>(condition: ConditionalFilter<T[]>) {
  return collection => {
    let index = -1
    const coll = [...collection]

    while (index++ < coll.length) {
      if (condition(coll[index], index, coll)) {
        if (typeof collection === `string`) {
          return coll.join(``).slice(index)
        } else {
          return coll.slice(index)
        }
      }
    }
  }
}
