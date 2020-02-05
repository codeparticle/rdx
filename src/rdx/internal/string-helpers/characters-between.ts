import { pipe } from '../pipe'
import { takeAfter } from './take-after'
import { takeUntil } from './take-until'

export const charactersBetween = (char1, char2) =>
  pipe(
    takeAfter(char => char === char1),
    takeUntil(char => char === char2)
  )
