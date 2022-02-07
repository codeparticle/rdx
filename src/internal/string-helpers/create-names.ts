import { formatActionName, formatSelectorName, formatStateName, formatTypeString } from './formatters'
import type {
  RdxResetActionName,
  RdxResetTypeName,
  RdxSelectorName,
  RdxSetActionName,
  RdxSetTypeName,
} from '../../types'
import { CamelCase } from "type-fest"

export const createNames: <Base extends string, Prefix extends string>(baseString: Base, prefix: Prefix) => {
  typeName: RdxSetTypeName<Base, Prefix> | RdxResetTypeName<Base, Prefix>
  actionName: RdxSetActionName<Base, Prefix> | RdxResetActionName<Base, Prefix>
  selectorName: RdxSelectorName<Base, Prefix>
  reducerKey: CamelCase<`${Base | Prefix}`>
} = (baseString, prefix) => ({
  // @ts-expect-error baseString may be the prefix and the types are mad about that
  typeName: formatTypeString((baseString || prefix), prefix),
  actionName: formatActionName<string, string>(baseString, prefix),
  selectorName: formatSelectorName<string, string>(baseString, prefix),
  reducerKey: formatStateName(baseString || prefix),
})
