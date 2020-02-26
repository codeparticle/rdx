import { RdxConfiguration, RdxModule, KeyMirroredObject, RdxDefinition } from '../types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from '../utils/pipe'
import { defineState } from './generate-defs'
import { generateActions } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectors } from './generate-selectors'

const createRdxModule = (config: RdxConfiguration) => <State>(
  userDefs: State,
): RdxModule<State> => {
  const rdxDefs = defineState<State>(userDefs)
  const types = pipe<RdxDefinition[], KeyMirroredObject>(generateTypesFromDefs, prefixTypes(config.prefix))(rdxDefs)
  const actions = generateActions(types)

  return {
    [config.prefix]: {
      types,
      actions,
      reducers: generateReducersFromDefs(rdxDefs, config.prefix),
      selectors: generateSelectors(userDefs, config.prefix),
      state: userDefs,
    },
  } as RdxModule<State>
}

export { createRdxModule }
