// import { LIBRARY_PREFIXES_TO_TRIM } from "../constants/library-prefixes"
import type { CamelCase, PascalCase, ScreamingSnakeCase, SnakeCase } from 'type-fest'
import type {
  RdxResetActionName,
  RdxResetTypeName,
  RdxSelectorName,
  RdxSetActionName,
  RdxSetTypeName,
} from "../../types"
import { RDX_INTERNAL_PREFIXES } from '../constants/library-prefixes'

export const rdxGeneratedPrefixes = {
  type: `@@rdx/`,
  set: `@@rdx/set`,
  get: `@@rdx/get`,
  reset_: `@@rdx/reset_`,
  set_: `@@rdx/set_`,
  RESET: `@@rdx/RESET_`,
  SET: `@@rdx/SET_`,
} as const

type RdxStringFormatter<Value extends string> = (v: `${Value | ''}`) => PascalCase<`${Value}`> | CamelCase<`${Value}`> | ScreamingSnakeCase<`${Value}`>

const { constant, pascal, camel, snake, of: caseOf } = require(`case`)

export const rdxPascalCase = <Value extends string>(v: Value) => pascal(v?.trim?.() ?? ``) as PascalCase<`${Value}`>
export const rdxCamelCase = <Value extends string>(v: Value) => camel(v?.trim?.() ?? ``) as CamelCase<`${Value}`>
export const rdxConstantCase = <Value extends string>(v: Value) => constant(v?.trim?.() ?? ``) as ScreamingSnakeCase<`${Value}`>

export const spaceByCamel = <Value extends string>(s: Value) =>  {
  if (typeof s !== `string` || !s) {
    return ``
  }

  // console.log('========\n', 'trying to format as a string: ', s, '\n========');
  return snake(s) as SnakeCase<`${Value}`>
}

export const removeRdxTypePrefix = <Value extends string>(typeString: Value): string => {
  const possiblePrefixes = Object.values(rdxGeneratedPrefixes)
  
  let formatted = (typeString || ``).trim()
  let index = possiblePrefixes.length

  while(index--) {
    formatted = formatted.startsWith(possiblePrefixes[index]) ? formatted.replace(possiblePrefixes[index], ``) : formatted
  }

  return formatted
}

export const formatTypeString = <Value extends string, Prefix extends string,>(
  typeString: Value,
  prefix: Prefix,
  config = { reset: false }, 
): RdxSetTypeName<Value, Prefix> | RdxResetTypeName<Value, Prefix> => {

  const isAlreadyRdxPrefixed = typeString.startsWith(RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX)
  
  const withoutRdxPrefix =  spaceByCamel(isAlreadyRdxPrefixed ? rdxCamelCase(removeRdxTypePrefix(typeString)) : rdxCamelCase(typeString))
 
  const formattedTypeString = spaceByCamel(rdxCamelCase(withoutRdxPrefix))

  const formattedPrefix = spaceByCamel(rdxCamelCase(prefix ? `${prefix}_` : `` ))
 
  const hasDuplicatePrefix = formattedTypeString === formattedPrefix.slice(-1)

  if ( hasDuplicatePrefix) {
    console.log(`========\n`, `typestring and prefix`, { typeString, prefix, isAlreadyRdxPrefixed, formattedTypeString, formattedPrefix, hasDuplicatePrefix, withoutRdxPrefix }, `\n========`)
  }

  if (config.reset) {

    return `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${rdxConstantCase(`reset ${!hasDuplicatePrefix ? `${formattedPrefix} ` : ''}${formattedTypeString}`)}` as RdxResetTypeName<Value, Prefix>
  } else {

    return `${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}${rdxConstantCase(`set ${!hasDuplicatePrefix ? `${formattedPrefix} `: ''}${formattedTypeString}`)}` as RdxSetTypeName<Value, Prefix>
  }
}

export const formatActionName = <Name extends string, Prefix extends string>(
  actionName: Name,
  prefix: Prefix,
  config = { reset: false },
) => {

  const concatenatedTerms =  [prefix, actionName].filter(Boolean)

  return camel(`${config.reset ? `reset` : `set`}${concatenatedTerms.join(``)}`) as unknown as RdxSetActionName<Name, Prefix> | RdxResetActionName<Name, Prefix>
}

export const formatSelectorName =  <Name extends string, Prefix extends string>(selectorName: Name, prefix: Prefix) => {
  return camel(`get${[rdxPascalCase(prefix), rdxPascalCase(selectorName.replace(`.`, `_`))].filter(Boolean)}`) as RdxSelectorName<Name, Prefix>
}

export const formatStateName = <KeyName extends string>(reducerKey: KeyName) => rdxCamelCase<KeyName>(reducerKey)
