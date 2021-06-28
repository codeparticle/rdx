import {
  formatActionName,
  formatSelectorName,
  formatTypeString,
  formatStateName,
} from './formatters'

export const createNames = (baseString: string, prefix?: string): {
  typeName: string
  actionName: string
  selectorName: string
  reducerKey: string
} => ({
  typeName: formatTypeString(baseString, prefix),
  actionName: formatActionName(baseString, prefix),
  selectorName: formatSelectorName(baseString, prefix),
  reducerKey: formatStateName(baseString),
})
