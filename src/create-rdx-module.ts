import { RdxConfiguration, RdxOutput } from './types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from './internal'
import { generateDefs } from './generate-defs'
import { generateActionsFromDefs } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectors } from './generate-selectors'
import { combineReducers, ReducersMapObject } from 'redux'

const createRdxModule: (config: RdxConfiguration) => <State>(userDefs: State) => RdxOutput<State> =
  config => <S>(userDefs) => {
    const rdxDefs = generateDefs(userDefs, config)

    const types =  pipe(generateTypesFromDefs, prefixTypes(config.prefix || ``))(rdxDefs)
    const actions = generateActionsFromDefs(rdxDefs)
    const selectors = generateSelectors(userDefs)
    const reducers = combineReducers<S>(generateReducersFromDefs(rdxDefs) as ReducersMapObject<S>)

    return {
      types,
      actions,
      reducers,
      selectors,
    }
  }

export { createRdxModule }
