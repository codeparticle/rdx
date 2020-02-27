import { RdxDefinition, Action, Reducer, PregeneratedReducerKeys, PregeneratedReducer, HandlerTypes } from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from '../internal/string-helpers/formatters'
import { ReducersMapObject, combineReducers } from 'redux'
import { pipe } from '../utils/pipe'
import { defineState } from './generate-defs'
import { isObject } from '../utils/is-object'
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

const replacePartialReducerState = <State>({ key }): Reducer<State> => (state: State, action) => ({
  ...state,
  [key]: isObject(state[key])
    ? {
      ...state[key],
      ...action.payload,
    }
    : action.payload,
})

const resetHandler = <State>(initialState: State) => () => initialState

const generateReducersFromDefs = (defs: RdxDefinition[], prefix = ``) => {
  const reducers: PregeneratedReducer[] = []
  let rdxDefIndex = defs.length

  while (rdxDefIndex--) {
    const { reducerName: name, isApiReducer, definitions } = defs[rdxDefIndex]
    let currentReducerState = definitions[0].initialState
    const hasKeys = definitions[0].reducerKey !== name

    if (hasKeys) {
      currentReducerState = definitions.reduce((acc, def) => {
        Object.assign(acc, { [def.reducerKey]: def.initialState })

        return acc
      }, {})
    }

    const formattedTypeString = formatTypeString(name, prefix)

    reducers[rdxDefIndex] = {
      name,
      isApiReducer,
      keys: [],
      reducerState: currentReducerState,
      reducerHandlers: {
        ...(isApiReducer
          ? createApiReducerHandlers({
            request: `${formattedTypeString}_REQUEST`,
            success: `${formattedTypeString}_SUCCESS`,
            failure: `${formattedTypeString}_FAILURE`,
            reset: formatTypeString(name, prefix, { reset: true }),
          })
          : {
            [formattedTypeString]: isObject(currentReducerState) ? overwriteReducerState : replaceReducerState,
            [formatTypeString(name, prefix, { reset: true })]: resetHandler(currentReducerState),
          }),
      },
    }

    if (hasKeys) {
      let defsIndex = definitions.length

      while (defsIndex--) {
        const { reducerKey, handlerType, initialState } = definitions[defsIndex]
        const formattedReducerKey = formatTypeString(`${name}_${reducerKey}`, prefix)

        reducers[rdxDefIndex].keys.push({
          key: reducerKey,
          handlerType,
          handlers: {
            [formattedReducerKey]: replacePartialReducerState({
              key: reducerKey,
            }),
            ...((handlerType as string) === HandlerTypes.api
              ? createApiReducerHandlers({
                request: `${formattedReducerKey}_REQUEST`,
                success: `${formattedReducerKey}_SUCCESS`,
                failure: `${formattedReducerKey}_FAILURE`,
                reset: formatTypeString(`${name}_${reducerKey}`, prefix, { reset: true }),
              })
              : {}),
          },
        } as PregeneratedReducerKeys<ReturnType<typeof initialState>>)
      }
    }
  }

  const acc = {}
  let i = reducers.length

  while(i--) {
    const { name, keys, reducerState, reducerHandlers, isApiReducer } = reducers[i]

    acc[name] = {
      handlers: reducerHandlers,
      state: isApiReducer ? apiState : reducerState,
    }

    let j = keys.length

    while (j--) {
      const { handlers } = keys[j]

      Object.assign(acc[name].handlers, handlers)
    }

    if (isApiReducer) {
      const apiHandlers = acc[name].handlers
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

      const reducedApiHandlers = apiHandlerKeys.reduce((acc, key) => {
        if (notAlreadyAHandler(key)) {
          acc[key] = apiHandlers[key]
        }

        return acc
      }, {})

      acc[name] = createApiReducer(
        {
          request: requestHandlerKey,
          success: successHandlerKey,
          failure: failureHandlerKey,
          reset: resetHandlerKey,
        },
        reducedApiHandlers,
      )
    } else {
      acc[name] = createReducer<ReturnType<typeof reducerState>>(
        acc[name].state,
        acc[name].handlers,
      )
    }

  }

  return acc
}

const generateReducers = <S>(stateObject: S, prefix = ``): ReducersMapObject<S> => pipe<S, ReducersMapObject<S>>(
  defineState,
  state => generateReducersFromDefs(state, prefix),
)(stateObject)

const extendReducers = (
  currentReducers: ReducersMapObject<any>,
  reducers: ReducersMapObject<any>,
) => combineReducers({ ...currentReducers, ...reducers })

export {
  extendReducers,
  generateReducers,
  generateReducersFromDefs,
  overwriteReducerState,
  replacePartialReducerState,
  replaceReducerState,
}

