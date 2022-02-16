import { RDX_INTERNAL_PREFIXES } from '../constants/library-prefixes'
import type { PascalCase, ScreamingSnakeCase } from 'type-fest'
import type {
  RdxActionName,
  RdxSelectorName,
  RdxSetOrResetActionType,
  ReflectedStatePath,
} from "../../types"
import { O } from 'ts-toolbelt'

const { camel, snake, constant } = require(`case`)

export const spaceByCamel = str => str.replace(/[\w]([A-Z])/g, (m) => {
  return `${m[0]}_${m[1]}`
})

export const firstToUpper = <Value extends string>(str: Value): Capitalize<Value> => str.charAt(0).toUpperCase() + str.slice(1) as Capitalize<Value>

export const isRdxGeneratedActionType = (typeString: string) => typeString.startsWith(RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX)
export const isRdxResetActionType = (typeString: string) => typeString.startsWith(rdxGeneratedPrefixes.RESET)
export const isRdxSetActionType = (typeString: string) => typeString.startsWith(rdxGeneratedPrefixes.SET)

export const pascal = <Value extends string>(str: Value): PascalCase<Value> => {
  return firstToUpper(camel(str)) as PascalCase<Value>
}

export const constantCase = <Value extends string>(str: Value): ScreamingSnakeCase<Value> => {
  return constant(str) as ScreamingSnakeCase<Value>
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

  const withoutRdxPrefix = spaceByCamel(camel(isAlreadyRdxPrefixed ? removeRdxTypePrefix(typeString) : typeString))

  const formattedTypeString = withoutRdxPrefix as Value

  const baseActionType = isReset ? `reset` : `set`

  const constantCased = constant(`${baseActionType} ${prefix ? spaceByCamel(camel(prefix)) : ``} ${formattedTypeString}`)

  return `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${constantCased}` as RdxSetOrResetActionType<Value, Prefix, IsResetActionType>
}

export const convertTypeStringToStatePath = <State extends O.Object, Value extends string>(typeString: Value): ReflectedStatePath<State> => {
  const isAlreadyRdxPrefixed = isRdxGeneratedActionType(typeString)

  const withoutRdxPrefix = spaceByCamel(camel(isAlreadyRdxPrefixed ? removeRdxTypePrefix(typeString) : typeString))

  const converted = withoutRdxPrefix.replace(/[_]/g, `.`)

  return converted as ReflectedStatePath<State>
}

export const formatActionName = <Name extends string, Prefix extends string>(
  actionName: Name,
  prefix: Prefix,
  isReset = false,
): RdxActionName<Name, Prefix> => {
  const formattedPrefix = prefix ? `${prefix}_` : ``

  return camel(`${isReset ? `reset` : `set`} ${formattedPrefix}${formattedPrefix ? `_` : ``}${actionName}`) as unknown as RdxActionName<Name, Prefix>
}

export const formatSelectorName = <Name extends string, Prefix extends string>(selectorName: Name, prefix: Prefix) => {
  return camel(`get${[pascal(prefix), pascal(selectorName.replace(`.`, `_`))].filter(Boolean)}`) as RdxSelectorName<Name, Prefix>
}

export const formatStateName = <KeyName extends string>(reducerKey: KeyName) => camel(reducerKey)

export { camel, snake, formatTypeString }
