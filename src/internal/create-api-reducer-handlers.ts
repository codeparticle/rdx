import { apiState } from "../api"
import { ApiRequestState, Action, ApiReducerKeys, RdxReducer } from "../types"

const requestReducerHandler: RdxReducer<ApiRequestState<any, any>, Action<never>> = state => ({
  ...state,
  fetching: true,
  dataLoaded: false,
  error: null, 
})

const successReducerHandler = <DataType = any>(state, action: Action<DataType>): ReturnType<RdxReducer<ApiRequestState<DataType, null>, Action<DataType>>> => ({
  ...state,
  fetching: false,
  dataLoaded: true,
  error: null,
  data: action.payload,
})

const failureReducerHandler = <ErrorType = Error>(state, action: Action<ErrorType | null | undefined>): ReturnType<RdxReducer<ApiRequestState<any, ErrorType>, Action<ErrorType>>> => ({
  ...state,
  fetching: false,
  dataLoaded: false,
  error: action?.payload ?? true,
})

const resetApiReducerHandler: RdxReducer<ApiRequestState<any, any>, Action<never>> = () => apiState

const createApiReducerHandlers = (
  types: ApiReducerKeys,
) =>  ({ 
  [types.request]: requestReducerHandler,
  [types.success]: successReducerHandler,
  [types.failure]: failureReducerHandler,
  [types.reset]: resetApiReducerHandler,
})

export {
  createApiReducerHandlers, 
}