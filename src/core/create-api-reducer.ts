import { createReducer } from './create-reducer'
import { apiState } from '../api'
import { ApiRequestState, Action, ApiReducerKeys, Reducer } from "../types"
import { createApiReducerHandlers } from '../internal'

const createApiReducer = (
  types: ApiReducerKeys,
  extraHandlers?: { [key: string]: Reducer<ApiRequestState, Action<any>> },
): Reducer<ApiRequestState, Action<any>> | void => {
  if (types?.request && types?.success && types?.failure && types?.reset) {
    const handlers = createApiReducerHandlers(types)

    if ( extraHandlers ) {
      Object.assign(handlers, extraHandlers)
    }

    return createReducer(apiState, handlers)
  } else {
    throw new Error(`Arguments to createApiReducer must include request, success, failure, and reset types. Was provided this instead: ${JSON.stringify(types)}`)
  }
}

export {
  createApiReducerHandlers,
  createApiReducer,
}