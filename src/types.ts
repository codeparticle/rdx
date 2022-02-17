import type { Dispatch, Middleware, ReducersMapObject, Store } from "redux"
import type { EnhancerOptions } from "@redux-devtools/extension"
import type { Saga, SagaMiddlewareOptions } from "redux-saga/index"
import type { CamelCase, DelimiterCase, PascalCase, ScreamingSnakeCase, Split } from 'type-fest'
import type { O, O as _O } from 'ts-toolbelt'
import type { Greater } from 'ts-toolbelt/out/Number/Greater'
import type { Cast } from "ts-toolbelt/out/Any/Cast"

export const enum HandlerTypes {
  string = `string`,
  number = `number`,
  boolean = `boolean`,
  array = `array`,
  object = `object`,
  api = `api`,
  default = `default`,
}

export const enum RdxGeneratedPrefixes {
  set = `@@rdx/set`,
  get = `@@rdx/get`,
  reset_ = `@@rdx/reset_`,
  set_ = `@@rdx/set_`,
  RESET = `@@rdx/RESET_`,
  SET = `@@rdx/SET_`,
}

export type KeyMirroredObject<T extends string = string> = Record<`${Extract<keyof T, string>}`, `${Extract<keyof T, string>}`>

// eslint-disable-next-line
export type Action<Payload = any, AdditionalKeys extends _O.Object = {}> = {
  type: string
}
& (Payload extends undefined|never ? Record<string, never> : { payload: Payload })
& (AdditionalKeys extends never ? Record<string, never> : AdditionalKeys)

export type ActionObject<State extends _O.Object, Prefix extends string> = Record<RdxActionName<Paths<State, 4, '_', 'camel'>, Prefix> | 'batchActions', ActionCreator<any, any>>

export type ActionCreator<Payload = any, AdditionalKeys = never> = (payload?: Payload, additionalKeys?: AdditionalKeys extends _O.Object ? _O.Object : never)
=> Action<Payload, AdditionalKeys>

export interface TypeDef<InitialState = NonNullable<any>> {
  actionName: RdxActionName<string, string>
  handlerType: HandlerTypes
  initialState: InitialState
  isApiReducer: boolean
  path: string
  reducerKey: string
  resetActionName: RdxActionName<string, string>
  resetType: RdxResetActionType<string, string>
  setType: RdxSetActionType<string, string>
  children: InitialState extends _O.Object ? ReducersMapObjectDefinition<InitialState> : Record<string, never>
}

export type ConditionalFilter<T = string[]> = (
  item: string,
  index: number,
  collection: T
) => boolean

export type RdxSetActionType<Name extends string = string, Prefix extends string = string> = `@@rdx/${ScreamingSnakeCase<`set_${Prefix}${Prefix extends '' ? '' : '_'}${Name}`>}`
export type RdxResetActionType<Name extends string = string, Prefix extends string = string> = `@@rdx/${ScreamingSnakeCase<`reset_${Prefix}${Prefix extends '' ? '' : '_'}${Name}`>}`

export type RdxSetActionName<Name extends string = string, Prefix extends string = string> = `set${PascalCase<`${Prefix}`>}${PascalCase<`${Name}`>}`
export type RdxResetActionName<Name extends string = string, Prefix extends string = string> = `reset${PascalCase<`${Prefix}`>}${PascalCase<`${Name}`>}`

export type RdxSetOrResetActionType<Name extends string = string, Prefix extends string = string, IsResetActionType extends boolean|never = never> =
  IsResetActionType extends false | never ? RdxSetActionType<Name, Prefix> : RdxResetActionType<Name, Prefix>

export type RdxApiActionType<Name extends string = string, Prefix extends string = string> =
 | `${RdxSetActionType<Name, Prefix>}_SUCCESS`
 | `${RdxSetActionType<Name, Prefix>}_REQUEST`
 | `${RdxSetActionType<Name, Prefix>}_FAILURE`

export type RdxApiActionName<Name extends string = string, Prefix extends string = string> =
 | `${RdxSetActionName<Name, Prefix>}Request`
 | `${RdxSetActionName<Name, Prefix>}Failure`
 | `${RdxSetActionName<Name, Prefix>}Success`

export type RdxActionType<Name extends string = string, Prefix extends string = string> =
 | RdxSetActionType<Name, Prefix>
 | RdxResetActionType<Name, Prefix>
 | RdxApiActionType<Name, Prefix>

export type RdxActionName<Name extends string = string, Prefix extends string = string> =
 | `set${PascalCase<`${Prefix}`>}${PascalCase<`${Name}`>}`
 | `reset${PascalCase<`${Prefix}`>}${PascalCase<`${Name}`>}`
 | RdxApiActionName<Name, Prefix>

export type RdxSelectorName<Name extends string = string, Prefix extends string = string> = `get${PascalCase<Prefix>}${PascalCase<Name>}`

export type PathFromSelectorName<SelectorName> = SelectorName extends RdxSelectorName<infer Name, infer Prefix>
  ? DelimiterCase<Join<PascalCase<Name>, PascalCase<Prefix>>, '.'>
  : SelectorName

export type RdxTypesObject<Prefix extends string = string> = _O.Merge<
KeyMirroredObject<RdxActionType<string, Prefix>>,
KeyMirroredObject<RdxResetActionType<'', Prefix>>
>

/**
 * type of paths created by `getObjectPaths`
 * Depth is the level to which the path is determined by TS.
 * The default maximum is 5, which means 6 levels deep.
 * Your machine may not have enough power to handle this.
 */
export type ReflectedStatePath<State, Depth extends number = 4, MaxDepth extends number = 5> = Paths<State, Depth extends Greater<Depth, MaxDepth> ? MaxDepth : Depth, '.'>
export type StatePath<State extends _O.Object, Depth extends number = 4, MaxDepth extends number = 5> = Paths<State, Depth extends Greater<Depth, MaxDepth> ? MaxDepth : Depth, '_', 'camel'>

export type SelectorPath<State> = RdxSelectorName<StatePath<State>, ''>

// @ts-expect-error - marked here for performance
export type RdxSelector<State, Path extends ReflectedStatePath<State> = ReflectedStatePath<State>> = (state: State) => _O.Path<State, Path extends infer Y ? Split<Y, '.'> : never>

export type RdxSelectorValue<State extends _O.Object, Path extends ReflectedStatePath<State> = ReflectedStatePath<State>> = ReturnType<RdxSelector<State, Path>>

export type SelectorsObject<State extends _O.Object> = Record<SelectorPath<State>, RdxSelector<State, ReflectedStatePath<State>>>

export type StateSelection<State extends O.Object, Path extends string, BackupValue = null> =
  State extends Record<string, never> ? BackupValue :
    Path extends never ? BackupValue :
      O.Path<State, Split<Path, '.'>> extends undefined ? BackupValue : O.Path<State, Split<Path, '.'>>

export type CustomRdxSelector<
  Obj extends O.Object,
  Path extends string = ReflectedStatePath<Obj>,
> = (path: Path) => (state: Obj) => StateSelection<Obj, Path>

export interface GeneratedReducerNames<BaseName extends string = string, Prefix extends string = string> {
  actionName: RdxActionName<BaseName, Prefix>
  reducerKey: CamelCase<`${BaseName | Prefix}`>
  resetActionName: RdxActionName<BaseName, Prefix>
  resetType: RdxResetActionType<BaseName, Prefix>
  setType: RdxSetActionType<BaseName, Prefix>
}

export type RdxReducer<S = any, A = Action<S, any>> = (state: S, action: A) => S

export type ReducersMapObjectDefinition<Value extends _O.Object> = Record<string, TypeDef<Value[number]>>

export type StateFromReducersMapObjectDefinition<Map> = Map extends ReducersMapObjectDefinition<any>
  ? {
    [K in keyof Map]: Map[K] extends TypeDef<infer S> ? S : never;
  }
  : never

export interface RdxDefinition<State> { reducerKey: Paths<State, 0, '_'> | string; isApiReducer: boolean; definitions: TypeDef[] }

export interface RdxOutput<State extends _O.Object, Prefix extends string> {
  prefix: Prefix
  actions: ActionObject<State, Prefix>
  reducers: ReducersMapObject<State>
  selectors: SelectorsObject<State>
  types: RdxTypesObject<Prefix>
  state: State
}

export type RdxModule<State extends _O.Object, Prefix extends string> = RdxOutput<State, Prefix> & { '@@rdx/prefix': Prefix }

export type Handler<State> =
  | ((initialState: State) => RdxReducer<State, Action<any, any>>)
  | ((key: string) => RdxReducer<State, Action<any, any>>)
  | RdxReducer<State, Action<any, any>>

export interface PrecreatedReducerDefinitionKeys<State> {
  key: string
  handlers: Record<string, Handler<State>>
  handlerType: string
  initialState: State
}

export interface PrecreatedReducerDefinition<State> {
  reducerKey: string
  keys: Array<PrecreatedReducerDefinitionKeys<State>>
  reducerState: State
  reducerHandlers: Record<string, Handler<State>>
  isApiReducer: boolean
}

export interface ApiReducerKeys {
  failure: string
  request: string
  reset: string
  set: string
  success: string
}

export interface ApiRequestState<DataType = any, ErrorType = boolean | null> {
  dataLoaded: boolean
  fetching: boolean
  error: ErrorType
  data: DataType
}

export interface ConfiguredSagasObject {
  latest?: DefaultSagasObject
  every?: DefaultSagasObject
}

export type ReducerHandlers<State = any> = Record<
string,
RdxReducer<State, Action<any, any>>
>

type NotLatestOrEvery = Exclude<string, keyof ConfiguredSagasObject>

export type DefaultSagasObject = {
  [key in NotLatestOrEvery]: <ActionType = any>(action?: Action<ActionType>) => Generator;
}

export type SagasObject = ConfiguredSagasObject | DefaultSagasObject

export interface RdxSagasConfig {
  enabled: boolean
  options?: SagaMiddlewareOptions
}

export interface RdxModuleConfiguration<Prefix extends string> {
  /**
   *  The Prefix is the prefix that will be used for all the created types, actions, reducers, selectors and sagas for this module, if they are going to be created.
   *
   */
  prefix: Prefix
}

// TODO: add support for this option
// /**
//  * If you want to create the types, actions, reducers, selectors and sagas for this module as a standalone, set this to true.
//  * If this module will be combined with others using `combineModules`, set this to false - things will be created there.
//  * Defaults to true.
//  */
// standalone?: boolean

export type ModuleCombination<State extends _O.Object> = RdxOutput<State, ''>

export interface RdxRootConfiguration<State extends _O.Object> {
  modules: RdxOutput<State, ''>
  config?: {
    middleware?: Middleware[]
    devtools?: RdxDevToolsConfig
    sagas?: RdxSagasConfig
    wrapReducersWith?: (vs: any) => any
  }
}

export type ActionMapper<State extends _O.Object, Actions extends ActionObject<State, ''>> = (
  actions: Actions
)
=> (dispatch: Dispatch)
=> (...vs: Array<Paths<Actions, 0, '_', 'camel'>>)
=> Record<
Paths<Actions, 0, '_', 'camel'>,
ActionCreator<any, any>
>

export type SelectionMapper<State extends _O.Object> = (
  selectors: SelectorsObject<State>
) => (vs: Record<string, SelectorPath<State>>) => (state: State) => Record<string, ReturnType<RdxSelector<State>>>

export type ConfiguredStore<State extends _O.Object> = ModuleCombination<State> & {
  store: Store<State>
  mapState: ReturnType<SelectionMapper<State>>
  mapActions: ReturnType<ReturnType<ActionMapper<State, ActionObject<State, ''>>>>
  runSagas: (sagas: Saga[]) => void
}

export interface RdxMappers<S extends _O.Object, Actions extends _O.Object = ActionObject<S, ''>> {
  mapActions: ReturnType<ActionMapper<S, Actions>>
  mapState: ReturnType<SelectionMapper<S>>
}

export interface IntegratedRdxMappers<S extends _O.Object, Actions extends _O.Object> {
  mapActions: ReturnType<ReturnType<ActionMapper<S, Actions>>>
  mapState: ReturnType<SelectionMapper<S>>
}

export interface RdxDevToolsConfig {
  enabled: boolean
  options?: EnhancerOptions
}

/**
 * types to get a list of all possible paths from an object
 * credit to: Michael Ziluck
 * https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 */

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...Array<0>]

export type RdxPrefixed<Str extends string> = `@@rdx/${Str}`

export type Join<Key, Path, Delimiter extends string = '_', Case extends string = ''> =
  Key extends string | number ?
    Path extends string | number ?
      Case extends `camel` ? CamelCase<`${Key}${Delimiter}${Path}`> : `${Key}${Delimiter}${Path}`
      : never
    : never

export type Paths<Tree extends _O.Object, Depth extends number = 4, Delimiter extends string = '_', Case extends string = ''> =
 [Depth] extends [never] ? never :
   // inferring the type of key here delays the execution, forcing TS to take this step by step
   { [Key in keyof Tree]-?: Key extends infer K
     ? `${Cast<K, string | number>}` | Join<Cast<K, Key>, Paths<Tree[Cast<K, Key>], Prev[Depth], Delimiter, Case>, Delimiter>
     : never
   }[keyof Tree]

export type Leaves<Tree, Depth extends number = 4, Delimiter extends string = '_'> = [Depth] extends [never] ? never : Tree extends Record<string, any> ?
  { [K in keyof Tree]-?: Join<K, Leaves<Tree[K], Prev[Depth], Delimiter>, Delimiter> }[keyof Tree] : ""

export type DeepPartial<T, Depth = 4> = [Depth] extends [never] ? never :
  {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : DeepPartial<T[P]>;
  }

