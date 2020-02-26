import { isObject } from '../utils/is-object'
import { generateTypeDef, generateTypeDefs } from '../internal/generate-type-def'

import { RdxDefinition } from '../types'
import { apiState } from '../api'

const defineState = <S>(state: S): RdxDefinition[] => Object.entries(state).map(
  ([key, value]) => {

    const defs =  {
      reducerName: key,
      isApiReducer: Object.is(apiState, value),
      definitions: isObject(value)
        ? generateTypeDefs(key, value)
        : [generateTypeDef(``)([key, value])],
    }

    return defs
  },
)

export { defineState }
