/**
 * Creates a redux-style action. can be used in curried style.
 * @license MIT
 */

import type { O } from 'ts-toolbelt'
import type { ActionCreator, RdxAction } from '../types'
import { isObject } from '../utils/is-object'

function createAction<Payload extends any | never = any, AdditionalKeys extends O.Object | never = never> (type: string): ActionCreator<Payload, AdditionalKeys> {
  // @ts-expect-error action types
  return (
    payload: Payload,
    additionalKeys?: AdditionalKeys,
  ) => {
    const action: any = { type }

    if (payload) {
      action.payload = payload
    }

    if (isObject(additionalKeys)) {
      return { ...(additionalKeys as O.Object), payload: action?.payload, type: action.type }
    }

    return action as RdxAction<Payload, AdditionalKeys>
  }
}

export { createAction }
