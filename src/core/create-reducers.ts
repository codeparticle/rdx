/* eslint-disable eslint-comments/disable-enable-pair, @typescript-eslint/no-unsafe-argument */
import { ReducersMapObject } from 'redux'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import { createTypeDefinition, formatTypeString } from '../internal'
import { createReducerHandlers } from '../internal/reducer-handlers'
import type { RdxAction, RdxOutput, RdxReducer, ReducerHandlers } from '../types'
// this is an enum, so we can't use import type
import { createReducer } from './create-reducer'

function createAutoReducer<State extends _Object, Prefix extends string>(
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

  return createReducer(stateObject, stateHandlers)
}

const extendReducers = <State extends _Object, ExtendedState extends _Object>(
  currentReducers: RdxOutput<State, ''>['reducers'],
  reducers: { [K in keyof ExtendedState]: RdxReducer<ExtendedState[K]> },
): ReducersMapObject<State & Partial<ExtendedState>, RdxAction> =>
  Object.assign({}, currentReducers, reducers)

export { createAutoReducer, extendReducers }
