import type { ApiRequestState } from '../types'

/**
 * State for a reducer that handles an API request.
 * Note: This is not a reducer, but a state object.
 * dataLoaded: whether the data has been loaded previously.
 * fetching: whether the request is currently in progress.
 * error: the error that occurred, if any. Defaults to null.
 * data: the data that was returned from the request. Defaults to an empty object.
 */
const apiState: ApiRequestState<any, any> = Object.freeze({
  dataLoaded: false,
  fetching: false,
  error: null,
  data: null,
})

const apiRequestState = <
  DataType = Record<string, any>,
  ErrorType = boolean | null | Error,
>(): ApiRequestState<DataType, ErrorType> => {
  return apiState as ApiRequestState<DataType, ErrorType>
}

export { apiRequestState, apiState }
