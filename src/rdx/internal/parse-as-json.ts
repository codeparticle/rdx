import { pipe } from './pipe'

const parseAsJson = pipe(
  value => new Function(`return (${value})`)(void 0),
  JSON.stringify,
  JSON.parse,
)

export { parseAsJson }
