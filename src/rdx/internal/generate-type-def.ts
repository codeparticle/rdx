import { pipe } from './pipe'
import { map } from './map'
import { createNames, splitBy } from './string-helpers'
import { TypeDef } from '../../types'
import { deriveInitialState } from './derive-initial-state'
import { isObject } from 'util'

const generateObjectTypeDef = prefix => ([key, val]) => {
  const definition: TypeDef = {
    typeName: ``,
    actionName: ``,
    selectorName: ``,
    reducerKey: ``,
    handlerType: `default`,
    initialState: null,
  }

  definition.reducerKey = key
  definition.handlerType = (Array.isArray(val) ? `array` : typeof val) as TypeDef['handlerType']
  definition.initialState = deriveInitialState(definition.handlerType, val)
  Object.assign(definition, createNames(key, prefix))

  return definition as TypeDef
}
/**
 * generates type definitions from the given template string.
 * these type definitions are used to create selectors, actions, reducers, and types
 */

function generateObjectTypeDefs<T=object>(obj: T, prefix?: string): TypeDef[] {

  const makeDef = generateObjectTypeDef(prefix)
  const keys = Object.keys(obj)

  const hasMultipleProperties = keys.length > 1

  if (hasMultipleProperties) {
    const defs = Object.entries(obj).map(makeDef)

    return defs
  } else {
    const key = Object.getOwnPropertyNames(obj)[0]
    const val = obj[key]

    return [makeDef([key,val])]
  }

}

const generateTypeDef: (typeDefString: string, prefix?: string) => TypeDef = (
  typeDefString,
  prefix,
) => {
  const definition: TypeDef = {
    typeName: ``,
    actionName: ``,
    selectorName: ``,
    reducerKey: ``,
    handlerType: `default`,
    initialState: null,
    raw: typeDefString,
  }

  if (!typeDefString.indexOf(`|`)) {
    return {
      ...definition,
      initialState: null,
    }
  }

  const [type, typeDef, value] = typeDefString.split(`|`).map(s => s.trim())
  const names = type.length ? createNames(type, prefix) : definition

  return {
    ...definition,
    ...names,
    ...(typeDef ? { handlerType: typeDef } : {}),
    ...(typeDef ? { initialState: deriveInitialState(typeDef, value) } : {}),
  } as TypeDef
}

const generateTypeDefs = (v: string | object, prefix = ``) => isObject(v) && !Array.isArray(v)
  ? generateObjectTypeDefs(v, prefix)
  : pipe<string>(splitBy(`\n`), map(s => generateTypeDef(s, prefix)))(v as string)

export { generateTypeDefs, generateTypeDef }
