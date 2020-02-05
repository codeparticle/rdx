import { ConditionalFilter } from '../../../types'

export function takeUntilIncluding<T = string>(condition: ConditionalFilter<T[]>) {
  return collection => {
    let index = 0
    const coll = [...collection]

    while (index++ < coll.length) {
      if (condition(coll[index], index, coll)) {
        if (typeof collection === `string`) {
          return coll.join(``).slice(0, index + 1)
        } else {
          return coll.slice(0, index + 1)
        }
      }
    }
  }
}
