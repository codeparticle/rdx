/* eslint-disable @typescript-eslint/semi */
import { Dispatch, Middleware, ReducersMapObject, Store } from "redux";
import { EnhancerOptions } from "@redux-devtools/extension";
import { Saga, SagaMiddlewareOptions } from "redux-saga";
import { CamelCase, PascalCase, ScreamingSnakeCase, Split } from 'type-fest';
import { N, A, O } from 'ts-toolbelt';

interface HandlerType {
  string: `string`
  number: `number`
  boolean: `boolean`
  array: `array`
  object: `object`
  api: `api`
  default: `default`
}

type KeyMirroredObject<Ts extends string[] | readonly string[]> = Record<Ts[number], Ts[number]>

type PayloadObject<Payload = never> = A.Extends<Payload, NonNullable<Payload>> extends 1 ? Record<string, unknown> : { payload: Payload }

type AdditionalKeysObject<AdditionalKeys = never> = A.Extends<AdditionalKeys, NonNullable<AdditionalKeys>> extends 0 ? Record<string, never> : AdditionalKeys extends O.Object ? AdditionalKeys : Record<string, never>

type AdditionalActionProperties<Payload, AdditionalKeys> = O.Merge<PayloadObject<Payload>, AdditionalKeysObject<AdditionalKeys>>

type RdxAction<Payload = any, AdditionalKeys = any> = {
  type: string
} & PayloadObject<Payload> & AdditionalKeysObject<AdditionalKeys>

type ActionObject<State extends O.Object, Prefix extends string> = Record<RdxActionName<Paths<State, 4, '_', 'camel'>, Prefix> | 'batchActions', ActionCreator<any, any>>

type ActionCreator<Payload = any, AdditionalKeys = never> = (payload?: Payload, additionalKeys?: AdditionalKeys extends O.Object ? O.Object : never)
=> RdxAction<Payload, AdditionalKeys>

interface TypeDef<InitialState = NonNullable<any>> {
  actionName: RdxActionName<string, string>
  handlerType: HandlerType[keyof HandlerType]
  initialState: InitialState
  isApiReducer: boolean
  path: string
  reducerKey: string
  resetActionName: RdxActionName<string, string>
  resetType: RdxResetActionType<string, string>
  setType: RdxSetActionType<string, string>
  children: InitialState extends O.Object ? ReducersMapObjectDefinition<InitialState> : Record<string, never>
}

type RdxSetActionType<Name extends string = string, Prefix extends string = string> = `@@rdx/${ScreamingSnakeCase<`set_${Prefix}${Prefix extends '' ? '' : '_'}${Name}`>}`
type RdxResetActionType<Name extends string = string, Prefix extends string = string> = `@@rdx/${ScreamingSnakeCase<`reset_${Prefix}${Prefix extends '' ? '' : '_'}${Name}`>}`

type RdxSetActionName<Name extends string = string, Prefix extends string = string> = `set${PascalCase<Prefix>}${PascalCase<Name>}`
type RdxResetActionName<Name extends string = string, Prefix extends string = string> = `reset${PascalCase<Prefix>}${PascalCase<Name>}`

type RdxSetOrResetActionType<Name extends string = string, Prefix extends string = string, IsResetActionType extends boolean|never = never> =
  IsResetActionType extends false | never ? RdxSetActionType<Name, Prefix> : RdxResetActionType<Name, Prefix>

type RdxApiActionType<Name extends string = string, Prefix extends string = string> =
 | `${RdxSetActionType<Name, Prefix>}_SUCCESS`
 | `${RdxSetActionType<Name, Prefix>}_REQUEST`
 | `${RdxSetActionType<Name, Prefix>}_FAILURE`

type RdxApiActionName<Name extends string = string, Prefix extends string = string> =
 | `${RdxSetActionName<Name, Prefix>}Request`
 | `${RdxSetActionName<Name, Prefix>}Failure`
 | `${RdxSetActionName<Name, Prefix>}Success`

type RdxActionType<Name extends string = string, Prefix extends string = string> =
 | RdxSetActionType<Name, Prefix>
 | RdxResetActionType<Name, Prefix>
 | RdxApiActionType<Name, Prefix>

type RdxActionName<Name extends string = string, Prefix extends string = string> =
 | `set${PascalCase<Prefix>}${PascalCase<Name>}`
 | `reset${PascalCase<Prefix>}${PascalCase<Name>}`
 | RdxApiActionName<Name, Prefix>

type RdxSelectorName<Name extends string = string, Prefix extends string = string> = `get${PascalCase<Prefix>}${PascalCase<Name>}`

type RdxTypesObject<Prefix extends string = string> = KeyMirroredObject<Array<RdxActionType<string, Prefix>>>

/**
 * type of paths created by `getObjectPaths`
 * Depth is the level to which the path is determined by TS.
 * The default maximum is 5, which means 6 levels deep.
 * Your machine may not have enough power to handle this.
 */
type ReflectedStatePath<State, Depth extends number = 4, MaxDepth extends number = 5> = Paths<State, Depth extends N.Greater<Depth, MaxDepth> ? MaxDepth : Depth, '.'>
type StatePath<State extends O.Object, Depth extends number = 4, MaxDepth extends number = 5> = Paths<State, Depth extends N.Greater<Depth, MaxDepth> ? MaxDepth : Depth, '_', 'camel'>

type SelectorPath<State> = RdxSelectorName<StatePath<State>, ''>

// @ts-expect-error - marked here for performance
type RdxSelector<State, Path extends ReflectedStatePath<State> = ReflectedStatePath<State>> = (state: State) => O.Path<State, Path extends infer Y ? Split<Y, '.'> : never>

type RdxSelectorValue<State extends O.Object, Path extends ReflectedStatePath<State> = ReflectedStatePath<State>> = ReturnType<RdxSelector<State, Path>>

type SelectorsObject<State extends O.Object> = Record<SelectorPath<State>, RdxSelector<State, ReflectedStatePath<State>>>

type StateSelection<State extends O.Object, Path extends string, BackupValue = null> =
  State extends Record<string, never> ? BackupValue :
    Path extends never ? BackupValue :
      O.Path<State, Split<Path, '.'>> extends never ? BackupValue : O.Path<State, Split<Path, '.'>>

type CustomRdxSelector<
  Obj extends O.Object,
  Path extends string = ReflectedStatePath<Obj>,
> = (path: Path) => (state: Obj) => StateSelection<Obj, Path>

interface GeneratedReducerNames<BaseName extends string = string, Prefix extends string = string> {
  actionName: RdxActionName<BaseName, Prefix>
  reducerKey: CamelCase<`${BaseName | Prefix}`>
  resetActionName: RdxActionName<BaseName, Prefix>
  resetType: RdxResetActionType<BaseName, Prefix>
  setType: RdxSetActionType<BaseName, Prefix>
}

type RdxReducer<State = any, Payload = A.Cast<State, any>, AdditionalKeys = { type: string }> = (state: State, action: RdxAction<Payload, AdditionalKeys>) => A.Extends<Payload, NonNullable<Payload>> extends 1 ?
  State :
  A.Extends<Payload, State> extends 1 ? State :
    A.Equals<State, Payload> extends 1 ? State : Payload

type ReducersMapObjectDefinition<Value extends O.Object> = Record<string, TypeDef<Value[number]>>
interface RdxOutput<State extends O.Object, Prefix extends string> {
  prefix: Prefix
  actions: ActionObject<State, Prefix>
  reducers: ReducersMapObject<State>
  selectors: SelectorsObject<State>
  types: RdxTypesObject<Prefix>
  state: State
}

type RdxModule<State extends O.Object, Prefix extends string> = RdxOutput<State, Prefix> & { '@@rdx/prefix': Prefix }

type Handler<State, Payload = any, AdditionalKeys = Record<string, never>> =
  | ((initialState: State) => RdxReducer<State, RdxAction<Payload, AdditionalKeys>>)
  | ((key: string) => RdxReducer<State, RdxAction<Payload, AdditionalKeys>>)
  | RdxReducer<State, RdxAction<Payload, AdditionalKeys>>

interface ApiReducerKeys {
  failure: string
  request: string
  reset: string
  set: string
  success: string
}

interface ApiRequestState<DataType = any, ErrorType = boolean | null> {
  dataLoaded: boolean
  fetching: boolean
  error: ErrorType
  data: DataType
}

interface ConfiguredSagasObject {
  latest?: DefaultSagasObject
  every?: DefaultSagasObject
}

type ReducerHandlers<State = any, Payload = any, AdditionalKeys = any> = Record<
string,
RdxReducer<State, RdxAction<Payload, AdditionalKeys>>
>

type NotLatestOrEvery = Exclude<string, keyof ConfiguredSagasObject>

type DefaultSagasObject = {
  [key in NotLatestOrEvery]: <ActionType = any>(action?: RdxAction<ActionType>) => Generator;
}

type SagasObject = ConfiguredSagasObject | DefaultSagasObject

interface RdxSagasConfig {
  enabled: boolean
  options?: SagaMiddlewareOptions
}

interface RdxModuleConfiguration<Prefix extends string> {
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

type ModuleCombination<State extends O.Object> = RdxOutput<State, ''>

interface RdxRootConfiguration<State extends O.Object> {
  modules: RdxOutput<State, ''>
  config?: {
    middleware?: Middleware[]
    devtools?: RdxDevToolsConfig
    sagas?: RdxSagasConfig
    wrapReducersWith?: (vs: any) => any
  }
}

type ActionMapper<State extends O.Object, Actions extends ActionObject<State, ''>> = (
  actions: Actions
)
=> (dispatch: Dispatch)
=> (...vs: Array<Paths<Actions, 0, '_', 'camel'>>)
=> Record<
Paths<Actions, 0, '_', 'camel'>,
ActionCreator<any, any>
>

type SelectionMapper<State extends O.Object> = (
  selectors: SelectorsObject<State>
) => (vs: Record<string, SelectorPath<State>>) => (state: State) => Record<string, ReturnType<RdxSelector<State>>>

type ConfiguredStore<State extends O.Object> = ModuleCombination<State> & {
  store: Store<State>
  mapState: ReturnType<SelectionMapper<State>>
  mapActions: ReturnType<ReturnType<ActionMapper<State, ActionObject<State, ''>>>>
  runSagas: (sagas: Saga[]) => void
}

interface RdxMappers<S extends O.Object, Actions extends O.Object = ActionObject<S, ''>> {
  mapActions: ReturnType<ActionMapper<S, Actions>>
  mapState: ReturnType<SelectionMapper<S>>
}

interface RdxDevToolsConfig {
  enabled: boolean
  options?: EnhancerOptions
}

/**
 * types to get a list of all possible paths from an object
 * credit to: Michael Ziluck
 * https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 */

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...Array<0>]

type RdxPrefixed<Str extends string> = `@@rdx/${Str}`

type Join<Key, Path, Delimiter extends string = '_', Case extends string = ''> =
  Key extends string | number ?
    Path extends string | number ?
      Case extends `camel` ? CamelCase<`${Key}${Delimiter}${Path}`> : `${Key}${Delimiter}${Path}`
      : never
    : never

type Paths<Tree extends O.Object, Depth extends number = 4, Delimiter extends string = '.', Case extends string = ''> =
 [Depth] extends [never] ? never :
   // inferring the type of key here delays the execution, forcing TS to take this step by step
   { [Key in keyof Tree]-?: Key extends infer K
     ? `${A.Cast<K, string | number>}` | Join<A.Cast<K, Key>, Paths<Tree[A.Cast<K, Key>], Prev[Depth], Delimiter, Case>, Delimiter>
     : never
   }[keyof Tree]

type Leaves<Tree, Depth extends number = 4, Delimiter extends string = '.'> = [Depth] extends [never] ? never :
  Tree extends O.Object ?
    { [Key in keyof Tree]-?: Key extends infer K ?
      Join<A.Cast<K, string | number>, Leaves<Tree[A.Cast<K, string | number>], Prev[Depth], Delimiter>, Delimiter>
      : never
    }[keyof Tree] : ""

type DeepPartial<T, Depth = 4> = [Depth] extends [never] ? never :
  {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : DeepPartial<T[P]>;
  }

export type {
  ActionCreator,
  ActionMapper,
  ActionObject,
  AdditionalActionProperties,
  AdditionalKeysObject,
  ApiReducerKeys,
  ApiRequestState,
  ConfiguredSagasObject,
  ConfiguredStore,
  CustomRdxSelector,
  DeepPartial,
  DefaultSagasObject,
  GeneratedReducerNames,
  Handler,
  HandlerType,
  KeyMirroredObject,
  Leaves,
  ModuleCombination,
  NotLatestOrEvery,
  Paths,
  PayloadObject,
  RdxAction,
  RdxActionName,
  RdxActionType,
  RdxApiActionName,
  RdxApiActionType,
  RdxDevToolsConfig,
  RdxMappers,
  RdxModule,
  RdxModuleConfiguration,
  RdxOutput,
  RdxPrefixed,
  RdxReducer,
  RdxResetActionName,
  RdxResetActionType,
  RdxRootConfiguration,
  RdxSagasConfig,
  RdxSelector,
  RdxSelectorName,
  RdxSelectorValue,
  RdxSetActionName,
  RdxSetOrResetActionType,
  RdxTypesObject,
  ReducerHandlers,
  ReducersMapObjectDefinition,
  ReflectedStatePath,
  SagasObject,
  SelectorsObject,
  SelectionMapper,
  SelectorPath,
  StatePath,
  StateSelection,
  TypeDef,
}
