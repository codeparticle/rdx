import { formatPrefix, formatTypeString } from './internal'
import { RdxDefinition, TypesObject } from '../types'

/**
 * Template string function that generates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */

function generateTypes(strings: TemplateStringsArray | string[]): TypesObject {
  return (((strings as TemplateStringsArray)?.raw ? strings[0] : strings) as string[]).reduce(
    (acc, typeName) => {
      const formattedType = formatTypeString(typeName)

      acc[formattedType] = formattedType

      return acc
    },
    {},
  )
}

const prefixTypes = (prefix: string) => (typesObject: TypesObject) => {
  const formattedPrefix = formatPrefix(prefix)

  const prefixedTypes = Object.values(typesObject).reduce((acc, type) => {
    acc[`${formattedPrefix}${type}`] = `${formattedPrefix}${type}`

    return acc
  }, {})

  return prefixedTypes
}

const generateTypesFromDefs: (defs: RdxDefinition[]) => TypesObject = (defs = []) => {
  const types = []

  for (const { reducerName, definitions } of defs) {
    types.push(formatTypeString(reducerName, ``, { reset: true }), formatTypeString(reducerName))

    for (const { typeName } of definitions) {
      types.push(typeName)
    }
  }

  return types.reduce((acc, typeName) => {
    acc[typeName] = typeName

    return acc
  }, {})
}

export { generateTypes, generateTypesFromDefs, prefixTypes }
