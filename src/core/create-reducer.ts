/**
 * Create a reducer that accepts a list of handlers whose function names are types that you've defined
 */

import { Reducer, KeyMirroredObject, Action } from '../types'

type ReducerHandlers<State = Record<string, any>, Types = KeyMirroredObject> = Record<
  keyof Types,
  Reducer<State>
>

const createReducer = <State = any, Types = Record<string, string>>(
  initialState: State,
  handlers: ReducerHandlers<State, Types>,
): Reducer<State, Action<any>> => {
  // eslint-disable-next-line no-prototype-builtins
  if (handlers.hasOwnProperty(undefined)) {
    throw new Error(`reducer created with undefined handler, check your type constants. handlers received: ${JSON.stringify(handlers)}`)
  }

  return (state = initialState, action): State => {
    // if is an action batch
    // loop through actions
    // and apply the first relevant handler
    if (action.type === `BATCH_ACTIONS`) {
      const batchedActions = action.payload

      if (!Array.isArray(batchedActions)) {
        return state
      }

      for (let i = 0, count = batchedActions.length; i < count; i++) {
        const currentAction = batchedActions[i]
        const type = currentAction.type

        if (handlers[type]) {
          state = handlers[type](
            state,
            currentAction,
          ) as State
        }
      }

      return state
    }

    // single action
    if (handlers[action.type]) {
      return handlers[action.type](state, action) as State
    }

    return state
  }
}

export { createReducer }
