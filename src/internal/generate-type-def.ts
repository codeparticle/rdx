import { createNames } from './string-helpers'
import { HandlerTypes, Paths, TypeDef } from '../types'
import { deriveInitialState } from './derive-initial-state'
import { isObject } from '../utils'
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

const generateTypeDef = <Prefix extends string>(key: string, val: any, prefix: Prefix) => {
  const definition: Partial<TypeDef> = {}

  definition.reducerKey = key
  definition.handlerType = deriveHandlerType(val)
  definition.initialState = deriveInitialState(definition.handlerType, val)

  return Object.assign(
    {},
    definition,
    createNames<string, Prefix>(
      key || prefix,
      (key && prefix ? (prefix) : `` as Prefix),
    ),
  ) as TypeDef
}
/**
 * generates type definitions from the given state.
 * these type definitions are used to create selectors, actions, reducers, and types
 */

const generateTypeDefs = <State = any, Prefix extends string = ''>(key: keyof Paths<State, 0>, value: any, prefix: Prefix): TypeDef[] => {
  return [generateTypeDef<Prefix>(key as string, value, prefix)]
}

export { generateTypeDefs, generateTypeDef }
