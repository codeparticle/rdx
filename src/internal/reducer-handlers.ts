/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Key } from 'ts-toolbelt/out/Any/Key'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import { apiState } from '../api'
import type {
  ApiReducerKeys,
  ApiRequestState,
  RdxAction,
  RdxReducer,
  ReducerHandlers,
  TypeDef,
} from '../types'
import { get, hasKeys, isObject, setPath } from '../utils'
import { HandlerTypes } from './constants/enums'

type SpreadReducerHandler<S extends _Object, Payload extends _Object = Record<string, any>> = (
  state: S,
  action: RdxAction<Payload, any>
) => S & Payload
type ReplaceReducerHandler<S = any, Payload = any, AdditionalKeys = Record<string, never>> = (
  _: S,
  action: RdxAction<Payload, AdditionalKeys>
) => Payload
/**
 * Reducer that allows you to replace the state entirely. Useful as a handler in a larger reducer.
 * @param {any} state
 * @param {object} action
 * @returns {any}
 */
const replaceReducerHandler = <S = any, Payload = any>(_: S, action: RdxAction<Payload>): Payload =>
  action.payload as Payload

const spreadReducerHandler = <S extends _Object, Payload extends _Object = Record<string, any>>(
  state: S,
  action: RdxAction<Payload, any>
): S & Payload => {
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
const replacePartialReducerHandler =
  <K extends Key>(key: K) =>
  <S extends _Object = Record<string, any>, Payload = any>(
    state: S,
    action: RdxAction<Payload, any>
  ): S => {
    const newState: S = {
      ...state,
      [key]: isObject(state?.[key])
        ? {
            ...state[key],
            ...(action.payload as Partial<S[K]>),
          }
        : (action.payload as Payload),
    }

    return newState
  }

/**
 * Reducer handler that resets a piece of state.
 * @param {any} initialState
 * @returns {() => any}
 */
const resetReducerHandler =
  <State>(initialState: State) =>
  () =>
    initialState

const requestReducerHandler: RdxReducer<ApiRequestState<any>, never> = (state = apiState) => ({
  fetching: true,
  dataLoaded: false,
  error: null,
  data: state.data,
})

const successReducerHandler = <DataType = any>(
  _ = apiState,
  action: RdxAction<DataType, any>
): ReturnType<RdxReducer<ApiRequestState<DataType, null>, RdxAction<DataType, any>>> => ({
  fetching: false,
  dataLoaded: true,
  error: null,
  data: action.payload,
})

const failureReducerHandler = <ErrorType = Error>(
  state = apiState,
  action: RdxAction<ErrorType, any>
): ReturnType<RdxReducer<ApiRequestState<any, ErrorType>, RdxAction<ErrorType, any>>> => ({
  data: state.data,
  fetching: false,
  dataLoaded: false,
  error: action.payload == null ? true : action.payload,
})

const resetApiReducerHandler = resetReducerHandler(apiState)

const getReducerHandlerFor = <State>(
  state: State
): State extends _Object ? SpreadReducerHandler<State> : ReplaceReducerHandler<State> => {
  type Returned = State extends _Object ? SpreadReducerHandler<State> : ReplaceReducerHandler<State>

  if (isObject(state)) {
    return spreadReducerHandler as Returned
  }

  return replaceReducerHandler as Returned
}

const createBaseReducerHandlers = <State, Def extends TypeDef<State> = TypeDef<State>>({
  setType,
  resetType,
  initialState,
}: Def): ReducerHandlers<State> => ({
  [setType]: getReducerHandlerFor(initialState),
  [resetType]: resetReducerHandler(initialState),
})

const reflectBaseHandlersOver =
  <CombinedState extends _Object>(combinedState: CombinedState) =>
  <Def extends TypeDef>(def: Def extends TypeDef<infer S> ? TypeDef<S> : TypeDef<any>) => {
    const baseHandlers = createBaseReducerHandlers<_Object>(def)
    const { initialState, resetType } = def

    return {
      ...baseHandlers,
      [def.setType]: (state = initialState, action: RdxAction<any>) => {
        const result = baseHandlers[def.setType](get(state as _Object, def.path), action)

        return setPath(combinedState, def.path, result)
      },
      [resetType]: () => setPath(combinedState, def.path, resetReducerHandler(def.initialState)()),
    }
  }

const createApiReducerHandlers = (types: ApiReducerKeys): ReducerHandlers<ApiRequestState> =>
  ({
    [types.request]: requestReducerHandler,
    [types.success]: successReducerHandler,
    [types.failure]: failureReducerHandler,
    [types.reset]: resetApiReducerHandler,
    [types.set]: spreadReducerHandler as SpreadReducerHandler<ApiRequestState>,
  } as ReducerHandlers<ApiRequestState>)

function createApiActionTypes({
  setType,
  resetType,
}: Pick<TypeDef, 'setType' | 'resetType'>): ApiReducerKeys {
  return {
    set: setType,
    reset: resetType,
    request: `${setType}_REQUEST`,
    success: `${setType}_SUCCESS`,
    failure: `${setType}_FAILURE`,
  }
}
const reflectApiHandlersOver =
  <CombinedState extends _Object>(combinedState: CombinedState) =>
  (def: TypeDef<ApiRequestState>): ReducerHandlers<CombinedState> => {
    const actionTypes = createApiActionTypes(def)
    const apiReducerHandlers: ReducerHandlers<ApiRequestState> =
      createApiReducerHandlers(actionTypes)

    const reflectedApiHandlers = {
      ...apiReducerHandlers,

      [actionTypes.set]: (_, action: RdxAction<ApiRequestState, any>) =>
        setPath(
          combinedState,
          def.path,
          apiReducerHandlers[actionTypes.set](get(combinedState as _Object, def.path), action)
        ),

      [actionTypes.reset]: () => setPath(combinedState, def.path, apiState),

      [actionTypes.request]: (_, action: never) =>
        setPath(
          combinedState,
          def.path,
          apiReducerHandlers[actionTypes.request](get(combinedState as _Object, def.path), action)
        ),

      [actionTypes.success]: (_, action: never) =>
        setPath(
          combinedState,
          def.path,
          apiReducerHandlers[actionTypes.success](get(combinedState as _Object, def.path), action)
        ),
      [actionTypes.failure]: (_, action: never) =>
        setPath(
          combinedState,
          def.path,
          apiReducerHandlers[actionTypes.failure](get(combinedState as _Object, def.path), action)
        ),
    }

    return reflectedApiHandlers as unknown as ReducerHandlers<CombinedState>
  }

const createReducerHandlers =
  <State = NonNullable<any>>(state: State) =>
  <DefState>(def: TypeDef<DefState>): ReducerHandlers<DefState> => {
    const baseHandlers = reflectBaseHandlersOver(state as _Object)(def)
    let handlers = baseHandlers

    if (def.handlerType === HandlerTypes.api) {
      // @ts-expect-error - we know that def is an api reducer definition
      handlers = reflectApiHandlersOver(state)(def)
    } else if (def.handlerType === HandlerTypes.object && hasKeys(def.children)) {
      handlers = Object.assign(
        baseHandlers,
        ...Object.keys(def.children).map((key) => createReducerHandlers(state)(def.children[key]))
      )
    }

    return handlers as unknown as ReducerHandlers<DefState>
  }

export {
  createApiActionTypes,
  createApiReducerHandlers,
  createBaseReducerHandlers,
  createReducerHandlers,
  failureReducerHandler,
  reflectApiHandlersOver,
  reflectBaseHandlersOver,
  replacePartialReducerHandler,
  replaceReducerHandler,
  requestReducerHandler,
  resetApiReducerHandler,
  resetReducerHandler,
  spreadReducerHandler,
  successReducerHandler,
}
