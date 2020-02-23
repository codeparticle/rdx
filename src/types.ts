import { Store, Middleware } from "redux"
import { EnhancerOptions } from "redux-devtools-extension"
import { SagaMiddlewareOptions } from "redux-saga"

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
}

export type TypesObject<T = { [key: string]: string }> = Record<keyof T, keyof T>
export type StateValue = any
export type StateObject = { [key: string]: StateValue }

export type Action<T = never> = {
  type: string
  payload?: T
  id: string
}

export type ActionObject<State=any> = Record<string, ActionCreator<DeepPartial<State> | any>>

export type DerivedActionObject<State> = Record<keyof RdxSubmodule<State>['actions'], ActionCreator<DeepPartial<State>>>

export type ActionCreator<T = any> = (payload?: T, additionalKeys?: object, id?: string) => Action<T> | Action<never>

export type TypeDef = {
  typeName: string
  actionName: string
  selectorName: string
  reducerKey: string
  handlerType: "string" | "number" | "boolean" | "array" | "object" | "default"
  initialState: any
  raw?: string
}

export type ConditionalFilter<T = Array<string>> = (
  item: string,
  index: number,
  collection: T
) => boolean

export type UserDefinedReducers = {
  [key: string]: StateObject
}

export type SelectorFunction<State, Backup=DeepPartial<State>> = (state: State) => DeepPartial<State> | Backup

export type SelectorsObject<State> = Record<string, SelectorFunction<State | any>>

export type Reducer<S, A = Action<S>> = (state: S, action: A) => S

export type RdxDefinition = { reducerName?: string; definitions: Array<TypeDef> }

export type RdxConfiguration = {
  prefix?: string
  sagas?: Record<string, Generator>
}

export type RdxOutput<State> = {
  actions: ActionObject<State>
  reducers: Reducer<State>
  selectors: SelectorsObject<State>
  types: TypesObject
  sagas?: { [key: string]: Generator }
  prefix: string
  state: State
}

export type HandlerConfig<State> = {
  handlerType?: TypeDef["handlerType"]
  reducerKey?: string
  partial?: boolean
  reset: boolean
  initialState: State
}

export type Handler<State> =
  | ((initialState: State) => Reducer<State>)
  | ((key: string) => Reducer<State>)
  | Reducer<State>

export type PregeneratedReducerKeys<State = any> = {
  key: string
  handlers: Record<string, Handler<State>>
  handlerType: string
  initialState: State
}

export type PregeneratedReducer<State = any> = {
  name: string
  keys: PregeneratedReducerKeys<State>[]
  reducerState: State
  reducerHandlers: Record<string, Handler<State>>
}

export type ApiRequestState = {
  loaded: boolean
  failed: boolean
  error: any
  data: any
}

export type ConfiguredSagasObject = {
  latest?: DefaultSagasObject
  every?: DefaultSagasObject
}

type NotLatestOrEvery = Exclude<string, keyof ConfiguredSagasObject>

export type DefaultSagasObject = {
  [key in NotLatestOrEvery]: <ActionType = any>(action?: Action<ActionType>) => Generator;
}

export type SagasObject = ConfiguredSagasObject | DefaultSagasObject

export type RdxSagasConfig = {
  enabled: boolean
  options?: SagaMiddlewareOptions
}

export interface CombinedModule<CombinedTypes, CombinedState, CombinedActions, CombinedSelectors> {
  types: TypesObject<CombinedTypes>
  actions: CombinedActions
  selectors: CombinedSelectors
  reducers: Reducer<CombinedState>
  state: CombinedState
}

export type RdxSubmodule<State> = ReturnType<() => RdxOutput<State>>

export type ModuleCombination<State> = CombinedModule<
  RdxSubmodule<State>["types"],
  RdxSubmodule<State>["state"],
  RdxSubmodule<State>["actions"],
  RdxSubmodule<State>["selectors"]
> & RdxMappers<RdxSubmodule<State>["actions"], RdxSubmodule<State>["selectors"]>

export type RdxRootConfiguration<State = StateObject> = {
  modules: ModuleCombination<State>
  config?: {
    middleware?: Array<Middleware>
    devtools?: RdxDevToolsConfig
    sagas?: RdxSagasConfig
    provideMappers?: boolean
  }
}

export type ActionMapper<A> = <Actions=A>(
  actions: Actions
)
=> <B=Actions, Aliases=Record<string, keyof B>>(...vs: (keyof B)[] | Aliases[])
=> <C=B, Names=Aliases & Partial<C>>(dispatch: any)
=> Record<keyof Names, ActionCreator>

export type SelectionMapper<S> = <Selectors = S>(
  selectors: Selectors
) => <A = Selectors>(
  ...vs: (keyof A)[] | Record<string, keyof A>[]
) => <State>(state: State) => Record<string, ReturnType<SelectorFunction<State>>>

export type ConfiguredStore<State> = ModuleCombination<State> & {
  store: Store<State>
  runSagas?: any
}

export type RdxMappers<A, S> = {
  mapActions?: ReturnType<ActionMapper<A>>
  mapState?: ReturnType<SelectionMapper<S>>
}

export type RdxDevToolsConfig = {
  enabled: boolean
  options?: EnhancerOptions
}