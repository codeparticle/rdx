import type { O } from 'ts-toolbelt'
import { apiState } from '../api'
import { formatActionName, formatTypeString } from '../internal/string-helpers/formatters'
import type { RdxAction, ActionCreator, ActionObject, KeyMirroredObject } from '../types'
import { getObjectPaths, get } from '../utils'
import { createAction } from './create-action'
import { camelCase } from 'change-case'

function createActions<State extends O.Object, Prefix extends string = ''> (state: State, paths?: string[], prefix?: Prefix): ActionObject<State, Prefix>
function createActions (state, paths, prefix) {
  const actions = {}

  let _paths: string[] = []

  if (paths == null) {
    _paths = getObjectPaths(state)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    _paths = [].concat(paths)
  }

  if (!prefix) {
    prefix = ``
  } else {
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
  actions.batchActions = createAction<RdxAction[]>(
    formatTypeString(
      `batch_actions`,
      ``,
    ),
  )

  for (let i = 0, len = _paths.length; i < len; i++) {
    const path = `${_paths[i]}`

    const splitPath = `${path}`.replace(/\./g, ` `)

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

  return actions
}

function createActionsFromTypes<ActionTypes extends string[]> (types: ActionTypes): Record<ActionTypes[number], ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends readonly string[]> (types: ActionTypes): Record<ActionTypes[number], ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends KeyMirroredObject<string[] | readonly string[]>> (types: ActionTypes): Record<ActionTypes[string], ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends O.Object> (types: ActionTypes): Record<ActionTypes[string], ActionCreator<any, any>> {
  // @ts-expect-error - issues from empty object initialization
  const actions: ActionRecord<ActionTypes> = {}
  let keys: string[]

  if (Array.isArray(types)) {
    keys = types
  } else {
    keys = Object.keys(types)
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    const type = keys[i]

    const action = createAction(type)

    actions[camelCase(type)] = action
  }

  return actions
}

function extendActions<S extends object, Prefix extends string = ''> (currentActions: ActionObject<S, Prefix>, ...newActions: O.Object[]) {
  return Object.assign({}, currentActions, ...newActions) as ActionObject<S, Prefix> & (typeof newActions)[number]
}

export { createActions, createActionsFromTypes, extendActions }
