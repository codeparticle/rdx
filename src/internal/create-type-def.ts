import { createHandlerKeys } from './string-helpers'
import { HandlerTypes, ReducersMapObjectDefinition, TypeDef } from '../types'
import { safelyDefineInitialState } from './derive-initial-state'
import { hasKeys, isObject } from '../utils'
import { apiState } from '../api'
import { O } from 'ts-toolbelt'
import { Cast } from 'ts-toolbelt/out/Any/Cast'

const deriveHandlerType: (value: any) => HandlerTypes = value => {
  if (Array.isArray(value)) {
    return HandlerTypes.array
  }

  if (isObject(value)) {
    return Object.is(apiState, value) ? HandlerTypes.api : HandlerTypes.object
  }

  if (value === Number(value) && !isNaN(Number(value))) {
    return HandlerTypes.number
  }

  if (value === Boolean(value)) {
    return HandlerTypes.boolean
  }

  if (value === String(value)) {
    return HandlerTypes.string
  }

  // this becomes a reducer that replaces the entire state - if there are null values, this gets applied
  return HandlerTypes.default
}

const createTypeDefinition = <Value extends NonNullable<any>, Key extends string = string, Prefix extends string = string>(val: Value, key: Key, prefix: Prefix, path = ``): TypeDef<Value> => {
  const reducerKey = key
  const handlerType = deriveHandlerType(val)
  const initialState = safelyDefineInitialState(handlerType, val)
  const isApiReducer = handlerType === HandlerTypes.api
  const _path = path ? `${path}.${key}` : `${key}`

  type ObjectValue = Cast<Value, O.Object>

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const children = isObject(initialState) && hasKeys(initialState)
    ? createReducerObjectDefinition(initialState as ObjectValue, _path, prefix)
    : {}

  const def = Object.assign(
    {
      reducerKey,
      path: _path,
      handlerType,
      initialState,
      isApiReducer,
      children,
    },
    createHandlerKeys<string, Prefix>(
      _path || `${prefix}.${key}`,
      key && prefix ? prefix : `` as Prefix,
    ),
  ) as unknown as TypeDef<Value>

  return def
}
/**
 * creates type definitions from the given state.
 * these type definitions are used to create reducers and reducer map objects
 */

const createReducerObjectDefinition = <Value extends O.Object, StatePath extends string>(value: Value, path: StatePath, prefix = ``): ReducersMapObjectDefinition<Value> => {
  const definitionsMap = {}

  const keys = Object.keys(value)

  let i = keys.length

  while (i--) {
    const key = keys[i]
    const val = value[key]

    definitionsMap[keys[i]] = createTypeDefinition(val, key, prefix, path)
  }

  return definitionsMap
}

export { createReducerObjectDefinition, createTypeDefinition }
