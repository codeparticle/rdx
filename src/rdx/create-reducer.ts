/**
 * Create a reducer that accepts a list of handlers whose function names are types that you've defined
 */

import { Action } from '../types'

type Reducer<S> = (state: S, action: Action<any>) => S

type ReducerHandlers<S = any, T = Record<string, string>, K extends keyof T = keyof T> = Record<
  K,
  Reducer<S>
>

type ReducerCreator<State = Record<string, any>, Types = Record<string, string>> = (
  initialState: State,
  handlers: ReducerHandlers<State, Types>
) => Reducer<State>

const createReducer: <S, T, K extends keyof T = keyof T>(
  i: S,
  k: ReducerHandlers<S, T, K>
) => Reducer<S> = (initialState, handlers) => {
  // eslint-disable-next-line no-prototype-builtins
  if (handlers.hasOwnProperty(undefined)) {
    console.error(`reducer created with undefined handler, check your type constants`)
  }

  return (state = initialState, action) => {
    // if is an action batch
    // loop through actions
    // and apply the first relevant handler
    if (action.type === `BATCH_ACTIONS`) {
      const batchedActions = action.payload

      if (!Array.isArray(batchedActions)) return state

      for (const currentAction of batchedActions) {
        if (handlers[currentAction.type]) {
          return handlers[currentAction.type](state, currentAction)
        }
      }
      // single action
    } else if (handlers[action.type]) {
      return handlers[action.type](state, action)
    }

    return state
  }
}

export { createReducer }
