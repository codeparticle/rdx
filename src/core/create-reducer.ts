/**
 * Create a reducer that accepts a list of handlers whose function names are types that you've defined
 */

import { O } from 'ts-toolbelt'
import { RdxReducer, KeyMirroredObject, Action, DeepValueOf } from '../types'

type ReducerHandlers<State = Record<string, any>, Types extends O.Object = KeyMirroredObject<string>> = Record<
keyof Types,
RdxReducer<State, Action<any, any>>
>

const createReducer = <State = any, Types = Record<string, string>>(
  initialState: State,
  handlers: ReducerHandlers<State, Types>,
): RdxReducer<State, Action<any, any>> => {
  // eslint-disable-next-line no-prototype-builtins
  if (handlers.hasOwnProperty(`undefined`)) {
    throw new Error(`reducer created with undefined handler, check your type constants. handlers received: ${JSON.stringify(handlers)}`)
  }

  return (state: State = initialState, action: Action<State | DeepValueOf<State> | Array<Action<State | DeepValueOf<State> | undefined>>, any>): State => {
    // if this is an action batch
    // loop through actions
    // and apply the first relevant handler
    if (action.type === `@@rdx/SET_BATCH_ACTIONS`) {
      const batchedActions = action.payload

      if (!Array.isArray(batchedActions)) {
        return state
      }

      for (let i = 0, count = batchedActions.length; i < count; i++) {
        const currentAction = batchedActions[i]
        const type = currentAction.type

        if (handlers[type]) {
          console.log(`========\n`, { currentAction }, `\n========`)
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
      console.log(`========\n`, `action`, action, `\n========`)

      return handlers[action.type](state, action) as State
    }

    return state
  }
}

export { createReducer }
