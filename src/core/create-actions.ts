import { O } from 'ts-toolbelt'
import { apiState } from '../api'
import { formatActionName, formatTypeString, camel } from '../internal/string-helpers/formatters'
import { Action, ActionCreator, ActionObject, KeyMirroredObject, ReflectedStatePath } from '../types'
import { getObjectPaths, get } from '../utils'
import { createAction } from './create-action'

const createActions = <State extends O.Object, Prefix extends string = ''>(state: State, paths?: Array<ReflectedStatePath<State>>, prefix?: Prefix) => {
  const actions = {}

  let _paths: Array<ReflectedStatePath<State>> = []

  if (paths == null) {
    _paths = getObjectPaths<State>(state)
  } else {
    // @ts-expect-error array types
    _paths = [].concat(paths)
  }

  if (!prefix) {
    prefix = `` as Prefix
  } else {
    // @ts-expect-error - we know the type of prefix
    actions[formatActionName(prefix, ``, true)] = createAction<never, never>(
      formatTypeString(
        ``,
        prefix,
        true,
      ),
    )

    // @ts-expect-error - we know the type of prefix
    actions[formatActionName(prefix, ``)] = createAction<State>(
      formatTypeString(
        ``,
        prefix,
      ),
    )
  }

  // @ts-expect-error - actions is an object
  actions.batchActions = createAction<Action[]>(
    formatTypeString(
      `batch_actions`,
      ``,
    ),
  )

  for (let i = 0, len = _paths.length; i < len; i++) {
    const path = `${_paths[i]}`

    const splitPath = `${path}`.replace(/\./g, ` `)

    // @ts-expect-error - path type
    const value = get(state, path, false)

    const shouldGenerateApiActions = Object.is(apiState, value)

    const resetAction = formatActionName(splitPath, prefix, true)
    const resetActionType = formatTypeString(
      splitPath,
      prefix,
      true,
    )

    // @ts-expect-error string types are too stringent at this point
    actions[resetAction] = createAction(
      resetActionType,
    )

    const setAction = formatActionName(splitPath, prefix)
    const setActionType = formatTypeString(
      splitPath,
      prefix,
    )

    // @ts-expect-error - we know that the type is correct
    actions[setAction] = createAction(
      setActionType,
    )

    if (shouldGenerateApiActions) {
      // @ts-expect-error - we know that the type is correct
      actions[`${setAction}Request`] = createAction(
        `${setActionType}_REQUEST`,
      )
      // @ts-expect-error - we know that the type is correct
      actions[`${setAction}Success`] = createAction(
        `${setActionType}_SUCCESS`,
      )
      // @ts-expect-error - we know that the type is correct
      actions[`${setAction}Failure`] = createAction(
        `${setActionType}_FAILURE`,
      )
    }
  }

  return actions as unknown as ActionObject<State, Prefix>
}

const createActionsFromTypes = (types: KeyMirroredObject<string>): Record<string, ActionCreator<any, any>> => {
  const actions = {}
  const keys = Object.keys(types)

  for (let i = 0, len = keys.length; i < len; i++) {
    const type = keys[i]

    const action = createAction(type)

    actions[camel(type)] = action
  }

  return actions
}

function extendActions<S extends object, Prefix extends string = ''> (currentActions: ActionObject<S, Prefix>, ...newActions: O.Object[]) {
  return Object.assign({}, currentActions, ...newActions) as ActionObject<S, Prefix> & (typeof newActions)[number]
}

export { createActions, createActionsFromTypes, extendActions }
