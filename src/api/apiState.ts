import { ApiRequestState } from "../types"

/**
 * state for a reducer that handles an API request
 */
const apiState: ApiRequestState = Object.freeze({
  dataLoaded: false,
  fetching: false,
  error: null,
  data: {},
})

export {
  apiState,
}