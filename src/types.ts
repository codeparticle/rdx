/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/semi */
import type { EnhancerOptions } from '@redux-devtools/extension'
import type {
  DeepPartial,
  Dispatch,
  Middleware,
  ReducerFromReducersMapObject,
  ReducersMapObject,
  Store,
} from 'redux'
import type { Saga, SagaMiddlewareOptions } from 'redux-saga'
import type { CamelCase } from 'ts-essentials'
import type { Cast } from 'ts-toolbelt/out/Any/Cast'
import type { Contains } from 'ts-toolbelt/out/Any/Contains'
import type { Equals } from 'ts-toolbelt/out/Any/Equals'
import type { Extends } from 'ts-toolbelt/out/Any/Extends'
import type { Iteration } from 'ts-toolbelt/out/Iteration/Iteration'
import type { IterationOf } from 'ts-toolbelt/out/Iteration/IterationOf'
import type { Next } from 'ts-toolbelt/out/Iteration/Next'
import type { Pos } from 'ts-toolbelt/out/Iteration/Pos'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import type { Path as PathValue } from 'ts-toolbelt/out/Object/Path'
import type { Join } from 'ts-toolbelt/out/String/Join'
import type { Split } from 'ts-toolbelt/out/String/Split'
import { PartialDeep } from 'type-fest'

type ObjectPaths<
  O extends _Object,
  Limit extends Iteration = IterationOf<0>,
  Paths extends string = '',
> = 11 extends Pos<Limit>
  ? Paths
  : O extends _Object
    ?
    | Paths
    | {
      [K in keyof O]: ObjectPaths<O[K], Next<Limit>, `${Paths}.${K & string}`>
    }[keyof O]
    : Paths

type DotSeparatedPaths<O extends _Object, Limit extends number = 6> = ObjectPaths<
O,
IterationOf<Limit>
> extends `.${infer P}` | infer _
  ? P
  : ''

type PathsOf<O extends _Object, Limit extends number = 6> = DotSeparatedPaths<O, Limit>

type FunctionPathOf<O> = PathsOf<O> extends infer V
  ? V extends string
    ? CamelCase<Join<Split<V, '.'>, '_'>>
    : never
  : never

type PascalCase<Value extends string> = Capitalize<CamelCase<Value>>

interface HandlerType {
  string: `string`
  number: `number`
  boolean: `boolean`
  array: `array`
  object: `object`
  api: `api`
  default: `default`
}

type KeyMirroredObject<Ts extends string[] | readonly string[]> = Contains<
Ts,
string | readonly string[]
> extends 0
  ? Record<string, never>
  : { [K in Ts[number]]: K }

type PayloadObject<Payload = never> = Extends<Payload, NonNullable<Payload>> extends 0
  ? Record<string, unknown>
  : { payload: Payload }

type AdditionalKeysObject<AdditionalKeys = never> = Extends<
AdditionalKeys,
NonNullable<AdditionalKeys>
> extends 0
  ? Record<string, never>
  : AdditionalKeys extends _Object
    ? AdditionalKeys
    : Record<string, never>

type RdxAction<Payload = any, AdditionalKeys = any> = {
  type: string
} & PayloadObject<Payload> &
AdditionalKeysObject<AdditionalKeys>

type GeneratedActionName<State extends _Object, Prefix extends string = ''> = RdxActionName<
Capitalized<FunctionPathOf<State>>,
Prefix
>

type ActionObject<
  State extends _Object,
  Prefix extends string = '',
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
> = Equals<CustomActions, Record<string, never>> extends 1
  ? Record<GeneratedActionName<State, Prefix> | 'batchActions', ActionCreator>
  : Record<GeneratedActionName<State, Prefix> | 'batchActions', ActionCreator> & CustomActions

type ActionCreator<Payload = any, AdditionalKeys = any> = (
  payload?: Payload,
  additionalKeys?: AdditionalKeys extends _Object ? _Object : never
) => RdxAction<Payload, AdditionalKeys>

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
  children: InitialState extends _Object
    ? ReducersMapObjectDefinition<InitialState>
    : Record<string, never>
}

type Capitalized<Name extends string> = [Name] extends ['']
  ? never
  : Name extends `${infer FirstCharacter}${infer _}`
    ? FirstCharacter extends Capitalize<FirstCharacter>
      ? FunctionPathOf<Name>
      : FunctionPathOf<Name>
    : Name

type RdxSetActionType<
  Name extends string = string,
  Prefix extends string = string,
> = `@@rdx/${Uppercase<`set_${Prefix}${Prefix extends '' ? '' : '_'}${Name}`>}`
type RdxResetActionType<
  Name extends string = string,
  Prefix extends string = string,
> = `@@rdx/${Uppercase<`reset_${Prefix}${Prefix extends '' ? '' : '_'}${Name}`>}`

type RdxSetActionName<
  Name extends string = string,
  Prefix extends string = string,
> = Prefix extends '' ? `set${PascalCase<Name>}` : `set${PascalCase<Prefix>}${PascalCase<Name>}`

type RdxResetActionName<
  Name extends string = string,
  Prefix extends string = string,
> = Prefix extends '' ? `reset${PascalCase<Name>}` : `reset${PascalCase<Prefix>}${PascalCase<Name>}`

type RdxSetOrResetActionType<
  Name extends string = string,
  Prefix extends string = string,
  IsResetActionType extends boolean | never = never,
> = IsResetActionType extends false | never
  ? RdxSetActionType<Name, Prefix>
  : RdxResetActionType<Name, Prefix>

type RdxApiActionTypeSuffix = `_SUCCESS` | `_FAILURE` | `_REQUEST`
type RdxApiActionNameSuffix = `Success` | `Failure` | `Request`
type RdxApiActionType<
  Name extends string = string,
  Prefix extends string = '',
> = `${RdxSetActionType<Name, Prefix>}${RdxApiActionTypeSuffix}`

type RdxApiActionName<
  Name extends string = string,
  Prefix extends string = '',
> = `${RdxSetActionName<Name, Prefix>}${RdxApiActionNameSuffix}`

type RdxActionType<Name extends string = string, Prefix extends string = string> =
  | RdxSetActionType<Name, Prefix>
  | RdxResetActionType<Name, Prefix>
  | RdxApiActionType<Name, Prefix>

type RdxActionName<Name extends string = string, Prefix extends string = ''> =
  | RdxSetActionName<Name, Prefix>
  | RdxResetActionName<Name, Prefix>
  | RdxApiActionName<Name, Prefix>

type RdxSelectorName<Name extends string> = `get${Capitalized<FunctionPathOf<Name>>}`

type RdxTypesObject<Prefix extends string = string> = KeyMirroredObject<
Array<RdxActionType<string, Prefix>>
>

/**
 * type of paths created by `getObjectPaths`
 * Depth is the level to which the path is determined by TS.
 * The default maximum is 5, which means 6 levels deep.
 * Your machine may not have enough power to handle this.
 */
type ReflectedStatePath<State, Depth extends number = 6> = DotSeparatedPaths<State, Depth>

type SelectorPath<State> = RdxSelectorName<FunctionPathOf<State>>

type RdxSelector<State, P extends ReflectedStatePath<State> = ReflectedStatePath<State>> = (
  state: State
) => PathValue<State, Split<P, '.'>>

type RdxSelectorValue<
  State extends _Object,
  P extends ReflectedStatePath<State> = ReflectedStatePath<State>,
> = ReturnType<RdxSelector<State, P>>

type SelectorsObject<State extends _Object> = Record<
SelectorPath<State>,
(s: State) => DeepPartial<State>
>

interface GeneratedReducerNames<BaseName extends string = string, Prefix extends string = string> {
  actionName: RdxActionName<BaseName, Prefix>
  reducerKey: CamelCase<BaseName | Prefix>
  resetActionName: RdxActionName<BaseName, Prefix>
  resetType: RdxResetActionType<BaseName, Prefix>
  setType: RdxSetActionType<BaseName, Prefix>
}

type RdxReducer<State = any, Payload = Cast<State, any>> = (
  state: State,
  action: RdxAction<Payload, any>
) => Extends<Payload, NonNullable<Payload>> extends 0
  ? State
  : Extends<Payload, State> extends 1
    ? State
    : Equals<State, Payload> extends 1
      ? State
      : Payload

type ReducersMapObjectDefinition<Value extends _Object> = Record<string, TypeDef<Value[number]>>

interface RdxOutput<
  State extends _Object,
  Prefix extends string,
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
  CustomReducers extends ReducersMapObject<any, RdxAction> = Record<string, never>,
> {
  prefix: Prefix
  actions: ActionObject<State, Prefix, CustomActions>
  reducers: ReducerFromReducersMapObject<ReducersMapObject<State> & CustomReducers>
  selectors: SelectorsObject<State>
  types: RdxTypesObject<Prefix>
  state: State
}

type RdxModule<State extends _Object, Prefix extends string> = RdxOutput<State, Prefix> & {
  '@@rdx/prefix': Prefix
}

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
  [key in NotLatestOrEvery]: <ActionType = any>(action?: RdxAction<ActionType>) => Generator
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

type ModuleCombination<State extends _Object> = RdxOutput<State, ''>

interface RdxRootConfiguration<
  State extends _Object,
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
  CustomReducers extends ReducersMapObject = Record<string, never>,
> {
  modules: RdxOutput<State, '', CustomActions, CustomReducers>
  config?: {
    middleware?: Middleware[]
    devtools?: RdxDevToolsConfig
    sagas?: RdxSagasConfig
    wrapReducersWith?: (vs: any) => any
  }
}

type ActionMapper<State, Actions extends ActionObject<State, ''>> = (
  actions: Actions
) => (
  dispatch: Dispatch
) => (...vs: Array<keyof Actions>) => Record<Extract<keyof Actions, string>, ActionCreator>

type SelectionMapper<State extends _Object> = (
  selectors: SelectorsObject<State>
) => (
  vs: Record<string, SelectorPath<State>>
) => (state: State) => Record<string, Cast<PartialDeep<State>, any>>

interface ConfiguredStore<
  State extends _Object,
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
  CustomReducers extends ReducersMapObject = Record<string, never>,
> {
  actions: ActionObject<State, '', CustomActions>
  reducers: ReducersMapObject<State, RdxAction> & CustomReducers
  selectors: SelectorsObject<State>
  types: RdxTypesObject<''>
  state: State
  store: Store<State>
  mapState: ReturnType<SelectionMapper<State>>
  mapActions: ReturnType<ReturnType<ActionMapper<State, ActionObject<State, '', CustomActions>>>>
  runSagas: (sagas: Saga[]) => void
}

interface RdxMappers<
  S extends _Object,
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
> {
  mapActions: ReturnType<ActionMapper<S, ActionObject<S, '', CustomActions>>>
  mapState: ReturnType<SelectionMapper<S>>
}

interface RdxDevToolsConfig {
  enabled: boolean
  options?: EnhancerOptions
}

type RdxPrefixed<Str extends string> = `@@rdx/${Str}`

export type {
  ActionCreator,
  ActionMapper,
  ActionObject,
  AdditionalKeysObject,
  ApiReducerKeys,
  ApiRequestState,
  ConfiguredSagasObject,
  ConfiguredStore,
  DefaultSagasObject,
  DotSeparatedPaths,
  GeneratedReducerNames,
  HandlerType,
  KeyMirroredObject,
  ModuleCombination,
  NotLatestOrEvery,
  PascalCase,
  PathsOf,
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
  SagasObject,
  SelectionMapper,
  SelectorPath,
  SelectorsObject,
  TypeDef,
}

export {type Path as PathValue} from 'ts-toolbelt/out/Object/Path'
