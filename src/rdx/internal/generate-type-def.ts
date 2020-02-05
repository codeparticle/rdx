import { pipe } from './pipe'
import { map } from './map'
import { createNames, splitBy } from './string-helpers'
import { TypeDef } from '../../types'
import { deriveInitialState } from './derive-initial-state'

/**
 * generates type definitions from the given template string.
 * these type definitions are used to create selectors, actions, reducers, and types
 */

const generateTypeDef: (typeDefString: string, prefix?: string) => TypeDef = (
  typeDefString,
  prefix
) => {
  const definition: TypeDef = {
    typeName: ``,
    actionName: ``,
    selectorName: ``,
    reducerKey: ``,
    handlerType: `default`,
    initialState: null,
    raw: typeDefString
  }

  if (!typeDefString.indexOf(`|`)) {
    return {
      ...definition,
      initialState: null
    }
  }

  const [type, typeDef, value] = typeDefString.split(`|`).map(s => s.trim())
  const names = type.length ? createNames(type, prefix) : definition

  return {
    ...definition,
    ...names,
    ...(typeDef ? { handlerType: typeDef } : {}),
    ...(typeDef ? { initialState: deriveInitialState(typeDef, value) } : {})
  } as TypeDef
}

const generateTypeDefs: (v: string) => TypeDef[] = pipe<string>(splitBy(`\n`), map(generateTypeDef))

export { generateTypeDefs, generateTypeDef }
