import { createAction } from './create-action'
import { RdxDefinition, ActionObject, TypesObject } from '../types'
import { formatActionName, formatTypeString } from './internal'

const generateActions: (types: TypesObject) => ActionObject = types => {
  return Object.keys(types).reduce((actions, typeName) => {
    actions[formatActionName(typeName, ``, { reset: typeName.includes(`RESET`) })] = createAction(
      typeName,
    )

    return actions
  }, {})
}

const generateActionsFromDefs: (defs: RdxDefinition[]) => ActionObject = (defs = []) => {
  const actions = {}

  for (let idx = defs.length - 1; idx > -1; idx--) {
    const { reducerName, definitions } = defs[idx]

    actions[formatActionName(reducerName)] = createAction(formatTypeString(reducerName))
    actions[formatActionName(reducerName, ``, { reset: true })] = createAction(
      formatTypeString(reducerName, ``, { reset: true }),
    )
    definitions.map(({ actionName, typeName }) => {
      actions[actionName] = createAction(typeName)
    })
  }

  return actions
}

export { generateActions, generateActionsFromDefs }
