import { apiState } from '../api'
import { HandlerTypes } from '../types'
import { isObject } from '../utils/is-object'

/**
 * Given an initial state, returns the safe version,
 * so that the associated handler type is guaranteed to work
 * when extrapolated to a function expecting data of a certain type.
 * @param type
 * @param value
 * @returns {Exclude<any, undefined | never>}
 */
const safelyDefineInitialState = <State>(type: HandlerTypes, value: State): Exclude<any, undefined | never> => {
  switch (type.toLowerCase()) {
    case `boolean`:
      return Boolean(value || false)

    case `string`:
      return value || ``

    case `number`: {
      const parsed = Number(value) ?? 0

      return isNaN(parsed) ? 0 : parsed
    }

    case `array`:
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Array.isArray(value) ? value : []

    case `object`:
      return isObject(value) ? value : {}

    case `function`:
      return value

    case `api`:
      return apiState

    default:
      return null
  }
}

export { safelyDefineInitialState }
