import { SelectorsObject } from '../types'
import { formatSelectorName } from '../internal/string-helpers/formatters'
import { get } from '../utils/get'
import { getObjectPaths } from '../utils/get-object-paths'

const generateSelectors = <T>(initialState: T, prefix = ``): SelectorsObject<T> => {
  const selectorPaths = getObjectPaths(initialState)

  return selectorPaths.reduce((acc, path) => {
    const formatted = [].concat(path).join(`_`)

    acc[formatSelectorName(formatted, prefix)] = newState => get(newState, path, get(initialState, path))

    return acc
  }, {})

}

export { generateSelectors }
