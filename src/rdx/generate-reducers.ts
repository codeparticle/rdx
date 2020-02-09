import { RdxDefinition, TypeDef, Reducer, Action } from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from './internal/string-helpers/formatters'
import { combineReducers } from 'redux'

type HandlerConfig<State> = {
  handlerType: TypeDef['handlerType']
  reducerKey: string
  partial: boolean
  reset: boolean
  initialState: State
}

type Handler<State> =
   | ((initialState: State) => Reducer<State>)
   | ((key: string) => Reducer<State>)
   | Reducer<State>

   type PregeneratedReducerKeys<State = any> = {
    key: string
    handlers: Record<string, Handler<State>>
    initialState: State
  }

type PregeneratedReducer<State = any> = {
  name: string
  keys: PregeneratedReducerKeys<State>[]
}

// type HandlerReturnFunction =

const generateReducer = (reducerKeys: { [key: string]: unknown }, { key, handlers, initialState }) => {
        reducerKeys[key] = createReducer<typeof initialState>(initialState, handlers)

        return reducerKeys as Record<string, Reducer<typeof initialState>>
      }

const generateReducers = keys => keys.reduce(
      , {})

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

const getHandlerFor= <State>(config: HandlerConfig<State>) => {
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
  const currentDefs = [...defs]

  let index = 0

  while (currentDefs.length) {
    const { reducerName: name, definitions } = currentDefs.shift()

    reducers[index] = { name, keys: [] }

    const currentDefinitions = [...definitions]

    while (currentDefinitions.length) {
      const { typeName, reducerKey, handlerType, initialState } = currentDefinitions.shift()

      reducers[index].keys.push({
        key: reducerKey,
        initialState,
        handlers: {
          [typeName]: getHandlerFor<typeof initialState>({
            handlerType,
            reducerKey,
            initialState,
            partial: false,
            reset: false,
          }),
          [formatTypeString(reducers[index].name)]: getHandlerFor<typeof initialState>({
            handlerType,
            reducerKey,
            initialState,
            partial: true,
            reset: false,
          }),
          [formatTypeString(reducers[index].name, ``, { reset: true })]: getHandlerFor<
            typeof initialState
          >({
            handlerType,
            reducerKey,
            initialState,
            partial: false,
            reset: true,
          }),
        },
      } as PregeneratedReducerKeys<typeof initialState>)
    }

    if (!reducers[index].keys.length) {
      delete reducers[index]
    } else {
      ++index
    }
  }

  return reducers.reduce((acc, { name, keys }) => {
    acc[name] =

    return acc
  }, {})
}

export { generateReducersFromDefs }
