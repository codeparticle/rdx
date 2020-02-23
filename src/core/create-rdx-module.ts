import { RdxConfiguration, RdxOutput } from '../types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from '../utils/pipe'
import { defineState } from './generate-defs'
import { generateActionsFromDefs } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectors } from './generate-selectors'
import { combineReducers, ReducersMapObject } from 'redux'

const createRdxModule = (config: RdxConfiguration) => <State>(userDefs: State): RdxOutput<State> => {
  const rdxDefs = defineState<State>(userDefs)

  return {
    types: pipe(generateTypesFromDefs, prefixTypes(config.prefix))(rdxDefs),
    actions: generateActionsFromDefs(rdxDefs, config.prefix),
    reducers: combineReducers<State>(generateReducersFromDefs(rdxDefs, config.prefix) as ReducersMapObject<State>),
    selectors: generateSelectors(userDefs, config.prefix),
    prefix: config.prefix,
    state: userDefs,
  } as RdxOutput<State>
}

export { createRdxModule }
