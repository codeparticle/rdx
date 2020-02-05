import { constant, pascal, camel } from 'case'

const LIBRARY_PREFIXES = [`set`, `get`, `set_`, `reset_`]

const firstToUpper = (str: string) => {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`
}

const removePrefixIfExists = (name: string) => {
  let prefixToRemove = ``

  for (const generatedPrefix of LIBRARY_PREFIXES) {
    if (name.toLowerCase().startsWith(generatedPrefix)) {
      prefixToRemove = generatedPrefix
    }
  }

  if (prefixToRemove) {
    return name.slice(prefixToRemove.length)
  }

  return firstToUpper(name)
}

export const formatPrefix = (prefix = ``) => {
  const upperCasedPrefix = prefix.toUpperCase()

  if (!prefix) {
    return prefix
  }

  return upperCasedPrefix.endsWith(`_`) ? upperCasedPrefix : `${upperCasedPrefix}_`
}

export const formatTypeString = (typeString: string, prefix = ``, config = { reset: false }) => {
  const preFormatted = removePrefixIfExists(typeString)
  let unformattedPrefix = prefix

  if (config.reset) {
    unformattedPrefix = constant(`reset_${prefix}`)
  } else {
    unformattedPrefix = constant(`set_${prefix}`)
  }

  return `${formatPrefix(unformattedPrefix)}${constant(preFormatted)}`
}

export const formatActionName = (
  actionName: string,
  prefix?: string,
  config = { reset: false }
) => {
  const preFormatted = removePrefixIfExists(actionName)

  return `${config.reset ? `reset` : `set`}${pascal(prefix)}${pascal(preFormatted)}`
}

export const formatSelectorName = (selectorName: string, prefix?: string) => {
  const preFormatted = removePrefixIfExists(selectorName)

  return `get${pascal(prefix)}${pascal(preFormatted)}`
}

export const formatStateName = (reducerKey: string) => {
  const preFormatted = removePrefixIfExists(reducerKey)

  return camel(preFormatted)
}
