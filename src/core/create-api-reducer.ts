import { createReducer } from './create-reducer'
import { apiState } from '../api'
import type { ApiRequestState, Action, ApiReducerKeys, RdxReducer, ReducerHandlers } from "../types"
import { createApiReducerHandlers } from '../internal'

const createApiReducer = <DataType = any, ErrorType = any>(
  types: ApiReducerKeys,
  extraHandlers?: ReducerHandlers<ApiRequestState<DataType, ErrorType>>,
  // @ts-expect-error ---
): RdxReducer<ApiRequestState<DataType, ErrorType>, Action<DataType, ErrorType>> => {
  if (types?.request && types?.success && types?.failure && types?.reset) {
    const handlers = createApiReducerHandlers(types)

    if (extraHandlers != null) {
      Object.assign(handlers, extraHandlers)
    }

    return createReducer(apiState, handlers)
  } else {
    // throw new Error(`Arguments to createApiReducer must include request, success, failure, and reset types. Was provided this instead: ${JSON.stringify(types)}`)
    console.error(`Arguments to createApiReducer must include request, success, failure, and reset types. Was provided this instead: ${JSON.stringify(types)}`)
  }
}

export {
  createApiReducerHandlers,
  createApiReducer,
}
