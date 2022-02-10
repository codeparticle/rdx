import { generateTypeDefs } from '../internal/generate-type-def'

import { RdxDefinition } from '../types'
import { apiState } from '../api'

const defineStateForKey = <State = any, Prefix extends string = ''>(key: string, value: State, prefix: Prefix) => {
  const defs = {
    reducerName: key || prefix,
    isApiReducer: Object.is(apiState, value),

    definitions: generateTypeDefs<State>(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      key as any,
      value,
      // @ts-expect-error string type mismatch
      prefix,
    ),
  }

  return defs
}

const defineState = <State>(state: State, prefix = ``): Array<RdxDefinition<State>> => Object.entries(state).map(
  ([key, value]) => defineStateForKey(key, value, prefix),
)

export { defineState, defineStateForKey }
