import { createAction } from './create-action'
import { RdxDefinition, ActionObject, KeyMirroredObject } from '../types'
import { formatActionName, formatTypeString } from '../internal'
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

const generateActionsFromDefs: (defs: RdxDefinition[], prefix?: string) => ActionObject<any> = (defs = [], prefix = ``) => {
  const actions = {}
  let idx = defs.length

  while(idx--) {
    const { reducerName, definitions } = defs[idx]

    actions[formatActionName(reducerName, prefix)] = createAction(formatTypeString(reducerName, prefix))
    actions[formatActionName(reducerName, prefix, { reset: true })] = createAction(
      formatTypeString(reducerName, prefix, { reset: true }),
    )

    definitions.map(({ actionName, typeName }) => {
      actions[formatActionName(actionName, prefix)] = createAction(formatTypeString(typeName, prefix))
    })
  }

  return actions
}

const extendActions = (currentActions: ActionObject<any>, ...newActions: ActionObject<any>[]) => Object.assign(currentActions, ...newActions)

export { generateActions, generateActionsFromDefs, extendActions }
