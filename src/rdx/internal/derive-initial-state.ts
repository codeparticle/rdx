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

  case `array`:
    return Array.isArray(value) ? value : null

  case `object`:
    return typeof value === `object` && !Array.isArray(value) ? value : null

  default:
    return null
  }
}

export { deriveInitialState }
