import { camelCase, constantCase, pascalCase } from 'change-case'
import type { CamelCase } from 'ts-essentials'
import type { ScreamingSnakeCase } from 'type-fest'

import type {
  PascalCase,
  RdxActionName,
  RdxSelectorName,
  RdxSetOrResetActionType,
} from '../../types'
import { RDX_INTERNAL_PREFIXES } from '../constants/library-prefixes'

export const spaceByCamel: (s: string) => string = (str) =>
  str.replace(/\w([A-Z])/g, (m) => {
    return `${m[0]}_${m[1]}`
  })

const isRdxGeneratedActionType = (typeString: string) =>
  typeString.startsWith(RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX)
const isRdxResetActionType = (typeString: string) =>
  typeString.startsWith(rdxGeneratedPrefixes.RESET)
const isRdxSetActionType = (typeString: string) => typeString.startsWith(rdxGeneratedPrefixes.SET)

function pascal<Value extends string>(str: Value): PascalCase<Value>
function pascal(str) {
  return pascalCase(str)
}

function constant<Value extends string>(str: Value): ScreamingSnakeCase<Value>
function constant(str) {
  return constantCase(str)
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

const removeRdxTypePrefix = <Value extends string>(typeString: Value): string => {
  const possiblePrefixes = Object.values(rdxGeneratedPrefixes)

  let formatted = (typeString || ``).trim()
  let index = possiblePrefixes.length

  while (index--) {
    formatted = formatted.startsWith(possiblePrefixes[index])
      ? formatted.replace(possiblePrefixes[index], ``)
      : formatted
  }

  return formatted
}

function formatTypeString<
  Value extends string = string,
  Prefix extends string = string,
  IsResetActionType extends boolean = false,
>(
  typeString: Value,
  prefix: Prefix,
  isReset?: IsResetActionType
): RdxSetOrResetActionType<Value, Prefix, IsResetActionType>
function formatTypeString(typeString, prefix, isReset = false) {
  const isAlreadyRdxPrefixed = isRdxGeneratedActionType(typeString)

  const withoutRdxPrefix = spaceByCamel(
    camelCase(isAlreadyRdxPrefixed ? removeRdxTypePrefix(typeString) : typeString),
  )

  const formattedTypeString = withoutRdxPrefix

  const baseActionType = isReset ? `reset` : `set`

  const constantCased = constant(
    `${baseActionType} ${
      prefix ? spaceByCamel(camelCase(prefix as string)) : ``
    } ${formattedTypeString}`,
  )

  return `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${constantCased}`
}

function formatActionName<Name extends string, Prefix extends string>(
  actionName: Name,
  prefix: Prefix,
  isReset?: boolean
): RdxActionName<Name, Prefix>
function formatActionName(actionName, prefix, isReset = false) {
  const formattedPrefix = prefix ? `${prefix}_` : ``

  return camelCase(
    `${isReset ? `reset` : `set`} ${formattedPrefix}${formattedPrefix ? `_` : ``}${actionName}`,
  )
}

function formatSelectorName<Name extends string = string, Prefix extends string = string>(
  selectorName: Name,
  prefix: Prefix
): RdxSelectorName<Name>
function formatSelectorName(selectorName, prefix) {
  return camelCase(`get${[pascal(prefix), pascal(selectorName.replace(`.`, `_`))].filter(Boolean)}`)
}

function formatStateName<KeyName extends string>(reducerKey: KeyName): CamelCase<KeyName>
function formatStateName(reducerKey) {
  return camelCase(reducerKey)
}

export {
  constant,
  formatActionName,
  formatSelectorName,
  formatStateName,
  formatTypeString,
  isRdxGeneratedActionType,
  isRdxResetActionType,
  isRdxSetActionType,
  pascal,
}

export {type PascalCase} from '../../types'