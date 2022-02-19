/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { O } from "ts-toolbelt"
import { apiState } from "../api"
import type { ApiRequestState, RdxAction, ReducerHandlers, ApiReducerKeys, RdxReducer, TypeDef } from "../types"

import { HandlerTypes } from "./constants/enums"

import { get, hasKeys, isObject, setPath } from "../utils"
import { Key } from "ts-toolbelt/out/Any/Key"

type SpreadReducerHandler<S extends O.Object, Payload extends O.Object = Record<string, any>> = (state: S, action: RdxAction<Payload, any>) => S & Payload
type ReplaceReducerHandler<S = any, Payload = any, AdditionalKeys = Record<string, never>> = (_: S, action: RdxAction<Payload, AdditionalKeys>) => Payload
/**
 * Reducer that allows you to replace the state entirely. Useful as a handler in a larger reducer.
 * @param {any} state
 * @param {object} action
 * @returns {any}
 */
const replaceReducerHandler = <S = any, Payload = any>(_: S, action: RdxAction<Payload>): Payload => action.payload as Payload

const spreadReducerHandler = <S extends O.Object, Payload extends O.Object = Record<string, any>>(state: S, action: RdxAction<Payload, any>): S & Payload => {
  const newState: S & Payload = {
    ...state,
    ...(action.payload as Payload),
  }

  return newState
}

/**
 * Reducer that allows you to replace or spread over the value of a key of your state.
 * @param { string } key
 * @returns {function}
 */
const replacePartialReducerHandler = <K extends Key>(key: K) => <S extends O.Object = Record<string, any>, Payload = any>(state: S, action: RdxAction<Payload, any>): S => {
  const newState: S = {
    ...state,
    [key]: isObject(state?.[key])
      ? {
        ...state[key],
        ...(action.payload as Partial<S[K]>),
      }
      : action.payload as Payload,
  }

  return newState
}

/**
 * Reducer handler that resets a piece of state.
 * @param {any} initialState
 * @returns {() => any}
 */
const resetReducerHandler = <State>(initialState: State) => () => initialState

const requestReducerHandler: RdxReducer<ApiRequestState<any>, never, never> = (state) => ({
  ...state,
  fetching: true,
  dataLoaded: false,
  error: null,
})

const successReducerHandler = <DataType = any>(state, action: RdxAction<DataType, any>): ReturnType<RdxReducer<ApiRequestState<DataType, null>, RdxAction<DataType, any>>> => ({
  ...state,
  fetching: false,
  dataLoaded: true,
  error: null,
  data: action.payload,
})

const failureReducerHandler = <ErrorType = Error>(state, action: RdxAction<ErrorType, any>): ReturnType<RdxReducer<ApiRequestState<any, ErrorType>, RdxAction<ErrorType, any>>> => ({
  ...state,
  fetching: false,
  dataLoaded: false,
  error: action?.payload ?? true,
})

const resetApiReducerHandler = resetReducerHandler(apiState)

const getReducerHandlerFor = <State>(state: State): State extends O.Object ? SpreadReducerHandler<State> : ReplaceReducerHandler<State> => {
  type Returned = State extends O.Object ? SpreadReducerHandler<State> : ReplaceReducerHandler<State>

  if (isObject(state)) {
    return spreadReducerHandler as Returned
  }

  return replaceReducerHandler as Returned
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
    [def.setType]: (state = initialState, action: RdxAction<any>) => {
      // @ts-expect-error -- get type
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
  [types.set]: spreadReducerHandler as SpreadReducerHandler<ApiRequestState>,
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
    [actionTypes.set]: (state = apiState, action: RdxAction<ApiRequestState, any>) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.set](state, action)),
    [actionTypes.reset]: () => setPath(combinedState, def.path, apiState),
    [actionTypes.request]: (state = apiState, action: never) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.request](state, action)),
    [actionTypes.success]: (state = apiState, action: never) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.success](state, action)),
    [actionTypes.failure]: (state = apiState, action: never) => setPath(combinedState, def.path, apiReducerHandlers[actionTypes.failure](state, action)),
  }

  return reflectedApiHandlers as unknown as ReducerHandlers<CombinedState>
}

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
  replacePartialReducerHandler,
  requestReducerHandler,
  resetApiReducerHandler,
  resetReducerHandler,
  spreadReducerHandler,
  successReducerHandler,
}
