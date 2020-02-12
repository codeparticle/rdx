import { RdxDefinition, SelectorsObject } from '../types'
import { formatSelectorName } from './internal/string-helpers/formatters'
import { get } from './internal/get'
import { paths } from './internal/paths'

const generateSelectors = <T = object>(initialState: T) => {
  const selectorPaths = paths(initialState)
  const selectors = {}

  for (let i = selectorPaths.length - 1; i > -1; i--) {
    const formatted = selectorPaths[i].join(`_`)

    selectors[formatSelectorName(formatted)] = newState => get(newState, selectorPaths[i], get(initialState, selectorPaths[i]))
  }

  return selectors
}

const generateSelectorsFromDefs: (defs: RdxDefinition[]) => SelectorsObject = defs => {
  const selectors = {}

  for ( let defIndex = defs.length - 1; defIndex > -1; defIndex-- ) {

    const { reducerName, definitions } = defs[defIndex]

    if (!selectors[reducerName]) {
      selectors[reducerName] = {}
    }

    for (let currentDefinition = definitions.length - 1; currentDefinition > -1; currentDefinition--) {
      const { selectorName, reducerKey, initialState } = definitions[currentDefinition]

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

    const selectorPaths = Object.keys(selectors[reducerName])

    for (let i = selectorPaths.length - 1; i > -1; i--) {
      const selectorName = selectorPaths[i]
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

export { generateSelectors, generateSelectorsFromDefs }
