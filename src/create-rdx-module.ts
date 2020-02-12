import { RdxConfiguration, RdxOutput } from './types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from './internal'
import { generateDefs } from './generate-defs'
import { generateActionsFromDefs } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectorsFromDefs } from './generate-selectors'
import { combineReducers, ReducersMapObject } from 'redux'

const createRdxModule: (config: RdxConfiguration) => <State=object>(userDefs: State) => RdxOutput<State> =
  config => <S>(userDefs) => {
    const rdxDefs = generateDefs(userDefs, config)

    const types =  pipe(generateTypesFromDefs, prefixTypes(config.prefix || ``))(rdxDefs)
    const actions = generateActionsFromDefs(rdxDefs)
    const selectors = generateSelectorsFromDefs(rdxDefs)
    const reducers = generateReducersFromDefs(rdxDefs)

    return {
      types,
      actions,
      reducers: combineReducers<S>(reducers as ReducersMapObject<S>),
      selectors,
    }
  }

export { createRdxModule }
