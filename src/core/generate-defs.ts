import { isObject } from '../utils/is-object'
import { generateTypeDef, generateTypeDefs } from '../internal/generate-type-def'

import { RdxDefinition } from '../types'

const defineState = <S>(state: S): RdxDefinition[] => Object.entries(state).map(
  ([key, value]) => {

    const defs =  {
      reducerName: key,
      definitions: isObject(value)
        ? generateTypeDefs(key, value)
        : [generateTypeDef(``)([key, value])],
    }

    return defs
  },
)

export { defineState }
