import { formatTypeString } from '../internal'
import { RdxDefinition, TypesObject } from '../types'
import { filter } from '../utils/filter'

/**
 * Template string function that generates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */
const isTemplateStringsArray = maybeTsArray => `raw` in maybeTsArray

const aggregateTypes = (acc: TypesObject, typeName: string) => {
  const formattedType = formatTypeString(typeName)

  if ( formattedType !== `SET`) {
    acc[formattedType] = formattedType
  }

  return acc
}

const generateTypes: (strings: TemplateStringsArray | string[]) => TypesObject = strings => {
  const types = isTemplateStringsArray(strings) ? strings[0].split(`\n`) : strings

  return filter(Boolean)(types as string[]).reduce(aggregateTypes, {}) as TypesObject
}

const prefixTypes = (prefix: string) => (typesObject: TypesObject) => {

  const prefixedTypes = Object.values(typesObject).reduce((acc, type) => {
    const formatted = formatTypeString(type as string, prefix)

    acc[formatted] = formatted

    return acc
  }, {})

  return prefixedTypes
}

const generateTypesFromDefs: (defs: RdxDefinition[]) => TypesObject = (defs = []) => {
  const types = []

  for (let rdxDefIdx = defs.length - 1; rdxDefIdx > -1; rdxDefIdx--) {
    const { reducerName, definitions } = defs[rdxDefIdx]

    types.push(formatTypeString(reducerName, ``, { reset: true }), formatTypeString(reducerName))

    for (let definitionIdx = definitions.length - 1; definitionIdx > -1; definitionIdx--) {
      types.push(definitions[definitionIdx].typeName)
    }

  }

  return types.reduce((acc, typeName) => {
    acc[typeName] = typeName

    return acc
  }, {})
}

export { generateTypes, generateTypesFromDefs, prefixTypes }
