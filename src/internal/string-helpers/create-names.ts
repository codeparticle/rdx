import type { GeneratedReducerNames, RdxResetActionType } from '../../types'
import { formatActionName, formatStateName, formatTypeString } from './formatters'

function createHandlerKeys<BaseName extends string, Prefix extends string>(
  baseName: BaseName,
  prefix: Prefix,
): GeneratedReducerNames<BaseName, Prefix> {
  return {
    setType: formatTypeString((baseName || prefix) as BaseName, (baseName ? prefix : ``) as Prefix),
    resetType: formatTypeString(
      baseName || prefix,
      baseName ? prefix : ``,
      true,
    ) as RdxResetActionType<BaseName, Prefix>,
    actionName: formatActionName(baseName, prefix),
    resetActionName: formatActionName(baseName, prefix, true),
    reducerKey: formatStateName(baseName || prefix),
  }
}

export { createHandlerKeys }
