import { ApiRequestState } from "../types"

/**
 * state for a reducer that handles an API request
 */
const apiState: ApiRequestState = Object.freeze({
  fetching: false,
  loaded: false,
  failed: false,
  error: {},
  data: {},
})

export {
  apiState,
}