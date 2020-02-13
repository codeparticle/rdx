import { formatPrefix, formatTypeString } from './internal'
import { RdxDefinition, TypesObject } from './types'
import Case from 'case'

const { constant } = Case

/**
 * Template string function that generates a key mirrored object
 * from a set of action types, separated by newline.
 * Actions can be in any case, and separated by spaces, which will
 * be replaced with underscores.
 * @param strings
 */

function generateTypes(strings: TemplateStringsArray): TypesObject {
  return (strings[0]).split(`\n`).filter(Boolean).reduce(
    (acc, typeName) => {
      const formattedType = constant(typeName.trim())

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
