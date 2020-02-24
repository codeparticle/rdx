import { RdxConfiguration, RdxModule } from '../types'
import { generateTypesFromDefs, prefixTypes } from './generate-types'
import { pipe } from '../utils/pipe'
import { defineState } from './generate-defs'
import { generateActionsFromDefs } from './generate-actions'
import { generateReducersFromDefs } from './generate-reducers'
import { generateSelectors } from './generate-selectors'

const createRdxModule = (config: RdxConfiguration) => <State>(
  userDefs: State,
): RdxModule<State> => {
  const rdxDefs = defineState<State>(userDefs)

  return {
    [config.prefix]: {
      types: pipe(generateTypesFromDefs, prefixTypes(config.prefix))(rdxDefs),
      actions: generateActionsFromDefs(rdxDefs, config.prefix),
      reducers: generateReducersFromDefs(rdxDefs, config.prefix),
      selectors: generateSelectors(userDefs, config.prefix),
      state: userDefs,
    },
  } as RdxModule<State>
}

export { createRdxModule }
