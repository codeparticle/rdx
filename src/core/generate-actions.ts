import { createAction } from './create-action'
import { ActionObject, KeyMirroredObject } from '../types'
import { formatActionName } from '../internal'
import Case from 'case'

const { camel } = Case

const generateActions: (types: KeyMirroredObject) => ActionObject<any> = types => {
  return Object.keys(types).reduce((actions, typeName) => {
    const formattedActionName = typeName.startsWith(`SET`) ? formatActionName(typeName, ``, { reset: typeName.includes(`RESET`) }) : camel(typeName)

    actions[formattedActionName] = createAction(
      typeName,
    )

    return actions
  }, {})
}

const extendActions = (currentActions: ActionObject<any>, ...newActions: ActionObject<any>[]) => Object.assign(currentActions, ...newActions)

export { generateActions, extendActions }
