/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { apiState } from '../api'
import { formatActionName, formatTypeString } from '../internal/string-helpers/formatters'
import type { ActionCreator, ActionObject, KeyMirroredObject, PathsOf } from '../types'
import { getObjectPaths, get } from '../utils'
import { createAction } from './create-action'
import { camelCase } from 'change-case'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import { ValueOf } from 'ts-essentials'

function createActions<State extends _Object, Prefix extends string = ''> (state: State, paths?: string[], prefix?: Prefix): ActionObject<State, ''>
function createActions (state, paths, prefix) {
  const actions = {}

  let _paths: string[] = []

  if (paths == null) {
    _paths = getObjectPaths(state)
  } else {
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
  actions.batchActions = createAction(
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

    actions[resetAction] = createAction(
      resetActionType,
    )

    const setAction = formatActionName(splitPath, prefix)
    const setActionType = formatTypeString(
      splitPath,
      prefix,
    )

    actions[setAction] = createAction(
      setActionType,
    )

    if (shouldGenerateApiActions) {
      actions[`${setAction}Request`] = createAction(
        `${setActionType}_REQUEST`,
      )

      actions[`${setAction}Success`] = createAction(
        `${setActionType}_SUCCESS`,
      )

      actions[`${setAction}Failure`] = createAction(
        `${setActionType}_FAILURE`,
      )
    }
  }

  return actions
}

function createActionsFromTypes<ActionTypes extends string[]> (types: ActionTypes): Record<ActionTypes[number], ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends readonly string[]> (types: ActionTypes): Record<ActionTypes[number], ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends KeyMirroredObject<string[]>> (types: ActionTypes): Record<PathsOf<ActionTypes, 0>, ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends KeyMirroredObject<readonly string[]>> (types: ActionTypes): Record<PathsOf<ActionTypes, 0>, ActionCreator<any, any>>
function createActionsFromTypes<ActionTypes extends Record<string, string>> (types: ActionTypes): Record<ValueOf<ActionTypes>, ActionCreator<any, any>>
function createActionsFromTypes (types) {
  const actions = {}
  let keys

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

function extendActions<S extends _Object, CustomActions extends Record<string, ActionCreator<any, any>> = Record<string, ActionCreator<any, any>>, Prefix extends string = ''> (
  currentActions: ActionObject<S, Prefix>,
  newActions: Record<string, ActionCreator<any, any>>
): ActionObject<S, Prefix, CustomActions>
function extendActions (currentActions, newActions) {
  return Object.assign({}, currentActions, newActions)
}

export { createActions, createActionsFromTypes, extendActions }
