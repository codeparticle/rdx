import { RdxDefinition, Action, Reducer, PregeneratedReducerKeys, PregeneratedReducer } from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from '../internal/string-helpers/formatters'
import { ReducersMapObject } from 'redux'
import { pipe } from '../utils/pipe'
import { defineState } from './generate-defs'
import { isObject } from '../utils/is-object'

const replaceHandler = <S>(_: S, action: Action<S>) => action.payload

const overwriteHandler = <S>(state: S, action: Action<S>) => ({
  ...state,
  ...action.payload,
})

const partialReplaceHandler = <State>({ key }): Reducer<State> => {

  return function partialReplaceHandler(state, action){
    return {
      ...state,
      [key]: isObject(state[key]) ? { ...state[key], ...action.payload } : action.payload,
    }
  }
}

const resetHandler = <State>(initialState: State) => () => initialState

const generateReducersFromDefs = (defs: RdxDefinition[], prefix = ``) => {
  const reducers: PregeneratedReducer[] = []
  let rdxDefIndex = defs.length

  while (rdxDefIndex--) {
    const { reducerName: name, definitions } = defs[rdxDefIndex]
    let currentReducerState = definitions[0].initialState
    const hasKeys = definitions[0].reducerKey !== name

    if (hasKeys) {
      currentReducerState = definitions.reduce((acc, def) => {
        Object.assign(acc, { [def.reducerKey]: def.initialState })

        return acc
      }, {})
    }

    reducers[rdxDefIndex] = {
      name,
      keys: [],
      reducerState: currentReducerState,
      reducerHandlers: {
        [formatTypeString(name, prefix)]: isObject(currentReducerState) ? overwriteHandler : replaceHandler,
        [formatTypeString(name, prefix, { reset: true })]: resetHandler(currentReducerState),
      },
    }

    if (hasKeys) {
      let defsIndex = definitions.length

      while (defsIndex--) {
        const { reducerKey, initialState } = definitions[defsIndex]

        reducers[rdxDefIndex].keys.push({
          key: reducerKey,
          handlers: {
            [formatTypeString(`${name}_${reducerKey}`, prefix)]: partialReplaceHandler({
              key: reducerKey,
            }),
          },
        } as PregeneratedReducerKeys<ReturnType<typeof initialState>>)
      }
    }
  }

  const acc = {}
  let i = reducers.length

  while(i--) {
    const { name, keys, reducerState, reducerHandlers } = reducers[i]

    acc[name] = { state: reducerState, handlers: reducerHandlers }
    let j = keys.length

    while (j--) {
      const { handlers } = keys[j]

      Object.assign(acc[name].handlers, handlers)

    }

    acc[name] = createReducer<ReturnType<typeof reducerState>>(acc[name].state, acc[name].handlers)
  }

  return acc
}

const generateReducers = <S>(stateObject: S): ReducersMapObject<S> => pipe<S, ReducersMapObject<S>>(
  defineState,
  generateReducersFromDefs,
)(stateObject)

export { generateReducers, generateReducersFromDefs }

