import { RDX_INTERNAL_PREFIXES } from '../constants/library-prefixes'
import type { CamelCase, PascalCase, ScreamingSnakeCase } from 'type-fest'
import type {
  RdxActionName,
  RdxSelectorName,
  RdxSetOrResetActionType,
} from "../../types"

import { camelCase, constantCase, pascalCase } from 'change-case'

export const spaceByCamel = str => str.replace(/[\w]([A-Z])/g, (m) => {
  return `${m[0]}_${m[1]}`
})

const isRdxGeneratedActionType = (typeString: string) => typeString.startsWith(RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX)
const isRdxResetActionType = (typeString: string) => typeString.startsWith(rdxGeneratedPrefixes.RESET)
const isRdxSetActionType = (typeString: string) => typeString.startsWith(rdxGeneratedPrefixes.SET)

const pascal = <Value extends string>(str: Value): PascalCase<Value> => {
  return pascalCase(str) as PascalCase<Value>
}

const constant = <Value extends string>(str: Value): ScreamingSnakeCase<Value> => {
  return constantCase(str) as ScreamingSnakeCase<Value>
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
    formatted = formatted.startsWith(possiblePrefixes[index]) ? formatted.replace(possiblePrefixes[index], ``) : formatted
  }

  return formatted
}

function formatTypeString<Value extends string = string, Prefix extends string = string, IsResetActionType extends boolean = false> (
  typeString: Value,
  prefix: Prefix,
  isReset?: IsResetActionType,
): RdxSetOrResetActionType<Value, Prefix, IsResetActionType>
function formatTypeString<
  Value extends string = string,
  Prefix extends string = string,
  IsResetActionType extends boolean = true,
> (
  typeString: Value,
  prefix: Prefix,
  isReset?: IsResetActionType,
): RdxSetOrResetActionType<Value, Prefix, IsResetActionType> {
  const isAlreadyRdxPrefixed = isRdxGeneratedActionType(typeString)

  const withoutRdxPrefix = spaceByCamel(camelCase(isAlreadyRdxPrefixed ? removeRdxTypePrefix(typeString) : typeString))

  const formattedTypeString = withoutRdxPrefix as Value

  const baseActionType = isReset ? `reset` : `set`

  const constantCased = constant(`${baseActionType} ${prefix ? spaceByCamel(camelCase(prefix)) : ``} ${formattedTypeString}`)

  return `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${constantCased}` as RdxSetOrResetActionType<Value, Prefix, IsResetActionType>
}

const formatActionName = <Name extends string, Prefix extends string>(
  actionName: Name,
  prefix: Prefix,
  isReset = false,
): RdxActionName<Name, Prefix> => {
  const formattedPrefix = prefix ? `${prefix}_` : ``

  return camelCase(`${isReset ? `reset` : `set`} ${formattedPrefix}${formattedPrefix ? `_` : ``}${actionName}`) as unknown as RdxActionName<Name, Prefix>
}

const formatSelectorName = <Name extends string, Prefix extends string>(selectorName: Name, prefix: Prefix) => {
  return camelCase(`get${[pascal(prefix), pascal(selectorName.replace(`.`, `_`))].filter(Boolean)}`) as RdxSelectorName<Name, Prefix>
}

const formatStateName = <KeyName extends string>(reducerKey: KeyName) => camelCase(reducerKey) as CamelCase<`${KeyName}`>

export {
  formatTypeString,
  isRdxGeneratedActionType,
  isRdxResetActionType,
  isRdxSetActionType,
  formatActionName,
  formatSelectorName,
  formatStateName,
  pascal,
  constant,
}
