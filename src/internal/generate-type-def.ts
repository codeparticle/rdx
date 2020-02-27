import { createNames } from './string-helpers'
import { TypeDef } from '../types'
import { deriveInitialState } from './derive-initial-state'
import { map, isObject } from '../utils'
import { apiState } from '../api'

const deriveHandlerType: (value: any) => TypeDef['handlerType'] = value => {
  if (Array.isArray(value)) {
    return `array`
  }

  if (isObject(value)) {
    return Object.is(apiState, value) ? `api` : `object`
  }

  if (value === Number(value)) {
    return `number`
  }

  if (value === Boolean(value)) {
    return `boolean`
  }

  if (value === String(value)) {
    return `string`
  }

  return `default`
}

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
  definition.handlerType = deriveHandlerType(val)
  definition.initialState = deriveInitialState(definition.handlerType, val)
  Object.assign(definition, createNames(key, prefix))

  return definition
}
/**
 * generates type definitions from the given state.
 * these type definitions are used to create selectors, actions, reducers, and types
 */

const generateTypeDefs = <T=object>(key: string, value: T): TypeDef[] => map(generateTypeDef(key))(Object.entries(value))

export { generateTypeDefs, generateTypeDef }
