import { RdxDefinition, Action, Reducer, HandlerConfig, PregeneratedReducerKeys, PregeneratedReducer } from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from '../internal/string-helpers/formatters'
import { combineReducers, ReducersMapObject } from 'redux'
import { pipe } from '../utils/pipe'
import { defineState } from './generate-defs'

const replaceHandler = <S>(_: S, action: Action<S>) => action.payload

const overwriteHandler = <S>(state: S, action: Action<S>) => ({
  ...state,
  ...action.payload,
})

const partialReplaceHandler= <State>(config: HandlerConfig<State>): Reducer<State>=>{
  return (state, action) => {
    if (action.payload[config.reducerKey]) {
      return action.payload[config.reducerKey]
    }

    return state
  }
}

const partialOverwriteHandler = <State>(config: HandlerConfig<State>): Reducer<State> => {
  return (state,action) => {
    if (action.payload[config.reducerKey]) {
      return {
        ...state,
        ...action.payload[config.reducerKey],
      }
    }

    return state
  }
}

const resetHandler = <State>(initialState: State) => () => initialState

const getHandlerFor = <State>(config: HandlerConfig<State>) => {
  if (config.reset) {
    return resetHandler<State>(config.initialState)
  }

  if (config.partial) {
    return config.handlerType === `object`
      ? partialOverwriteHandler(config)
      : partialReplaceHandler(config)
  }

  return config.handlerType === `object` ? overwriteHandler : replaceHandler
}

const generateReducersFromDefs = (defs: RdxDefinition[]) => {
  const reducers: PregeneratedReducer[] = []
  let currentReducerIndex = 0
  let rdxDefIndex = defs.length

  while (rdxDefIndex--) {
    const { reducerName: name, definitions } = defs[rdxDefIndex]
    const currentDefinitions = [].concat(definitions)

    reducers[currentReducerIndex] = { name, keys: [] }

    let defsIndex = currentDefinitions.length

    while (defsIndex--) {
      const { typeName, reducerKey, handlerType, initialState } = currentDefinitions[defsIndex]

      reducers[currentReducerIndex].keys.push({
        key: reducerKey,
        initialState,
        handlerType,
        handlers: {
          [typeName]: getHandlerFor<ReturnType<typeof initialState>>({
            handlerType,
            reducerKey,
            initialState,
            partial: false,
            reset: false,
          }),
          [formatTypeString(reducers[currentReducerIndex].name)]: getHandlerFor<ReturnType<typeof initialState>>({
            handlerType,
            reducerKey,
            initialState,
            partial: true,
            reset: false,
          }),
          [formatTypeString(reducers[currentReducerIndex].name, ``, { reset: true })]: getHandlerFor<
            ReturnType<typeof initialState>
          >({
            handlerType,
            reducerKey,
            initialState,
            partial: false,
            reset: true,
          }),
        },
      } as PregeneratedReducerKeys<ReturnType<typeof initialState>>)
    }

    if (!reducers[currentReducerIndex].keys.length) {
      delete reducers[currentReducerIndex]
    } else {
      ++currentReducerIndex
    }
  }

  const acc = {}
  let i = reducers.length

  while(i--) {
    const { name, keys } = reducers[i]

    acc[name] = {}

    let j = keys.length

    if (j === 1 && keys[0].key === name) {
      const { handlers, initialState } = keys[0]

      acc[name] = createReducer<ReturnType<typeof initialState>>(initialState, handlers)

    } else {
      while (j--) {
        const { key, handlers, initialState } = keys[j]

        acc[name][key] = createReducer<ReturnType<typeof initialState>>(initialState, handlers)
      }

      acc[name] = combineReducers(acc[name])
    }

  }

  return acc
}

const generateReducers = <S>(stateObject: S): ReducersMapObject<S> => pipe(
  defineState,
  generateReducersFromDefs,
)(stateObject)

export { generateReducers, generateReducersFromDefs }

