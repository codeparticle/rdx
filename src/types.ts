import { Store, Middleware, ReducersMapObject } from "redux"
import { EnhancerOptions } from "redux-devtools-extension"
import { SagaMiddlewareOptions } from "redux-saga"

export const enum HandlerTypes {
  string = `string`,
  number = `number`,
  boolean = `boolean`,
  array = `array`,
  object = `object`,
  api = `api`,
  default = `default`
}

export const enum RdxGeneratedPrefixes {
  set = `set`,
  get = `get`,
  reset_ = `reset_`,
  set_ = `set_`,
  RESET = `RESET`,
  SET = `SET`,
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
}

export type KeyMirroredObject<T = { [key: string]: string }> = Record<keyof T, keyof T>
export type StateValue = any
export type StateObject = { [key: string]: StateValue }

export type Action<T> = {
  type: string
  payload?: T
  id: string
}

export type ActionObject<State=any> = Record<string, ActionCreator<DeepPartial<State> | any>>

export type DerivedActionObject<State> = Record<keyof RdxSubmodule<State>['actions'], ActionCreator<any>>

export type ActionCreator<T = any> = (payload?: T, additionalKeys?: object, id?: string) => Action<T> | Action<never>

export type TypeDef = {
  typeName: string
  actionName: string
  selectorName: string
  reducerKey: string
  handlerType: HandlerTypes
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

export type SelectorsObject<State = any> = Record<string, (state: State, ...args: any[]) => DeepPartial<State>>

export type Reducer<S, A = Action<S>> = (state: S, action: A) => S

export type RdxDefinition = { reducerName: string; isApiReducer: boolean; definitions: Array<TypeDef> }

export type RdxConfiguration = {
  prefix?: string
  sagas?: Record<string, Generator>
}

export type RdxOutput<State> = {
  actions: ActionObject<State>
  reducers: ReducersMapObject<State>
  selectors: SelectorsObject<State>
  types: KeyMirroredObject
  sagas?: { [key: string]: Generator }
  state: State
}

export type RdxModule<State> = {
  [prefix: string]: RdxOutput<State>
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
  isApiReducer: boolean
}

export type ApiReducerKeys = {
  request: string
  success: string
  failure: string
  reset: string
}

export type ApiRequestState = {
  dataLoaded: boolean
  fetching: boolean
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
  types: KeyMirroredObject<CombinedTypes>
  actions: CombinedActions
  selectors: CombinedSelectors
  reducers: ReducersMapObject<CombinedState>
  state: CombinedState
}

export type RdxSubmodule<State> = ReturnType<() => RdxOutput<State>>

export type ModuleCombination<State> = CombinedModule<
  RdxSubmodule<State>["types"],
  RdxSubmodule<State>["state"],
  RdxSubmodule<State>["actions"],
  RdxSubmodule<State>["selectors"]
> &
  RdxMappers<
    RdxSubmodule<State>["actions"],
    RdxSubmodule<State>["selectors"]
  >

export type RdxRootConfiguration<State = StateObject> = {
  modules: ModuleCombination<State>
  config?: {
    middleware?: Array<Middleware>
    devtools?: RdxDevToolsConfig
    sagas?: RdxSagasConfig
    provideMappers?: boolean
    wrapReducersWith?: Function
  }
}

export type ActionMapper<A> = <Actions=A>(
  actions: Actions
)
=> <B=A>(...vs: (keyof B)[])
=> (dispatch: any)
=> Record<keyof B, ActionCreator>

export type SelectionMapper<S, St=any> = <Selectors = S, St1 = St>(
  selectors: Selectors
) => <A = Selectors, SelectorNames=(keyof A)|Record<string, keyof A>>(
  ...vs: SelectorNames[]
) => (state) => Record<keyof SelectorNames, any>

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