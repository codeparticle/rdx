import { createNames } from './string-helpers'
import { TypeDef } from '../types'
import { deriveInitialState } from './derive-initial-state'
import { map } from '../utils/map'

const generateTypeDef = prefix => ([key, val]) => {
  const definition: TypeDef = {
    typeName: ``,
    actionName: ``,
    selectorName: ``,
    reducerKey: ``,
    handlerType: `default`,
    initialState: null,
  }

  definition.reducerKey = key
  definition.handlerType = (Array.isArray(val) ? `array` : typeof val) as TypeDef['handlerType']
  definition.initialState = deriveInitialState(definition.handlerType, val)
  Object.assign(definition, createNames(key, prefix))

  return definition as TypeDef
}
/**
 * generates type definitions from the given state.
 * these type definitions are used to create selectors, actions, reducers, and types
 */

const generateTypeDefs = <T=object>(key: string, value: T): TypeDef[] => map(generateTypeDef(key))(Object.entries(value))

export { generateTypeDefs, generateTypeDef }
