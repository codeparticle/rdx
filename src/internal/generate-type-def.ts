import { createNames } from './string-helpers'
import { TypeDef, HandlerTypes } from '../types'
import { deriveInitialState } from './derive-initial-state'
import { map, isObject } from '../utils'
import { apiState } from '../api'

const deriveHandlerType: (value: any) => HandlerTypes = value => {
  if (Array.isArray(value)) {
    return HandlerTypes.array
  }

  if (isObject(value)) {
    return Object.is(apiState, value) ? HandlerTypes.api : HandlerTypes.object
  }

  if (value === Number(value)) {
    return HandlerTypes.number
  }

  if (value === Boolean(value)) {
    return HandlerTypes.boolean
  }

  if (value === String(value)) {
    return HandlerTypes.string
  }

  return HandlerTypes.default
}

const generateTypeDef = prefix => ([key, val]) => {
  const definition: TypeDef = {
    typeName: ``,
    actionName: ``,
    selectorName: ``,
    reducerKey: ``,
    handlerType: HandlerTypes.default,
    initialState: null,
  }

  definition.reducerKey = key
  definition.handlerType = deriveHandlerType(val)
  definition.initialState = deriveInitialState(definition.handlerType as string, val)
  Object.assign(definition, createNames(key, prefix))

  return definition
}
/**
 * generates type definitions from the given state.
 * these type definitions are used to create selectors, actions, reducers, and types
 */

const generateTypeDefs = <T=Record<string, any>>(key: string, value: T): TypeDef[] => map(generateTypeDef(key))(Object.entries(value))

export { generateTypeDefs, generateTypeDef }
