import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import { formatSelectorName } from '../internal/string-helpers/formatters'
import type { PathsOf, SelectorsObject } from "../types"
import { getObjectPaths, selector } from '../utils'

function createSelectors<AppState extends _Object, Prefix extends string> (initialState: AppState, paths?: Array<PathsOf<AppState>>, prefix?: Prefix): SelectorsObject<AppState>
function createSelectors (initialState, paths, prefix) {
  let selectorPaths: string[] = []
  const acc = {}

  if (paths == null) {
    selectorPaths = getObjectPaths(initialState)
  } else {
    selectorPaths = [].concat(paths)
  }

  for (let i = 0, len = selectorPaths.length; i < len; i++) {
    acc[formatSelectorName(selectorPaths[i], prefix ?? ``)] = selector(selectorPaths[i])
  }

  return acc
}

export { createSelectors }
