import {
  Action,
  HandlerTypes,
  PregeneratedReducer,
  PregeneratedReducerKeys,
  RdxDefinition,
  Reducer,
  TypeDef,
} from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from '../internal/string-helpers/formatters'
import { ReducersMapObject } from 'redux'
import { pipe, isObject } from '../utils'
import { defineState } from './generate-defs'
import { apiState } from '../api'
import { createApiReducer } from './create-api-reducer'
import { createApiReducerHandlers } from '../internal'

const notAnyOf = (values: any[]) => (key: any) => {
  for (let i = 0, len = values.length; i < len; i++) {
    if (key === values[i]) {
      return false
    }
  }

  return true
}

const replaceReducerState = <S>(_: S, action: Action<S>) => action.payload

const overwriteReducerState = <S>(state: S, action: Action<S>) => ({
  ...state,
  ...action.payload,
})

const resetHandler = <State>(initialState: State) => () => initialState

const replacePartialReducerState = <State>({ key }): Reducer<State> => (state: State, action) => ({
  ...state,
  [key]: isObject(state[key])
    ? {
      ...state[key],
      ...action.payload,
    }
    : action.payload,
})

const formatApiReducerHandlers = (nameString, prefix) => {
  const formattedTypeString = formatTypeString(nameString, prefix)

  return {
    request: `${formattedTypeString}_REQUEST`,
    success: `${formattedTypeString}_SUCCESS`,
    failure: `${formattedTypeString}_FAILURE`,
    reset: formatTypeString(nameString, prefix, { reset: true }),
  }
}

const getReducerHandlerFor = state => isObject(state) ? overwriteReducerState : replaceReducerState

const createBaseReducerHandlers = (nameString, prefix, state) => ({
  [formatTypeString(nameString, prefix)]: getReducerHandlerFor(state),
  [formatTypeString(nameString, prefix, { reset: true })]: resetHandler(state),
})

const generateReducerHandlers = (
  {
    reducerName: name,
    isApiReducer,
  }: RdxDefinition,
  prefix: string,
  state: any,
) => {
  const baseHandlers = createBaseReducerHandlers(name, prefix, state)

  return isApiReducer
    ? Object.assign(
      baseHandlers,
      createApiReducerHandlers(formatApiReducerHandlers(name, prefix)),
    )
    : baseHandlers
}

const createApiReducerFromHandlers = ({ handlers: apiHandlers }) => {
  const dedupedApiHandlers = {}
  const apiHandlerKeys = Object.keys(apiHandlers)
  const successHandlerKey = apiHandlerKeys.find(key => key.endsWith(`SUCCESS`))
  const requestHandlerKey = apiHandlerKeys.find(key => key.endsWith(`REQUEST`))
  const failureHandlerKey = apiHandlerKeys.find(key => key.endsWith(`FAILURE`))
  const resetHandlerKey = apiHandlerKeys.find(key => key.startsWith(`RESET`))

  const notAlreadyAHandler = notAnyOf([
    successHandlerKey,
    requestHandlerKey,
    failureHandlerKey,
    resetHandlerKey,
  ])

  for(let i = 0, len = apiHandlerKeys.length; i < len; i++) {
    const key = apiHandlerKeys[i]

    if (notAlreadyAHandler(key)) {
      dedupedApiHandlers[key] = apiHandlers[key]
    }
  }

  return createApiReducer(
    {
      request: requestHandlerKey,
      success: successHandlerKey,
      failure: failureHandlerKey,
      reset: resetHandlerKey,
    },
    dedupedApiHandlers,
  )
}

const formatGeneratedReducers = (reducers: PregeneratedReducer[]): ReducersMapObject => {
  const acc = {}

  for(let i = 0, len = reducers.length; i < len; i++) {
    const { name, keys, reducerState, reducerHandlers, isApiReducer } = reducers[i]

    acc[name] = {
      handlers: reducerHandlers,
      state: isApiReducer ? apiState : reducerState,
    }

    for(let j = 0, kl = keys.length; j < kl; j++) {
      acc[name].handlers = Object.assign(acc[name].handlers, keys[j].handlers)
    }

    if (isApiReducer) {
      acc[name] = createApiReducerFromHandlers(acc[name])
    } else {
      acc[name] = createReducer(acc[name].state, acc[name].handlers)
    }
  }

  return acc
}

const getPregeneratedReducerKeyHandlers = ({ reducerKey, handlerType }: TypeDef, name: string, prefix: string): PregeneratedReducerKeys['handlers'] => {
  const isApiReducer = handlerType === HandlerTypes.api
  const formattedName = `${name}_${reducerKey}`
  const baseHandler = {
    [formatTypeString(formattedName, prefix)]: replacePartialReducerState({
      key: reducerKey,
    }),
  }

  return isApiReducer
    ? Object.assign(
      baseHandler,
      createApiReducerHandlers(
        formatApiReducerHandlers(
          formattedName,
          prefix,
        ),
      ),
    ) : baseHandler
}

const pregenerateReducerKeys = (
  name: string,
  definitions: TypeDef[],
  prefix = ``,
): PregeneratedReducerKeys[] => {
  const keys: PregeneratedReducerKeys[] = []
  let defsIndex = definitions.length

  while (defsIndex--) {
    const { reducerKey, handlerType, initialState } = definitions[defsIndex]

    keys.push({
      key: reducerKey,
      handlerType,
      handlers: getPregeneratedReducerKeyHandlers(definitions[defsIndex], name, prefix),
      initialState,
    })
  }

  return keys
}

const getCurrentReducerState = (definitions: TypeDef[], hasKeys: boolean) => {
  const state = {}

  if (hasKeys) {
    for(let i = 0, len = definitions.length; i < len; i++) {
      const { reducerKey, initialState } = definitions[i]

      state[reducerKey] = initialState
    }

    return state
  }

  return definitions[0].initialState
}

const generateReducerDefinitions = (defs: RdxDefinition[], prefix = ``): PregeneratedReducer[] => {
  const reducers: PregeneratedReducer[] = []

  for (let i = 0, len = defs.length; i < len; i++) {
    const { reducerName: name, isApiReducer, definitions } = defs[i]
    const hasKeys = definitions[0].reducerKey !== name
    const currentReducerState = getCurrentReducerState(definitions, hasKeys)

    reducers[i] = {
      name,
      isApiReducer,
      keys: [],
      reducerState: currentReducerState,
      reducerHandlers: generateReducerHandlers(defs[i], prefix, currentReducerState),
    }

    if (hasKeys) {
      reducers[i].keys = pregenerateReducerKeys(reducers[i].name, definitions, prefix)
    }
  }

  return reducers
}

const generateReducersFromDefs = (defs: RdxDefinition[], prefix = ``): ReducersMapObject => {
  return formatGeneratedReducers(generateReducerDefinitions(defs, prefix))
}

const generateReducers = <S>(stateObject: S, prefix = ``): ReducersMapObject<S> =>
  pipe<S, ReducersMapObject<S>>(
    defineState,
    state => generateReducersFromDefs(state, prefix),
  )(
    stateObject,
  )

const extendReducers = (
  currentReducers: ReducersMapObject<any>,
  ...reducers: ReducersMapObject<any>[]
) => Object.assign({}, currentReducers, ...reducers)

export {
  extendReducers,
  generateReducers,
  generateReducersFromDefs,
  overwriteReducerState,
  replacePartialReducerState,
  replaceReducerState,
}

