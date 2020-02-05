import { ConditionalFilter } from '../../../types'
import { dropUntil } from './drop-until'
import { pipe } from '../pipe'

export function takeAfter<T = string>(condition: ConditionalFilter<T[]>) {
  return pipe(dropUntil(condition), s => s.slice(1))
}
