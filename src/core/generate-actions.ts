import { createAction } from './create-action'
import { ActionObject, KeyMirroredObject, RdxGeneratedPrefixes } from '../types'
import { formatActionName } from '../internal'

const { camel } = require(`case`)

const generateActions: (types: KeyMirroredObject) => ActionObject<any> = types => {
  return Object.keys(types).reduce((actions, typeName) => {
    const formattedActionName = typeName.startsWith(RdxGeneratedPrefixes.SET as string) ? formatActionName(typeName, ``, { reset: typeName.includes(RdxGeneratedPrefixes.RESET as string) }) : camel(typeName)

    actions[formattedActionName] = createAction(
      typeName,
    )

    return actions
  }, {})
}

const extendActions = <S = any>(currentActions: ActionObject<S>, ...newActions: ActionObject<S>[]): ActionObject<S> => Object.assign(currentActions, ...newActions)

export { generateActions, extendActions }
