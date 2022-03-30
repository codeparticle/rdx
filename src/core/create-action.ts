/**
 * Creates a redux-style action. can be used in curried style.
 * @license MIT
 */

import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import type { ActionCreator, RdxAction } from '../types'
import { isObject } from '../utils/is-object'

function createAction<
  Payload extends any | never = any,
  AdditionalKeys extends _Object | never = never,
>(type: string): ActionCreator<Payload, AdditionalKeys>
function createAction(type) {
  return (payload, additionalKeys?) => {
    const action: RdxAction = { type }

    if (payload) {
      action.payload = payload
    }

    if (isObject(additionalKeys)) {
      for (const key in additionalKeys) {
        action[key] = additionalKeys[key]
      }
    }

    return action
  }
}

export { createAction }
