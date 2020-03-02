import { formatTypeString } from '../internal'
import { RdxDefinition, KeyMirroredObject, HandlerTypes, RdxGeneratedPrefixes } from '../types'
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

const generateTypes: (strings: TemplateStringsArray | string[]) => KeyMirroredObject = strings => {
  const types = isTemplateStringsArray(strings) ? strings[0].split(`\n`) : strings

  return pipe<string[], KeyMirroredObject>(
    map(s => s.trim()),
    filter(Boolean),
    map(typeName => formatTypeString(typeName).slice(
      typeName.startsWith(RdxGeneratedPrefixes.SET)
        ? 0 // Don't remove SET_ if the user put that in
        : 4, // but do remove it from the out of formatTypeString if they didn't
    )),
    keyMirror,
  )(types as string[])
}

const prefixTypes = (prefix: string) => (typesObject: KeyMirroredObject) => {

  const prefixedTypes = pipe(
    filter(Boolean),
    map(type => formatTypeString(type, prefix, { reset: type.startsWith(RdxGeneratedPrefixes.RESET) })),
    keyMirror,
  )(Object.keys(typesObject))

  return prefixedTypes
}

const generateTypesFromDefs: (defs: RdxDefinition[]) => KeyMirroredObject = (defs = []) => {
  const types = []
  let rdxDefIndex = defs.length

  while(rdxDefIndex--) {
    const { reducerName, isApiReducer, definitions } = defs[rdxDefIndex]

    types.push(formatTypeString(reducerName, ``, { reset: true }), formatTypeString(reducerName))

    if ( isApiReducer ) {
      types.push(
        `${formatTypeString(reducerName)}_REQUEST`,
        `${formatTypeString(reducerName)}_SUCCESS`,
        `${formatTypeString(reducerName)}_FAILURE`,
      )
    }

    let definitionIdx = definitions.length

    while(definitionIdx--) {
      const { typeName, reducerKey, handlerType } = definitions[definitionIdx]

      types.push(typeName)

      if (handlerType === HandlerTypes.api) {
        types.push(
          `${typeName}_REQUEST`,
          `${typeName}_SUCCESS`,
          `${typeName}_FAILURE`,
          `${formatTypeString(`${reducerName}_${reducerKey}`, ``, { reset: true })}`,
        )
      }
    }

  }

  return keyMirror(types) as unknown as KeyMirroredObject
}

const extendTypes = (currentTypes: KeyMirroredObject, ...newTypes: KeyMirroredObject[]) => Object.assign(currentTypes, ...newTypes)

export { generateTypes, generateTypesFromDefs, prefixTypes, extendTypes }
