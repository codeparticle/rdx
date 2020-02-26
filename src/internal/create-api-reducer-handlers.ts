import { apiState } from "../api"
import { ApiRequestState, Action, ApiReducerKeys, Reducer } from "../types"

const requestReducerHandler: Reducer<ApiRequestState, Action<never>> = state => ({
  ...state,
  fetching: true,
  dataLoaded: false,
})

const successReducerHandler: Reducer<ApiRequestState, Action<any>> = (state, action) => ({
  ...state,
  fetching: false,
  dataLoaded: true,
  error: null,
  data: action.payload,
})

const failureReducerHandler: Reducer<ApiRequestState, Action<any>> = (state, action) => ({
  ...state,
  fetching: false,
  dataLoaded: false,
  error: action?.payload ?? true,
})

const resetApiReducerHandler = () => apiState

const createApiReducerHandlers: (
  types: ApiReducerKeys
) => { [key: string]: Reducer<ApiRequestState, Action<any>> } = types => ({
  [types.request]: requestReducerHandler,
  [types.success]: successReducerHandler,
  [types.failure]: failureReducerHandler,
  [types.reset]: resetApiReducerHandler,
})

export {
  createApiReducerHandlers,
}