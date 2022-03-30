import { Writable } from 'ts-toolbelt/out/List/Writable'

import { apiState } from '../api'
import { createApiActionTypes, formatTypeString } from '../internal'
import type { KeyMirroredObject, PathsOf, RdxActionType, RdxTypesObject } from '../types'
import { filter, get, getObjectPaths, keyMirror, map, pipe } from '../utils'

const isTemplateStringsArray = (maybeTsArray) => `raw` in maybeTsArray

/**
 * Template string function that creates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */

function createTypes<TypeList extends string[]>(
  strings: TypeList
): KeyMirroredObject<TypeList extends TemplateStringsArray ? TypeList['raw'] : TypeList>
function createTypes<TypeList extends readonly string[]>(
  strings: TypeList
): KeyMirroredObject<TypeList>
function createTypes<TypeList extends TemplateStringsArray>(
  strings: TypeList
): KeyMirroredObject<TypeList['raw']>
function createTypes(strings) {
  const types: readonly string[] = isTemplateStringsArray(strings)
    ? strings[0].split(`\n`)
    : strings

  return pipe<readonly string[], KeyMirroredObject<Writable<typeof types>>>(
    map((s) => s?.trim().replace(/\s+/g, ` `) ?? ``),
    filter(Boolean),
    keyMirror,
  )(types)
}

function createRdxActionTypesFromState<State>(
  state: State,
  paths?: string[],
  prefix?: string
): Array<RdxActionType<PathsOf<State>, ''>>
function createRdxActionTypesFromState(state, paths?, prefix?) {
  let _paths: string[] = []

  if (paths == null) {
    paths = getObjectPaths(state)
  } else {
    _paths = [paths].flat()
  }

  if (!prefix) {
    prefix = ``
  }

  let index = _paths.length

  const types: string[] = []

  while (index--) {
    const path = _paths[index]
    const value = get(state, path, false)
    const shouldGenerateApiTypes = Object.is(apiState, value)
    const formattedPath = `${path}`.replace(/\./g, `_`)

    const baseTypes = {
      setType: formatTypeString(formattedPath, prefix),
      resetType: formatTypeString(formattedPath, prefix, true),
    }

    if (shouldGenerateApiTypes) {
      types.push(
        // @ts-expect-error --- this is type safe; the compiler sees potential strings that cannot happen
        ...Object.values(createApiActionTypes(baseTypes)),
      )
    } else {
      types.push(...Object.values(baseTypes))
    }
  }

  return types
}

function extendTypes<ModuleName extends string = ''>(
  currentTypes: RdxTypesObject<ModuleName>,
  ...newTypes: Array<KeyMirroredObject<string[]>>
): RdxTypesObject<ModuleName> & typeof newTypes[number]
function extendTypes(currentTypes, ...newTypes) {
  return Object.assign(currentTypes, ...newTypes)
}

export { createRdxActionTypesFromState, createTypes, extendTypes }
