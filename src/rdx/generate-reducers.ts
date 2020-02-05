import { RdxDefinition, TypeDef } from '../types'
import { createReducer } from './create-reducer'
import { formatTypeString } from './internal/string-helpers/formatters'
import { combineReducers } from 'redux'

const replaceHandler = (_, action) => action.payload

const overwriteHandler = (state, action) => ({
  ...state,
  ...action.payload,
})

const partialReplaceHandler = key =>
  function partialReplace(state, action) {
    if (action.payload[key]) {
      return action.payload[key]
    }

    return state
  }

const partialOverwriteHandler = key =>
  function partialOverwrite(state, action) {
    if (action.payload[key]) {
      return {
        ...state,
        ...action.payload[key],
      }
    }

    return state
  }

const resetHandler = initialState =>
  function resetHandler() {
    return initialState
  }

const getHandlerFor = (config: {
  handlerType: TypeDef['handlerType']
  reducerKey: string
  partial: boolean
  reset: boolean
  initialState: any
}) => {
  if (config.reset) {
    return resetHandler(config.initialState)
  }

  if (config.partial) {
    return config.handlerType === `object`
      ? partialOverwriteHandler(config.reducerKey)
      : partialReplaceHandler(config.reducerKey)
  }

  return config.handlerType === `object` ? overwriteHandler : replaceHandler
}

const generateReducersFromDefs = (defs: RdxDefinition[]) => {
  const reducers = []
  const current = [...defs]

  let index = 0

  while (current.length) {
    const { reducerName: name, definitions } = current.shift()

    reducers[index] = { name, keys: [] }

    const currentDefinitions = [...definitions]

    while (currentDefinitions.length) {
      const { typeName, reducerKey, handlerType, initialState } = currentDefinitions.shift()

      reducers[index].keys.push({
        key: reducerKey,
        initialState,
        handlers: {
          [typeName]: getHandlerFor({
            handlerType,
            reducerKey,
            initialState,
            partial: false,
            reset: false,
          }),
          [formatTypeString(reducers[index].name)]: getHandlerFor({
            handlerType,
            reducerKey,
            initialState,
            partial: true,
            reset: false,
          }),
          [formatTypeString(reducers[index].name, ``, { reset: true })]: getHandlerFor({
            handlerType,
            reducerKey,
            initialState,
            partial: false,
            reset: true,
          }),
        },
      })
    }

    if (!reducers[index].keys.length) {
      delete reducers[index]
    } else {
      ++index
    }
  }

  console.log(reducers)

  return reducers.reduce((acc, { name, keys }) => {
    acc[name] = combineReducers(
      keys.reduce((reducerKeys, { key, handlers, initialState }) => {
        console.log(name, key, handlers)
        reducerKeys[key] = createReducer(initialState, handlers)

        return reducerKeys
      }, {}),
    )

    return acc
  }, {})
}

export { generateReducersFromDefs }
