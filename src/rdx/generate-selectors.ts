import { RdxDefinition, SelectorsObject } from '../types'
import { formatSelectorName } from './internal/string-helpers/formatters'

const generateSelectorsFromDefs: (defs: RdxDefinition[]) => SelectorsObject = defs => {
  const selectors = {}

  for (const { reducerName, definitions } of defs) {
    if (!selectors[reducerName]) {
      selectors[reducerName] = {}
    }

    for (const { selectorName, reducerKey, initialState } of definitions) {
      selectors[reducerName][selectorName] = {
        selector: state => state?.[reducerName]?.[reducerKey] ?? initialState,
        keys: {
          reducerKey,
          initialState,
        },
      }
    }
  }

  const generated = Object.keys(selectors).reduce((generatedSelectors, reducerName) => {
    const reducerInitialState = {}

    for (const selectorName of Object.keys(selectors[reducerName])) {
      const selectorData = selectors[reducerName][selectorName]

      generatedSelectors[selectorName] = selectorData.selector
      reducerInitialState[selectorData.keys.reducerKey] = selectorData.keys.initialState
    }

    generatedSelectors[formatSelectorName(reducerName)] = state =>
      state?.[reducerName] ?? reducerInitialState

    return generatedSelectors
  }, {})

  return generated
}

export { generateSelectorsFromDefs }
