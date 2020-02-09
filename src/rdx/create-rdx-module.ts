import { RdxConfiguration, UserDefinedReducers, RdxOutput } from '../types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from './internal'
import { generateDefs } from './generate-defs'
import { generateActionsFromDefs } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectorsFromDefs } from './generate-selectors'
import { combineReducers } from 'redux'

function createRdxModuleFromString(config: RdxConfiguration, userDefs: TemplateStringsArray | string | UserDefinedReducers): RdxOutput<any> {
  const rdxDefs = generateDefs(userDefs, config)

  const types = pipe(generateTypesFromDefs, prefixTypes(config.prefix || ``))(rdxDefs)
  const actions = generateActionsFromDefs(rdxDefs)
  const reducers = generateReducersFromDefs(rdxDefs)
  const selectors = generateSelectorsFromDefs(rdxDefs)

  return {
    types,
    actions,
    reducers: combineReducers(reducers),
    selectors,
  }
}

function createRdxModule(config: RdxConfiguration): (userDefs: TemplateStringsArray | string | UserDefinedReducers)  => any {
  return (userDefs) =>{
    if (typeof userDefs === `string` || Array.isArray(userDefs)) {
      return createRdxModuleFromString(config,userDefs)
    }
  }

}

export { createRdxModule }
