import { createAction } from './create-action'
import { RdxDefinition, ActionObject, TypesObject } from '../types'
import { formatActionName, formatTypeString } from '../internal'

const generateActions: (types: TypesObject) => ActionObject<any> = types => {
  return Object.keys(types).reduce((actions, typeName) => {
    actions[formatActionName(typeName, ``, { reset: typeName.includes(`RESET`) })] = createAction(
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

export { generateActions, generateActionsFromDefs }
