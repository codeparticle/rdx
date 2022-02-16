/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ApiRequestState,
  ReducerHandlers,
  ReflectedStatePath,
  Action,
} from '../types'
// this is an enum, so we can't use import type

import { createReducer } from './create-reducer'
import { ReducersMapObject } from 'redux'
import { createApiReducer } from './create-api-reducer'
import {
  createReducerHandlers,
} from '../internal/reducer-handlers'
import { RDX_INTERNAL_PREFIXES } from '../internal/constants/library-prefixes'
import { O } from 'ts-toolbelt'
import { createTypeDefinition, formatTypeString } from '../internal'
import { inspect } from 'util'

const notAnyOf = (values: any[]) => (key: any) => {
  for (let i = 0, len = values.length; i < len; i++) {
    if (key === values[i]) {
      return false
    }
  }

  return true
}

const createApiReducerFromHandlers = (apiHandlers: ReducerHandlers<ApiRequestState>) => {
  const dedupedApiHandlers = {}
  const apiHandlerKeys = Object.keys(apiHandlers)
  const successHandlerKey = apiHandlerKeys.find(key => key.endsWith(`_SUCCESS`))
  const requestHandlerKey = apiHandlerKeys.find(key => key.endsWith(`_REQUEST`))
  const failureHandlerKey = apiHandlerKeys.find(key => key.endsWith(`_FAILURE`))
  const resetHandlerKey = apiHandlerKeys.find(key => key.startsWith(`${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}RESET_`))
  const setHandlerKey = apiHandlerKeys.find(key => key.startsWith(`${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}SET_`))

  const notAlreadyAHandler = notAnyOf([
    successHandlerKey,
    requestHandlerKey,
    failureHandlerKey,
    resetHandlerKey,
    setHandlerKey,
  ])

  for (let i = 0, len = apiHandlerKeys.length; i < len; i++) {
    const key = apiHandlerKeys[i]

    if (notAlreadyAHandler(key)) {
      dedupedApiHandlers[key] = apiHandlers[key]
    }
  }

  return createApiReducer(
    {
      set: setHandlerKey as string,
      request: requestHandlerKey as string,
      success: successHandlerKey as string,
      failure: failureHandlerKey as string,
      reset: resetHandlerKey as string,
    },
    dedupedApiHandlers as ReducerHandlers<ApiRequestState>,
  )
}

const getCurrentObjectLevelFromPath = (str: ReflectedStatePath<O.Object>) => str.match(/\./g)?.length ?? 0

function createReducers<
  State extends O.Object,
  Prefix extends string,
> (
  stateObject: State,
  prefix: Prefix,
) {
  // const createBaseHandlers = reflectBaseHandlersOver(stateObject)
  // const createApiHandlers = reflectApiHandlersOver(stateObject)
  // sorting the paths by length ensures that the longest paths are processed first
  // meaning that we start with the leaf nodes and work our way up
  // const _paths: Array<ReflectedStatePath<State>> = (
  // paths
  // // @ts-expect-error array types
  // ? [].concat(paths)
  // : getObjectPaths(stateObject)
  // ).sort((a, b) => getCurrentObjectLevelFromPath(a) - getCurrentObjectLevelFromPath(b))

  // console.log(`========\n`, `_paths from createReducers`, _paths, `\n========`)
  // let result
  // const keys = Object.keys(stateObject)

  const keys = Object.keys(stateObject)
  let i = keys.length

  // let result = { ...stateObject }

  const stateHandlers: ReducerHandlers<State> = {}

  // const roots = rootPaths.length

  const bindHandlersToState = createReducerHandlers(stateObject)

  while (i--) {
    // const path = `${[_paths[i]]}`
    const key = keys[i]

    const value = stateObject[key]
    // const isRoot = !key.includes(`.`)
    // const valueIsObject = isObject(value)
    // const isApiReducer = Object.is(apiState, value)
    // let handlers: ReducerHandlers<State>
    // let created

    const typeDefinition = createTypeDefinition(value, key, prefix)
    // const valueIsObject = typeDefinition.handlerType === HandlerTypes.object

    Object.assign(stateHandlers, bindHandlersToState(typeDefinition))

    // if (typeDefinition.isApiReducer) {
    // created = createApiReducerFromHandlers(bindHandlersToState<ApiRequestState>(typeDefinition))
    // } else if (isRoot && (!valueIsObject || !hasKeys(value))) {
    // } else {
    // created = createReducer(typeDefinition.initialState, bindHandlersToState(typeDefinition))
    // }
    // } else if (valueIsObject) {
    //   created = createObjectReducer(value as O.Object, key, prefix)
    // }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    // result = setPath<State, Paths[number]>(result, key as Paths[number], created)

    console.log(`========\n`, `result`, inspect({
      // path,
      key,
      value,
      // handlers,
      // result,
      typeDefinition,
      stateHandlers,
      // level: getCurrentObjectLevelFromPath(path),
      // isRoot: isRootPath,
    }, { depth: 6 }), `\n========`)
  }

  if (prefix) {
    Object.assign(stateHandlers, {
      [formatTypeString(``, prefix, true)]: () => stateObject,
    })
  }

  const result = createReducer(stateObject, stateHandlers)

  return result
}

const extendReducers = <State>(
  currentReducers: ReducersMapObject<State>,
  ...reducers: Array<ReducersMapObject<any, Action<any, any>>>
) => Object.assign({}, currentReducers, ...reducers) as ReducersMapObject<State>

export {
  extendReducers,
  createReducers,
}

