/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  __DO_NOT_USE__ActionTypes as ReduxBuiltInActionTypes,
} from 'redux/dist/redux.min.js'
import { isObject } from '../utils/is-object'

/**
 * Prints a warning in the console if it exists.
 * :: Taken from redux internal source code ::
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning (message) {
  /* eslint-disable no-console */
  if (typeof console !== `undefined` && typeof console.error === `function`) {
    console.error(message)
  }

  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message)
  } catch (e) {} // eslint-disable-line no-empty
}

function getUndefinedStateErrorMessage (key, action) {
  const actionType = action?.type
  const actionName = actionType ? `"${actionType.toString()}"` : `an action`

  return (
    `Given action ${actionName}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state.`
  )
}

function getUnexpectedStateShapeWarningMessage (inputState, reducers, action) {
  const reducerKeys = Object.keys(reducers)
  const argumentName = action && action.type === ReduxBuiltInActionTypes.INIT
    ? `initialState argument passed to createStore`
    : `previous state received by the reducer`

  if (reducerKeys.length === 0) {
    return (
      `Store does not have a valid reducer. Make sure the argument passed ` +
      `to combineReducers is an object whose values are reducers.`
    )
  }

  if (!isObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join(`", "`)}"`
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const unexpectedKeys = Object.keys(inputState).filter(key => !reducers.hasOwnProperty(key))

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? `keys` : `key`} ` +
      `"${unexpectedKeys.join(`", "`)}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join(`", "`)}". Unexpected keys will be ignored.`
    )
  }
}

/// //////////////////
/**
 * Credit for all below to https://github.com/eremzeit for the idea and implementation
 * from a PR they made to redux that made combineReducers recursive
 */
/// //////////////////

function cleanReducerTree (rootReducerTree) {
  function _cleanReducerTree (reducerTree) {
    const finalReducers = {}

    Object.keys(reducerTree).forEach(key => {
      if (reducerTree[key] && typeof reducerTree[key] === `object`) {
        const nextLevelReducer = reducerTree[key]

        if (nextLevelReducer.length) {
          throw new Error(
            `Reducer object at "${key}" was empty.  Every item in the ` +
            `reducer tree must either be a function or a non-empty object`,
          )
        }

        finalReducers[key] = _cleanReducerTree(nextLevelReducer)
      } else if (typeof reducerTree[key] === `function`) {
        const reducer = reducerTree[key]
        const initialState = reducer(undefined, { type: `@@redux/INIT` })

        if (typeof initialState === `undefined`) {
          throw new Error(
            `Reducer "${key}" returned undefined during initialization. ` +
            `If the state passed to the reducer is undefined, you must ` +
            `explicitly return the initial state. The initial state may ` +
            `not be undefined.`,
          )
        }

        const type = `@@redux/PROBE_UNKNOWN_ACTION_` + Math.random().toString(36).substring(7).split(``).join(`.`)

        if (typeof reducer(undefined, { type }) === `undefined`) {
          throw new Error(
            `Reducer "${key}" returned undefined when probed with a random type. ` +
            `Don't try to handle @@redux/INIT or other actions in "redux/*" ` +
            `namespace. They are considered private. Instead, you must return the ` +
            `current state for any unknown actions, unless it is undefined, ` +
            `in which case you must return the initial state, regardless of the ` +
            `action type. The initial state may not be undefined.`,
          )
        }

        finalReducers[key] = reducer
      }
    })

    return finalReducers
  }

  return _cleanReducerTree(rootReducerTree)
}

export function recursivelyCombineReducers (rootReducerTree) {
  let finalReducers, sanityError

  try {
    finalReducers = cleanReducerTree(rootReducerTree)
  } catch (e) {
    sanityError = e
  }

  function reducer (topLevelState = {}, action, stateWindow) {
    stateWindow = stateWindow || topLevelState

    if (sanityError) {
      throw sanityError
    }

    function reduce (reducerTree, state) {
      if (process.env.NODE_ENV !== `production`) {
        const warningMessage = getUnexpectedStateShapeWarningMessage(state, reducerTree, action)

        if (warningMessage) {
          warning(warningMessage)
        }
      }

      const nextState = {}
      let hasChanged = false

      Object.keys(reducerTree).forEach((key) => {
        let nextStateForKey; const prevStateForKey = state[key] || {}

        if (typeof reducerTree[key] === `object`) {
          nextStateForKey = reduce(reducerTree[key], prevStateForKey)
        } else if (typeof reducerTree[key] === `function`) {
          nextStateForKey = reducerTree[key](state[key], action, stateWindow)
        }

        if (typeof nextStateForKey === `undefined`) {
          const errorMessage = getUndefinedStateErrorMessage(key, action)

          throw new Error(errorMessage)
        }

        hasChanged = hasChanged || nextStateForKey !== prevStateForKey
        nextState[key] = nextStateForKey
      })

      return hasChanged ? nextState : state
    }

    return reduce(finalReducers, topLevelState)
  }

  return reducer
}
