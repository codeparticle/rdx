import { SelectorsObject } from '../types'
import { formatSelectorName } from '../internal/string-helpers/formatters'
import { get } from '../utils/get'
import { getObjectPaths } from '../utils/get-object-paths'

const generateSelectors = <T = object>(initialState: T): SelectorsObject => {
  const selectorPaths = getObjectPaths(initialState)
  const selectors = {}

  for (let i = selectorPaths.length - 1; i > -1; i--) {
    const formatted = selectorPaths[i].join(`_`)

    selectors[formatSelectorName(formatted)] = newState => get(
      newState,
      selectorPaths[i],
      get(initialState, selectorPaths[i]),
    )
  }

  return selectors
}

export { generateSelectors }
