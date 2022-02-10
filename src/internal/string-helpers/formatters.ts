import { RDX_INTERNAL_PREFIXES } from '../constants/library-prefixes'
import type { PascalCase, ScreamingSnakeCase, SnakeCase } from 'type-fest'
import type {
  RdxActionName,
  RdxResetTypeName,
  RdxSelectorName,
  RdxSetTypeName,
} from "../../types"

const { camel } = require(`case`)

export const firstToUpper = <Value extends string>(str: Value): Capitalize<`${Value}`> => str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<`${Value}`>

export { camel }

export const snake = <Value extends string>(str: Value): SnakeCase<`${Value}`> => {
  if (!str || typeof str !== `string`) {
    return `` as SnakeCase<`${Value}`>
  }

  return (str.trim().match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) as RegExpMatchArray)
    .join(`_`)
    .toLowerCase() as SnakeCase<`${Value}`>
}

export const pascal = <Value extends string>(str: Value): PascalCase<`${Value}`> => {
  return firstToUpper(camel(str)) as PascalCase<`${Value}`>
}

export const constantCase = <Value extends string>(str: Value): ScreamingSnakeCase<`${Value}`> => {
  return snake(str).toUpperCase() as ScreamingSnakeCase<`${Value}`>
}

export const rdxGeneratedPrefixes = {
  type: `@@rdx/`,
  set: `@@rdx/set`,
  get: `@@rdx/get`,
  reset_: `@@rdx/reset_`,
  set_: `@@rdx/set_`,
  RESET: `@@rdx/RESET_`,
  SET: `@@rdx/SET_`,
} as const

export const removeRdxTypePrefix = <Value extends string>(typeString: Value): string => {
  const possiblePrefixes = Object.values(rdxGeneratedPrefixes)

  let formatted = (typeString || ``).trim()
  let index = possiblePrefixes.length

  while (index--) {
    formatted = formatted.startsWith(possiblePrefixes[index]) ? formatted.replace(possiblePrefixes[index], ``) : formatted
  }

  return formatted
}

export const formatTypeString = <Value extends string, Prefix extends string>(
  typeString: Value,
  prefix: Prefix,
  config = { reset: false },
): RdxSetTypeName<Value, Prefix> | RdxResetTypeName<Value, Prefix> => {
  const isAlreadyRdxPrefixed = typeString.startsWith(RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX)

  const withoutRdxPrefix = snake(isAlreadyRdxPrefixed ? camel(removeRdxTypePrefix(typeString)) : camel(typeString))

  const formattedTypeString = snake(camel(withoutRdxPrefix))

  const formattedPrefix = snake(camel(prefix ? `${prefix}_` : ``))

  return config.reset
    ? `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${constantCase(`reset ${formattedPrefix} ${formattedTypeString}`)}` as RdxResetTypeName<Value, Prefix>
    : `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${constantCase(`set ${formattedPrefix} ${formattedTypeString}`)}` as RdxSetTypeName<Value, Prefix>
}

export const formatActionName = <Name extends string, Prefix extends string>(
  actionName: Name,
  prefix: Prefix,
  config = { reset: false },
): RdxActionName<Name, Prefix> => {
  const formattedPrefix = prefix ? `${snake(prefix)}_` : ``

  return camel(`${config.reset ? `reset` : `set`}_${formattedPrefix}${snake(actionName)}`) as unknown as RdxActionName<Name, Prefix>
}

export const formatSelectorName = <Name extends string, Prefix extends string>(selectorName: Name, prefix: Prefix) => {
  return camel(`get${[pascal(prefix), pascal(selectorName.replace(`.`, `_`))].filter(Boolean)}`) as RdxSelectorName<Name, Prefix>
}

export const formatStateName = <KeyName extends string>(reducerKey: KeyName) => camel(reducerKey)
