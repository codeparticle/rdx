import { formatPrefix, formatTypeString } from './internal'
import { RdxDefinition, TypesObject } from '../types'
import Case from 'case'

const { constant } = Case

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
