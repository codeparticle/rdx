import { createReducer } from './create-reducer'
import { apiState } from '../api'
import type { ApiRequestState, RdxAction, ApiReducerKeys, RdxReducer, ReducerHandlers } from "../types"
import { createApiReducerHandlers } from '../internal/reducer-handlers'

const createApiReducer = <DataType = any, ErrorType = any>(
  types: ApiReducerKeys,
  extraHandlers?: ReducerHandlers<ApiRequestState<DataType, ErrorType>>,
): RdxReducer<ApiRequestState<DataType, ErrorType>, RdxAction<DataType, ErrorType>> => {
  if (types?.request && types?.success && types?.failure && types?.reset) {
    const handlers = createApiReducerHandlers(types)

    if (extraHandlers != null) {
      Object.assign(handlers, extraHandlers)
    }

    // @ts-expect-error ---
    return createReducer(apiState, handlers)
  } else {
    throw new Error(`Arguments to createApiReducer must include request, success, failure, and reset types. Was provided this instead: ${JSON.stringify(types)}`)
  }
}

export {
  createApiReducer,
}
