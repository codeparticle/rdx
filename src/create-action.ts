/**
 * Creates a redux-style action. can be used in curried style.
 * @license MIT
 */

import { ActionCreator, Action } from './types'

function createAction<T = any>(type: string): ActionCreator<T> {
  return (payload = null, id): Action<T> => ({
    id: id || type,
    type,
    payload,
  })
}

export { createAction }
