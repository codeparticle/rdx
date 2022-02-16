/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { O } from "ts-toolbelt"
import { apiState } from "../api"
import { ApiRequestState, Action, ApiReducerKeys, RdxReducer, ReducerHandlers, TypeDef, HandlerTypes } from "../types"
import { get, hasKeys, isObject, setPath } from "../utils"

const replaceReducerHandler = <S = any>(_: S, action: Action<any, any>): S => action.payload

const spreadReducerHandler = <S extends O.Object>(state: S, action: Action<Partial<S>, any>): S => {
  const newState = {
    ...state,
    ...action.payload,
  }

  return newState
}

const resetReducerHandler = <State>(initialState: State) => () => initialState

const requestReducerHandler: RdxReducer<ApiRequestState<any, any>, Action<never, any>> = state => ({
  ...state,
  fetching: true,
  dataLoaded: false,
  error: null,
})

const successReducerHandler = <DataType = any>(state, action: Action<DataType, any>): ReturnType<RdxReducer<ApiRequestState<DataType, null>, Action<DataType, any>>> => ({
  ...state,
  fetching: false,
  dataLoaded: true,
  error: null,
  data: action.payload,
})

const failureReducerHandler = <ErrorType = Error>(state, action: Action<ErrorType | null | undefined, any>): ReturnType<RdxReducer<ApiRequestState<any, ErrorType>, Action<ErrorType, any>>> => ({
  ...state,
  fetching: false,
  dataLoaded: false,
  error: action?.payload ?? true,
})

const resetApiReducerHandler = resetReducerHandler(apiState)

const getReducerHandlerFor = <State>(state: State) => {
  if (isObject(state)) {
    return spreadReducerHandler
  }

  return replaceReducerHandler
}

const createBaseReducerHandlers = <State, Def extends TypeDef<State> = TypeDef<State>>({ setType, resetType, initialState }: Def): ReducerHandlers<State> => ({
  [setType]: getReducerHandlerFor(initialState),
  [resetType]: resetReducerHandler(initialState),
})

const reflectBaseHandlersOver = <CombinedState>(combinedState: CombinedState) => <Def extends TypeDef>(def: Def extends TypeDef<infer S> ? TypeDef<S> : TypeDef<any>) => {
  const baseHandlers = createBaseReducerHandlers<O.Object>(def)
  const { initialState } = def

  const reflectedHandlers = {
    ...baseHandlers,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    [def.setType]: (state = initialState, action: Action<any>) => {
      // @ts-expect-error - path types
      const result = baseHandlers[def.setType](get(state, def.path), action)

      return setPath(combinedState, def.path, result)
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    [def.resetType]: () => setPath(combinedState, def.path, resetReducerHandler(def.initialState)()),
  }

  return reflectedHandlers
}

const createApiReducerHandlers = (
  types: ApiReducerKeys,
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
): ReducerHandlers<ApiRequestState> => ({
  [types.request]: requestReducerHandler,
  [types.success]: successReducerHandler,
  [types.failure]: failureReducerHandler,
  [types.reset]: resetApiReducerHandler,
  [types.set]: spreadReducerHandler,
}) as ReducerHandlers<ApiRequestState>

function createApiActionTypes (
  {
    setType,
    resetType,
  }: Pick<TypeDef, 'setType'|'resetType'>,
): ApiReducerKeys {
  return {
    set: setType,
    reset: resetType,
    request: `${setType}_REQUEST`,
    success: `${setType}_SUCCESS`,
    failure: `${setType}_FAILURE`,
  }
}

const reflectApiHandlersOver = <CombinedState>(combinedState: CombinedState) => (def: TypeDef<ApiRequestState>): ReducerHandlers<CombinedState> => {
  const actionTypes = createApiActionTypes(def)
  const apiReducerHandlers: ReducerHandlers<ApiRequestState> = createApiReducerHandlers(actionTypes)
  const reflectedApiHandlers = {
    ...apiReducerHandlers,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    [actionTypes.set]: (state = apiState, action: Action<any, any>) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.set](state, action)),
    [actionTypes.reset]: () => setPath(combinedState, def.path, apiState),
    [actionTypes.request]: (state = apiState, action) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.request](state, action)),
    [actionTypes.success]: (state = apiState, action: Action<any, any>) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.success](state, action)),
    [actionTypes.failure]: (state = apiState, action: Action<any, any>) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.failure](state, action)),
  }

  return reflectedApiHandlers as ReducerHandlers<CombinedState>
}

// const createHandlersFromObjectDefinition = <State extends O.Object>(definitions: ReducersMapObjectDefinition<State>): ReducerHandlers<State> => {
//   const handlers = {}
//   const keys = Object.keys(definitions)
//   const len = keys.length
//   let iter = len

//   while (iter--) {
//     const def = definitions[keys[iter]]

//     Object.assign(handlers, createReducerHandlers(def))
//   }

//   return handlers as ReducerHandlers<State>
// }

const createReducerHandlers = <State = NonNullable<any>>(state: State) => <DefState>(
  def: TypeDef<DefState>,
): ReducerHandlers<DefState> => {
  const baseHandlers = reflectBaseHandlersOver(state)(def)
  let handlers = baseHandlers

  if (def.isApiReducer) {
    // @ts-expect-error - we know that def is an api reducer definition
    handlers = reflectApiHandlersOver(state)(def)
  } else if (def.handlerType === HandlerTypes.object && hasKeys(def.children)) {
    handlers = Object.assign(
      baseHandlers,
      ...Object.keys(def.children).map(
        (key) => createReducerHandlers(state)(def.children[key]),
        [],
      ),
    )
  }

  return handlers as unknown as ReducerHandlers<DefState>
}

export {
  createApiReducerHandlers,
  createBaseReducerHandlers,
  createReducerHandlers,
  failureReducerHandler,
  createApiActionTypes,
  reflectBaseHandlersOver,
  reflectApiHandlersOver,
  replaceReducerHandler,
  requestReducerHandler,
  resetApiReducerHandler,
  resetReducerHandler,
  spreadReducerHandler,
  successReducerHandler,
}
