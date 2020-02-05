import { parseAsJson } from './parse-as-json'

const deriveInitialState = (type: string, value: any) => {
  switch (type.toLowerCase()) {
  case `boolean`:
    return Boolean(value || false)
  case `string`:
    return value === `''` ? `` : value || ``

  case `number`: {
    const parsed = value ? parseInt(value as string, 10) : 0

    return isNaN(parsed) ? 0 : parsed
  }

  case `array`: {
    let parsed = false

    try {
      parsed = value ? parseAsJson(value) : false

      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      console.error(e)

      return null
    }
  }

  case `object`: {
    let parsed = false

    try {
      parsed = value ? parseAsJson(value) : false

      return typeof parsed === `object` &&
          Object.getPrototypeOf(parsed) === Object.getPrototypeOf({})
        ? parsed
        : {}
    } catch (e) {
      console.error(e)

      return null
    }
  }

  default:
    return null
  }
}

export { deriveInitialState }
