/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type {
  ReducerHandlers,
  RdxAction,
} from '../types'
// this is an enum, so we can't use import type
import { createReducer } from './create-reducer'
import { ReducersMapObject } from 'redux'
import {
  createReducerHandlers,
} from '../internal/reducer-handlers'
import type { O } from 'ts-toolbelt'
import { createTypeDefinition, formatTypeString } from '../internal'

function createAutoReducer<
  State extends O.Object,
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

const extendReducers = <State>(
  currentReducers: ReducersMapObject<State>,
  ...reducers: Array<ReducersMapObject<any, RdxAction<any, any>>>
) => Object.assign({}, currentReducers, ...reducers) as ReducersMapObject<State>

export {
  extendReducers,
  createAutoReducer,
}

