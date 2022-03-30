/**
 * Create a reducer that accepts a list of handlers whose function names are types that you've defined
 */

import type { RdxAction } from '../types'
import { ReducerHandlers } from '../types'

const createReducer = <State = any>(initialState: State, handlers: ReducerHandlers<State>) => {
  // eslint-disable-next-line no-prototype-builtins
  if (handlers.hasOwnProperty(`undefined`)) {
    const msg = `reducer created with undefined handler, check your type constants. handlers received: ${JSON.stringify(
      handlers,
    )}`

    throw new Error(msg)
  }

  return (state: State = initialState, action: RdxAction<any, any>): State => {
    // if this is an action batch
    // loop through actions
    // and apply the first relevant handler
    if (action.type === `@@rdx/SET_BATCH_ACTIONS`) {
      const batchedActions = action.payload

      if (!Array.isArray(batchedActions)) {
        return state
      }

      for (let i = 0, count = batchedActions.length; i < count; i++) {
        const currentAction: RdxAction<any> = batchedActions[i]
        const type = currentAction.type

        if (handlers[type]) {
          state = handlers[type](state, currentAction)
        }
      }

      return state
    }

    // single action
    if (handlers[action.type]) {
      return handlers[action.type](state, action)
    }

    return state
  }
}

export { createReducer }
