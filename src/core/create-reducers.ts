/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type {
  ReducerHandlers,
  RdxAction,
  RdxOutput,
  RdxReducer,
} from '../types'
// this is an enum, so we can't use import type
import { createReducer } from './create-reducer'
import { ReducersMapObject } from 'redux'
import {
  createReducerHandlers,
} from '../internal/reducer-handlers'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import { createTypeDefinition, formatTypeString } from '../internal'

function createAutoReducer<
  State extends _Object,
  Prefix extends string,
> (
  stateObject: State,
  prefix: Prefix,
) {
  const stateHandlers: ReducerHandlers<State> = {}

  const bindHandlersToState = createReducerHandlers(stateObject)

  const keys = Object.keys(stateObject)
  let i = keys.length

  while (i--) {
    const key = keys[i]

    const value = stateObject[key]

    const typeDefinition = createTypeDefinition(value, key, prefix)

    Object.assign(stateHandlers, bindHandlersToState(typeDefinition))
  }

  if (prefix) {
    Object.assign(stateHandlers, {
      [formatTypeString(``, prefix, true)]: () => stateObject,
    })
  }

  const result = createReducer(stateObject, stateHandlers)

  return result
}

const extendReducers = <State extends _Object, ExtendedState extends _Object>(
  currentReducers: RdxOutput<State, ''>['reducers'],
  reducers: { [K in keyof ExtendedState]: RdxReducer<ExtendedState[K]>; },
): ReducersMapObject<State & Partial<ExtendedState>, RdxAction> => Object.assign({}, currentReducers, reducers)

export {
  extendReducers,
  createAutoReducer,
}
