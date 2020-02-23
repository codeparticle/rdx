import { formatTypeString } from '../internal'
import { RdxDefinition, TypesObject } from '../types'
import { filter } from '../utils/filter'
import { keyMirror, pipe, map } from '../utils'

const isTemplateStringsArray = maybeTsArray => `raw` in maybeTsArray

/**
 * Template string function that generates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */

const generateTypes: (strings: TemplateStringsArray | string[]) => TypesObject = strings => {
  const types = isTemplateStringsArray(strings) ? strings[0].split(`\n`) : strings

  return pipe<string[], TypesObject>(
    filter(Boolean),
    map(typeName => formatTypeString(typeName).slice(4)),
    keyMirror,
  )(types as string[])
}

const prefixTypes = (prefix: string) => (typesObject: TypesObject) => {

  const prefixedTypes = pipe(
    filter(Boolean),
    map(type => formatTypeString(type, prefix)),
    keyMirror,
  )(Object.keys(typesObject))

  return prefixedTypes
}

const generateTypesFromDefs: (defs: RdxDefinition[]) => TypesObject = (defs = []) => {
  const types = []
  let rdxDefIndex = defs.length

  while(rdxDefIndex--) {
    const { reducerName, definitions } = defs[rdxDefIndex]

    types.push(formatTypeString(reducerName, ``, { reset: true }), formatTypeString(reducerName))

    let definitionIdx = definitions.length

    while(definitionIdx--) {
      types.push(definitions[definitionIdx].typeName)
    }

  }

  return keyMirror(types)
}

export { generateTypes, generateTypesFromDefs, prefixTypes }
