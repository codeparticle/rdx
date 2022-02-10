import { O } from 'ts-toolbelt'
import { apiState } from '../api'
import { formatActionName, formatTypeString, camel, snake } from '../internal/string-helpers/formatters'
import { Action, ActionCreator, ActionObject, KeyMirroredObject, ReflectedStatePath } from '../types'
import { getObjectPaths, get, isObject } from '../utils'
import { createAction } from './create-action'

const generateActions = <State extends O.Object, Prefix extends string = ''>(state: State, paths?: Array<ReflectedStatePath<State>>, prefix?: Prefix) => {
  const actions = {}
  const resetConfig = { reset: true }

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
    actions[formatActionName(prefix, ``, resetConfig)] = createAction<never, never>(
      formatTypeString<string, string>(
        ``,
        prefix,
        resetConfig,
      ),
    )

    // @ts-expect-error - we know the type of prefix
    actions[formatActionName(prefix, ``)] = createAction<State>(
      formatTypeString<string, string>(
        ``,
        prefix,
      ),
    )
  }

  // @ts-expect-error - actions is an object
  actions.batchActions = createAction<Action[]>(
    formatTypeString<string, string>(
      `BATCH_ACTIONS`,
      ``,
    ),
  )

  for (let i = 0, len = _paths.length; i < len; i++) {
    const path = _paths[i]
    const snakedPath = snake(path)
    // @ts-expect-error - path type
    const value = get(state, path, false)

    const shouldGenerateResetAction = isObject(value)
    const shouldGenerateApiActions = shouldGenerateResetAction && Object.is(apiState, value)

    if (shouldGenerateResetAction) {
      // @ts-expect-error string types are too stringent at this point
      actions[formatActionName(snakedPath, prefix, resetConfig)] = createAction(
        formatTypeString<string, string>(
          snakedPath,
          prefix,
          resetConfig,
        ),
      )
    }

    const setAction = formatActionName(snakedPath, prefix)

    // @ts-expect-error - we know that the type is correct
    actions[setAction] = createAction(
      formatTypeString(
        snakedPath,
        prefix,
      ),
    )

    if (shouldGenerateApiActions) {
      // @ts-expect-error - we know that the type is correct
      actions[`${setAction}Request`] = createAction(
        `${formatTypeString(snakedPath, prefix)}_REQUEST`,
      )
      // @ts-expect-error - we know that the type is correct
      actions[`${setAction}Success`] = createAction(
        `${formatTypeString(snakedPath, prefix)}_SUCCESS`,
      )
      // @ts-expect-error - we know that the type is correct
      actions[`${setAction}Failure`] = createAction(
        `${formatTypeString(snakedPath, prefix)}_ERROR`,
      )
    }
  }

  return actions as unknown as ActionObject<State, Prefix>
}

const generateActionsFromTypes = (types: KeyMirroredObject<string>): Record<string, ActionCreator<any, any>> => {
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

export { generateActions, generateActionsFromTypes, extendActions }
