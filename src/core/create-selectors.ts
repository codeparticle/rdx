import type { O } from "ts-toolbelt"
import { formatSelectorName } from '../internal/string-helpers/formatters'
import type { PathsOf, SelectorsObject } from "../types"
import { get, PathOrBackup } from '../utils/get'
import { getObjectPaths } from '../utils/get-object-paths'

function selector<
  AppState extends O.Object,
  Path extends string,
> (
  path: Path,
): <Obj extends AppState>(state: Obj) => PathOrBackup<AppState, Path, null>
function selector (path) {
  return (state) => get(state, path)
}

function createSelectors<AppState extends object, Prefix extends string> (initialState: AppState, paths?: Array<PathsOf<AppState>>, prefix?: Prefix) {
  let selectorPaths: Array<PathsOf<AppState>> = []
  const acc = {}

  if (paths == null) {
    selectorPaths = getObjectPaths<AppState>(initialState)
  } else {
    selectorPaths = [].concat(paths)
  }

  for (let i = 0, len = selectorPaths.length; i < len; i++) {
    // @ts-expect-error {} type not allowed
    acc[formatSelectorName(selectorPaths[i], (prefix ?? ``) as Prefix)] = selector(selectorPaths[i])
  }

  return acc as SelectorsObject<AppState>
}

export { selector, createSelectors }
