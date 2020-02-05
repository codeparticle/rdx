import { ConditionalFilter } from '../../../types'

export function takeUntil<T = string>(condition: ConditionalFilter<T[]>) {
  return collection => {
    let index = 0
    const coll = [...collection]

    while (index++ < coll.length) {
      if (condition(coll[index], index, coll)) {
        return typeof collection === `string` ? coll.join(``).slice(0, index) : coll.slice(0, index)
      }
    }
  }
}
