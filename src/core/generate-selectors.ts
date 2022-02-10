import { O } from "ts-toolbelt"
import { Split } from "ts-toolbelt/out/String/Split"
import { formatSelectorName } from '../internal/string-helpers/formatters'
import type { ReflectedStatePath, SelectorsObject } from "../types"
import { get } from '../utils/get'
import { getObjectPaths } from '../utils/get-object-paths'

function pick<Obj extends O.Object, Path extends string = ReflectedStatePath<Obj>> (path: Path) {
  // @ts-expect-error path type
  return (state: Obj) => get(state, path) as O.Path<Obj, Split<Path, '.'>>
}

function generateSelectors<AppState extends object, Prefix extends string> (initialState: AppState, paths?: Array<ReflectedStatePath<AppState>>, prefix?: Prefix) {
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
    acc[formatSelectorName(selectorPaths[i], (prefix ?? ``) as Prefix)] = pick(
      selectorPaths[i],
    )
  }

  return acc as unknown as SelectorsObject<AppState>
}

export { generateSelectors }
