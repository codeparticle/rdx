import type { O, S } from "ts-toolbelt"
import { formatSelectorName } from '../internal/string-helpers/formatters'
import type { ReflectedStatePath, SelectorsObject } from "../types"
import { get } from '../utils/get'
import { getObjectPaths } from '../utils/get-object-paths'

function selector<
  AppState extends O.Object,
  Path extends string,
> (
  path: Path,
) {
  return <Obj extends AppState>(state: Obj) => {
    // @ts-expect-error path type not allowed
    return get(state, path) as unknown as O.Path<Obj, S.Split<Path, '.'>>
  }
}

function createSelectors<AppState extends object, Prefix extends string> (initialState: AppState, paths?: Array<ReflectedStatePath<AppState>>, prefix?: Prefix) {
  let selectorPaths: Array<ReflectedStatePath<AppState>> = []
  const acc = {}

  if (paths == null) {
    selectorPaths = getObjectPaths<AppState>(initialState)
  } else {
    // @ts-expect-error array types
    selectorPaths = [].concat(paths)
  }

  for (let i = 0, len = selectorPaths.length; i < len; i++) {
    // @ts-expect-error {} type not allowed
    acc[formatSelectorName(selectorPaths[i], (prefix ?? ``) as Prefix)] = selector(selectorPaths[i])
  }

  return acc as SelectorsObject<AppState>
}

export { selector, createSelectors }
