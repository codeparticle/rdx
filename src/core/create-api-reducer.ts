import { createReducer } from './create-reducer'
import { apiState } from '../api'
import type { ApiRequestState, Action, ApiReducerKeys, RdxReducer } from "../types"
import { createApiReducerHandlers } from '../internal'

const createApiReducer = <DataType, ErrorType>(
  types: ApiReducerKeys,
  extraHandlers?: { [key: string]: RdxReducer<ApiRequestState<DataType, ErrorType>, Action<any, any>> },
): RdxReducer<ApiRequestState<DataType, ErrorType>, Action<DataType, ErrorType>> => {
  if (types?.request && types?.success && types?.failure && types?.reset) {
    const handlers = createApiReducerHandlers(types)

    if (extraHandlers != null) {
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
