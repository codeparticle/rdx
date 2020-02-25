/**
 * Create a reducer that accepts a list of handlers whose function names are types that you've defined
 */

import { Reducer, KeyMirroredObject } from '../types'

type ReducerHandlers<State = Record<string, any>, Types = KeyMirroredObject> = Record<
  keyof Types,
  Reducer<State>
>

const createReducer = <State = any, Types = Record<string, string>>(
  initialState: State,
  handlers: ReducerHandlers<State, Types>,
): Reducer<State> => {
  // eslint-disable-next-line no-prototype-builtins
  if (handlers.hasOwnProperty(undefined)) {
    console.error(`reducer created with undefined handler, check your type constants`)
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

        if (handlers[currentAction.type]) {
          return handlers[currentAction.type](
            state,
            currentAction,
          )
        }
      }
    }

    // single action
    if (handlers[action.type]) {
      return handlers[action.type](state, action)
    }

    return state
  }
}

export { createReducer }
