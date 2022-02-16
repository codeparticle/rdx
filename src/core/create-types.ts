import { camel } from 'case'
import { apiState } from '../api'
import { formatTypeString, createApiActionTypes } from '../internal'
import type {
  KeyMirroredObject,
  Paths,
  RdxActionType,
  RdxTypesObject,
  ReflectedStatePath,
  TypeDef,
} from '../types'
import { filter, get, getObjectPaths, keyMirror, map, pipe } from '../utils'

const isTemplateStringsArray = maybeTsArray => `raw` in maybeTsArray

/**
 * Template string function that creates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */

const createTypes = <TypeList extends string[] | TemplateStringsArray>(strings: TypeList): KeyMirroredObject<string> => {
  const types: readonly string[] = isTemplateStringsArray(strings) ? strings[0].split(`\n`) : strings

  return pipe<readonly string[], KeyMirroredObject<typeof types[number]>>(
    map(s => s.trim().replace(/\s+/g, ` `)),
    filter(Boolean),
    keyMirror,
  )(types)
}

const createRdxActionTypesFromState = <State>(state: State, paths?: Array<ReflectedStatePath<State>>, prefix?: string) => {
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

  while (index--) {
    const path = _paths[index]
    // @ts-expect-error path type
    const value = get(state, path, false)
    const shouldGenerateApiTypes = Object.is(apiState, value)
    const formattedPath = `${path}`.split(`.`).map(camel).join(`_`)

    const baseTypes: Pick<TypeDef, 'setType'|'resetType'> = {
      setType: formatTypeString(formattedPath, prefix),
      resetType: formatTypeString(formattedPath, prefix, true),
    }

    if (shouldGenerateApiTypes) {
      types.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ...Object.values(createApiActionTypes(baseTypes)),
      )
    } else {
      types.push(
        ...Object.values(baseTypes),
      )
    }
  }

  return types as Array<RdxActionType<Paths<State, 4, '_'>, ''>>
}

const extendTypes = <ModuleName extends string = ''>(currentTypes: RdxTypesObject<ModuleName>, ...newTypes: Array<KeyMirroredObject<string>>) => Object.assign(currentTypes, ...newTypes) as RdxTypesObject<ModuleName> & (typeof newTypes)[number]

export { createTypes, createRdxActionTypesFromState, extendTypes }
