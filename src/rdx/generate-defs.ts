import {
  generateTypeDefs,
} from './internal'
import { RdxDefinition, RdxConfiguration } from '../types'

const defineState = (state: object): RdxDefinition[] => {
  const entries = Object.entries(state).map(([key, value]) => {
    return {
      reducerName: key,
      definitions: generateTypeDefs(value, key),
    }
  })

  return entries
}

function generateDefs<T = object>(values: T, config: RdxConfiguration): RdxDefinition[]
function generateDefs(values): RdxDefinition[] {
  return defineState(values)
}

export { generateDefs }
