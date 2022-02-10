import { Primitive } from 'type-fest'
import { HandlerTypes } from '../types'
import { isObject } from '../utils/is-object'

const deriveInitialState = (type: HandlerTypes, value): Primitive | any[] | Record<string, any> => {
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

    default:
      return null
  }
}

export { deriveInitialState }
