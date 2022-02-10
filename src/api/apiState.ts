import { ApiRequestState } from "../types"

/**
 * state for a reducer that handles an API request
 */
const apiState: ApiRequestState<any, any> = Object.freeze({
  dataLoaded: false,
  fetching: false,
  error: null,
  data: {},
})

const apiRequestState = <DataType = Record<string, any>, ErrorType = boolean | null | Error>(): ApiRequestState<DataType, ErrorType> => {
  return apiState as ApiRequestState<DataType, ErrorType>
}

export {
  apiState,
  apiRequestState,
}
