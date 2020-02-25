/**
 * Creates a redux-style action. can be used in curried style.
 * @license MIT
 */

import { ActionCreator, Action } from '../types'

const createAction = <T>(type: string): ActionCreator<T> => (
  payload: T = null,
  additionalKeys = {},
  id = type,
): Action<T> => ({
  id: id || type,
  type,
  payload,
  ...additionalKeys,
})

export { createAction }
