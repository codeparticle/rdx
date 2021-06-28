import { isObject } from '../utils/is-object'

const deriveInitialState = (type: string, value: unknown): typeof value | null => {
  switch (type.toLowerCase()) {

  case `boolean`:
    return Boolean(value || false)

  case `string`:
    return value === `''` ? `` : value || ``

  case `number`: {
    const parsed = value ? parseInt(value as string, 10) : 0

    return isNaN(parsed) ? 0 : parsed
  }

  case `array`:
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Array.isArray(value) ? value : null

  case `object`:
    return isObject(value) ? value : null

  default:
    return null
  }
}

export { deriveInitialState }
