import { RdxConfiguration } from '../types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from './internal'
import { generateDefs } from './generate-defs'
import { generateActionsFromDefs } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectorsFromDefs } from './generate-selectors'
import { combineReducers } from 'redux'

const createRdxModule = (config: RdxConfiguration) => (userDefs: TemplateStringsArray | string) => {
  const rdxDefs = generateDefs(userDefs, config)

  const types = pipe(generateTypesFromDefs, prefixTypes(config.prefix || ``))(rdxDefs)
  const actions = generateActionsFromDefs(rdxDefs)
  const reducers = generateReducersFromDefs(rdxDefs)
  const selectors = generateSelectorsFromDefs(rdxDefs)

  console.log({ reducers })

  return {
    types,
    actions,
    reducers: combineReducers(reducers),
    selectors,
  }
}

export { createRdxModule }
