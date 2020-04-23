import { map } from '../../utils/map'
import { LIBRARY_PREFIXES } from '../constants/library-prefixes'

const { constant, pascal, camel } = require(`case`)

const spaceByCamel = s => s.replace(/([a-z0-9])([A-Z])/g, `$1_$2`).replace(/\s/g, ``)

const formatTerms = formatter => str =>
  map<string>(formatter)(spaceByCamel(`${str}`)).filter(Boolean)

const pascalTerms = formatTerms(pascal)

const removePrefixIfExists = (name: string, formatter: ((v: string) => string)) => {
  let prefixToRemove = ``
  const format = formatTerms(formatter)

  for (const generatedPrefix of LIBRARY_PREFIXES) {
    if (name.toLowerCase().startsWith(generatedPrefix)) {
      prefixToRemove = generatedPrefix
    }
  }

  if (prefixToRemove) {
    return format(name.slice(prefixToRemove.length)).join(`_`)
  }

  return format(name).join(`_`)
}

const formatPrefix = (prefix = ``) => {

  return prefix.endsWith(`_`) ? prefix : `${prefix}_`
}

export const formatTypeString = (typeString: string, prefix = ``, config = { reset: false }) => {
  const preFormatted = removePrefixIfExists(typeString, constant)
  let unformattedPrefix = prefix

  if (config.reset) {
    unformattedPrefix = constant(`reset_${spaceByCamel(prefix)}`)
  } else {
    unformattedPrefix = constant(`set_${spaceByCamel(prefix)}`)
  }

  return constant(`${formatPrefix(unformattedPrefix)}${preFormatted}`)
}

export const formatActionName = (
  actionName: string,
  prefix = ``,
  config = { reset: false },
) =>
  camel(`${config.reset ? `reset` : `set`}${pascalTerms([prefix, removePrefixIfExists(actionName, pascal)]).join(``)}`)

export const formatSelectorName = (selectorName: string, prefix = ``) =>
  camel(`get${pascalTerms([prefix, removePrefixIfExists(selectorName, pascal)]).join(``)}`)

export const formatStateName = (reducerKey: string) => removePrefixIfExists(reducerKey, camel)
