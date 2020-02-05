import { pipe } from '../pipe'
import { removePaddingSpaces } from './remove-padding-spaces'

export const isReducerName: (s: string) => boolean = pipe(
  removePaddingSpaces,
  s => s.startsWith(`[`) && s.endsWith(`]`)
) as (s: string) => boolean
