import { createNames } from './string-helpers'
import { TypeDef } from '../../types'
import { deriveInitialState } from './derive-initial-state'

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

const generateTypeDefs = generateObjectTypeDefs

export { generateTypeDefs }
