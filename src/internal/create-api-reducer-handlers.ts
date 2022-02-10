import { apiRequestState } from "../api"
import { ApiRequestState, Action, ApiReducerKeys, RdxReducer } from "../types"

const requestReducerHandler: RdxReducer<ApiRequestState<any, any>, Action<never, any>> = state => ({
  ...state,
  fetching: true,
  dataLoaded: false,
  error: null,
})

const successReducerHandler = <DataType = any>(state, action: Action<DataType, any>): ReturnType<RdxReducer<ApiRequestState<DataType, null>, Action<DataType, any>>> => ({
  ...state,
  fetching: false,
  dataLoaded: true,
  error: null,
  data: action.payload,
})

const failureReducerHandler = <ErrorType = Error>(state, action: Action<ErrorType | null | undefined, any>): ReturnType<RdxReducer<ApiRequestState<any, ErrorType>, Action<ErrorType, any>>> => ({
  ...state,
  fetching: false,
  dataLoaded: false,
  error: action?.payload ?? true,
})

const resetApiReducerHandler = apiRequestState

const createApiReducerHandlers = (
  types: ApiReducerKeys,
) => ({
  [types.request]: requestReducerHandler,
  [types.success]: successReducerHandler,
  [types.failure]: failureReducerHandler,
  [types.reset]: resetApiReducerHandler,
})

export {
  createApiReducerHandlers,
}
