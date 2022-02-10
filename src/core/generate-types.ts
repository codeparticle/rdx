import { apiState } from '../api'
import { formatTypeString } from '../internal'
import type {
  KeyMirroredObject,
  Paths,
  RdxDefinition,
  RdxResetTypeName,
  RdxSetTypeName,
  RdxTypesObject,
  ReflectedStatePath,
} from '../types'
import { HandlerTypes, RdxGeneratedPrefixes } from '../types'
import { filter, get, getObjectPaths, isObject, keyMirror, map, pipe } from '../utils'

const isTemplateStringsArray = maybeTsArray => `raw` in maybeTsArray

/**
 * Template string function that generates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */

const generateTypes = <TypeList extends string[] | TemplateStringsArray>(strings: TypeList): KeyMirroredObject<string> => {
  const types: readonly string[] = isTemplateStringsArray(strings) ? strings[0].split(`\n`) : strings

  return pipe<readonly string[], KeyMirroredObject<typeof types[number]>>(
    map(s => s.trim().replace(/\s+/g, ` `)),
    filter(Boolean),
    keyMirror,
  )(types)
}

const prefixTypes = <Prefix extends string, TypeList extends KeyMirroredObject<string>>(prefix: Prefix) => (types: TypeList): RdxTypesObject<Prefix> => {
  return pipe<Array<keyof TypeList>, RdxTypesObject<string>>(
    filter(Boolean),
    map<string, RdxSetTypeName<string, string> | RdxResetTypeName<string, string>>(
      type => formatTypeString<string, string>(
        type,
        (prefix || ``),
        { reset: type.startsWith(RdxGeneratedPrefixes.RESET) },
      )),
    keyMirror,
  )(Object.keys(types) as Array<keyof TypeList>)
}

const generateTypesFromDefs = <State>(defs: Array<RdxDefinition<State>>): KeyMirroredObject<string> => {
  const types: string[] = []

  let rdxDefIndex = defs.length

  while (rdxDefIndex--) {
    const { reducerName, isApiReducer, definitions } = defs[rdxDefIndex]

    types.push(
      formatTypeString<string, ''>(reducerName, ``, { reset: true }),
      formatTypeString<string, ''>(reducerName, ``),
    )

    if (isApiReducer) {
      types.push(
        `${formatTypeString<string, ''>(reducerName, ``)}_REQUEST`,
        `${formatTypeString<string, ''>(reducerName, ``)}_SUCCESS`,
        `${formatTypeString<string, ''>(reducerName, ``)}_FAILURE`,
      )
    }

    let definitionIdx = definitions.length

    while (definitionIdx--) {
      const { typeName, reducerKey, handlerType } = definitions[definitionIdx]

      types.push(typeName)

      if (handlerType === HandlerTypes.api) {
        types.push(
          `${typeName}_REQUEST`,
          `${typeName}_SUCCESS`,
          `${typeName}_FAILURE`,
          `${formatTypeString<string, string>(reducerKey, reducerName, { reset: true })}`,
        )
      }
    }
  }

  return keyMirror<string>(types)
}

const generateTypesFromStateObjectPaths = <State>(state: State, paths?: Array<ReflectedStatePath<State>>, prefix?: string) => {
  let _paths: Array<ReflectedStatePath<State>> = []

  if (paths == null) {
    paths = getObjectPaths(state)
  } else {
    // @ts-expect-error array types
    _paths = [].concat(paths)
  }

  if (!prefix) {
    prefix = ``
  }

  let index = _paths.length

  const types: string[] = []

  const resetConfig = { reset: true }

  while (index--) {
    const path = _paths[index]
    // @ts-expect-error path type
    const value = get(state, path, false)
    const shouldGenerateResetType = isObject(value)
    const shouldGenerateApiTypes = shouldGenerateResetType && Object.is(apiState, value)
    const formattedPath = path.replace(`.`, `_`)

    const setType = formatTypeString<string, string>(formattedPath, prefix)

    if (shouldGenerateApiTypes) {
      types.push(
        `${setType}_REQUEST`,
        `${setType}_SUCCESS`,
        `${setType}_FAILURE`,
      )
    }

    if (shouldGenerateResetType) {
      types.push(
        formatTypeString<string, string>(formattedPath, prefix, resetConfig),
      )
    }

    types.push(
      setType,
    )
  }

  return types as Array<RdxSetTypeName<Paths<State, 5, '_'>, ''> | RdxResetTypeName<Paths<State, 5, '_'>, ''>>
}

const extendTypes = <ModuleName extends string = ''>(currentTypes: RdxTypesObject<ModuleName>, ...newTypes: Array<KeyMirroredObject<string>>) => Object.assign(currentTypes, ...newTypes) as RdxTypesObject<ModuleName> & (typeof newTypes)[number]

export { generateTypes, generateTypesFromDefs, generateTypesFromStateObjectPaths, prefixTypes, extendTypes }
