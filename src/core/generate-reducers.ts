import {
  Handler,
  HandlerTypes, RdxReducer, ReflectedStatePath,
} from '../types'
import type {
  Action,
  PregeneratedReducer,
  PregeneratedReducerKeys,
  RdxDefinition,
  TypeDef,
} from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from '../internal/string-helpers/formatters'
import { combineReducers, ReducersMapObject } from 'redux'
import { get, getObjectPaths, isObject, pipe, setPath } from '../utils'
import { defineState } from './generate-defs'
import { apiState } from '../api'
import { createApiReducer } from './create-api-reducer'
import { createApiReducerHandlers, recursivelyCombineReducers } from '../internal'
import { RDX_INTERNAL_PREFIXES } from '../internal/constants/library-prefixes'
import { O } from 'ts-toolbelt'
import { inspect } from 'util'

const notAnyOf = (values: any[]) => (key: any) => {
  for (let i = 0, len = values.length; i < len; i++) {
    if (key === values[i]) {
      return false
    }
  }

  return true
}

const replaceReducerState = <S = any>(_: S, action: Action<any, any>): S => action.payload

const overwriteReducerState = <S extends O.Object>(state: S, action: Action<S, any>): S => {
  const newState = {
    ...state,
    ...action.payload,
  }

  console.log(`========\n`, `overwrite reducer is being called: `, inspect({
    action,
    state,
    newState,
  }, { depth: 6 }), `\n========`)

  return newState
}

const resetHandler = <State>(initialState: State) => () => initialState

const replacePartialReducerState = <State>({ key }): RdxReducer<State> => (state: State, action) => ({
  ...state,
  [key]: isObject(state[key])
    ? {
      ...state[key],
      ...action.payload,
    }
    : action.payload,
})

const formatApiReducerHandlers = (nameString: string, prefix = ``) => {
  const formattedTypeString = formatTypeString<string, string>(nameString, prefix)

  const handlers = {
    request: `${formattedTypeString}_REQUEST`,
    success: `${formattedTypeString}_SUCCESS`,
    failure: `${formattedTypeString}_FAILURE`,
    reset: formatTypeString<string, string>(nameString, prefix, { reset: true }),
  }

  return handlers
}

const getReducerHandlerFor = <State>(state: State) => {
  if (isObject(state)) {
    return overwriteReducerState
  }

  return replaceReducerState
}

const createBaseReducerHandlers = <State>(nameString: string, prefix = ``, state: State) => ({
  [formatTypeString<string, string>(nameString, prefix)]: getReducerHandlerFor<State>(state),
  [formatTypeString<string, string>(nameString, prefix, { reset: true })]: resetHandler(state),
})

const generateReducerHandlers = <State>(
  reducerName: string,
  isApiReducer: boolean,
  prefix = ``,
  state: State,
): Record<string, Handler<State>> => {
  const baseHandlers = createBaseReducerHandlers(reducerName, prefix, state)

  const handlers = isApiReducer
    ? Object.assign(
      {},
      baseHandlers,
      createApiReducerHandlers(formatApiReducerHandlers(reducerName, prefix)),
    )
    : baseHandlers

  return handlers
}

const createApiReducerFromHandlers = (apiHandlers: Record<string, string>) => {
  const dedupedApiHandlers = {}
  const apiHandlerKeys = Object.keys(apiHandlers)
  const successHandlerKey = apiHandlerKeys.find(key => key.endsWith(`_SUCCESS`))
  const requestHandlerKey = apiHandlerKeys.find(key => key.endsWith(`_REQUEST`))
  const failureHandlerKey = apiHandlerKeys.find(key => key.endsWith(`_FAILURE`))
  const resetHandlerKey = apiHandlerKeys.find(key => key.startsWith(`${RDX_INTERNAL_PREFIXES.RDX_TYPE_PREFIX}RESET_`))

  const notAlreadyAHandler = notAnyOf([
    successHandlerKey,
    requestHandlerKey,
    failureHandlerKey,
    resetHandlerKey,
  ])

  for (let i = 0, len = apiHandlerKeys.length; i < len; i++) {
    const key = apiHandlerKeys[i]

    if (notAlreadyAHandler(key)) {
      dedupedApiHandlers[key] = apiHandlers[key]
    }
  }

  return createApiReducer<any, any>(
    {
      request: requestHandlerKey as string,
      success: successHandlerKey as string,
      failure: failureHandlerKey as string,
      reset: resetHandlerKey as string,
    },
    dedupedApiHandlers,
  )
}

const formatGeneratedReducers = <State>(reducers: Array<PregeneratedReducer<State>>) => {
  const acc = {}

  for (let i = 0, len = reducers.length; i < len; i++) {
    const { reducerName, keys, reducerState, reducerHandlers, isApiReducer } = reducers[i]

    acc[reducerName] = {
      handlers: reducerHandlers,
      state: isApiReducer ? apiState : reducerState,
    }

    for (let j = 0, kl = keys.length; j < kl; j++) {
      acc[reducerName].handlers = Object.assign(acc[reducerName].handlers, keys[j].handlers)
    }

    if (isApiReducer) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      acc[reducerName] = createApiReducerFromHandlers(acc[reducerName])
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      acc[reducerName] = createReducer(acc[reducerName].state, acc[reducerName].handlers)
    }
  }

  return acc as ReducersMapObject<State>
}

const getPregeneratedReducerKeyHandlers = <State>({ reducerKey, initialState, handlerType }: TypeDef, name: string, prefix = ``): PregeneratedReducerKeys<State>['handlers'] => {
  const isApiReducer = handlerType === HandlerTypes.api

  console.log(`========\n`, `reducerkey, name`, { reducerKey, name }, `\n========`)
  const baseHandler = {
    [formatTypeString<string, string>(reducerKey, prefix)]: replacePartialReducerState({ key: name }),
    [formatTypeString<string, string>(reducerKey, prefix, { reset: true })]: resetHandler<State>(initialState as State),
  }

  // @ts-expect-error - we know that the key is a string
  return isApiReducer
    ? Object.assign(
      {},
      baseHandler,
      createApiReducerHandlers(
        formatApiReducerHandlers(
          reducerKey || name,
          prefix,
        ),
      ),
    )
    : baseHandler
}

const pregenerateReducerKeys = <State, Name extends string, Prefix extends string>(
  name: `${Name}`,
  definitions: TypeDef[],
  prefix: `${Prefix}`,
) => {
  const keys: Array<PregeneratedReducerKeys<State>> = []
  let defsIndex = definitions.length

  while (defsIndex--) {
    const currentDefinition = definitions[defsIndex]
    const { reducerKey, handlerType, initialState } = currentDefinition

    keys.push({
      key: reducerKey,
      handlerType,
      handlers: getPregeneratedReducerKeyHandlers(currentDefinition, name, prefix),
      initialState,
    } as unknown as PregeneratedReducerKeys<State>)
  }

  return keys
}

const getCurrentReducerState = (definitions: TypeDef[]) => {
  if (definitions.length > 1) {
    const state = {}

    for (let i = 0, len = definitions.length; i < len; i++) {
      const { reducerKey, initialState } = definitions[i]

      state[reducerKey] = initialState
    }

    return state
  }

  return definitions?.[0]?.initialState ?? null
}

const generateReducerDefinitions = <State>(defs: Array<RdxDefinition<State>>, prefix = ``): Array<PregeneratedReducer<State>> => {
  const reducers: Array<PregeneratedReducer<State>> = []

  for (let i = 0, len = defs.length; i < len; i++) {
    const { reducerName, isApiReducer, definitions } = defs[i]
    const currentReducerState = getCurrentReducerState(definitions)

    reducers[i] = {
      reducerName,
      isApiReducer: Object.is(apiState, currentReducerState),
      keys: [],
      reducerState: currentReducerState as State,
      // @ts-expect-error handler type is unknown
      reducerHandlers: generateReducerHandlers(reducerName, isApiReducer, prefix, currentReducerState),
    }

    if (isObject(currentReducerState) && Object.keys(currentReducerState as object).length > 0) {
      reducers[i].keys = pregenerateReducerKeys<State, string, string>(reducers[i].reducerName, definitions, prefix)
    }
  }

  return reducers
}

const generateReducersFromDefs = <State, Prefix extends string>(defs: Array<RdxDefinition<State>>, prefix: Prefix): ReducersMapObject<State> => {
  return formatGeneratedReducers(generateReducerDefinitions<State>(defs, prefix || ``))
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const __generateReducers = <State, Prefix extends string>(stateObject: State, prefix: Prefix): ReducersMapObject<State, Action<any, any>> =>
  pipe<State, ReducersMapObject<State, Action<any, any>>>(
    s => defineState(s, prefix),
    (defs: Array<RdxDefinition<State>>) => generateReducersFromDefs<State, Prefix>(defs, prefix),
  )(
    stateObject,
  )

function generateReducers<
  State extends O.Object,
  Paths extends Array<ReflectedStatePath<State>>,
  Prefix extends string,
> (
  stateObject: State,
  paths: Paths,
  prefix: Prefix,
) {
  // sorting the paths by length ensures that the longest paths are processed first
  // meaning that we start with the leaf nodes and work our way up
  const _paths: Array<ReflectedStatePath<State>> = (
    paths
    // @ts-expect-error array types
      ? [].concat(paths)
      : getObjectPaths(stateObject)
  ).sort((a, b) => b.split(`.`).length - a.split(`.`).length)

  console.log(`========\n`, `paths`, _paths, `\n========`)

  let result = stateObject

  for (let i = 0, len = _paths.length; i < len; i++) {
    const path = _paths[i]

    const isRootPath = !path.includes(`.`)
    // @ts-expect-error path type
    const value = get(stateObject, path, {})
    const isPrimitive = !isObject(value)
    const isObjectWithoutKeys = !isPrimitive && !Object.keys(value).length
    let generated

    if ((isPrimitive || (isRootPath && isObjectWithoutKeys))) {
      generated = createReducer(value, createBaseReducerHandlers(path, `${prefix}.${path}`, value))
    } else {
      generated = combineReducers(__generateReducers<typeof value, Prefix>(value, `${prefix}.${path}` as Prefix))
    }

    console.log(`========\n`, `generated `, generated, `\n========`)

    result = setPath<State, Paths[number]>(path, generated, result)
    console.log(`========\n`, `result`, result, `\n========`)
  }

  const final = recursivelyCombineReducers(result) as RdxReducer<State>

  return final
}

function createDeepReducer<
  State extends O.Object,
  Paths extends Array<ReflectedStatePath<State>>,
  Prefix extends string,
> (
  stateObject: State,
  paths: Paths,
  prefix: Prefix,
) {

}

const extendReducers = <State>(
  currentReducers: ReducersMapObject<State>,
  ...reducers: Array<ReducersMapObject<any, Action<any, any>>>
) => Object.assign({}, currentReducers, ...reducers) as ReducersMapObject<State>

export {
  extendReducers,
  generateReducers,
  generateReducersFromDefs,
  overwriteReducerState,
  replacePartialReducerState,
  replaceReducerState,
}

