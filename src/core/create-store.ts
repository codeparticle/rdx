/* eslint-disable eslint-comments/disable-enable-pair, @typescript-eslint/no-unsafe-argument */
/**
 * Creates a full root redux store.
 */
import { composeWithDevTools } from '@redux-devtools/extension'
import {
  applyMiddleware,
  combineReducers,
  createStore as createReduxStore,
  Middleware,
  ReducersMapObject,
  Store,
} from 'redux'
import type { Saga } from 'redux-saga'
import createSagaMiddleware from 'redux-saga'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'

import { DEFAULT_DEVTOOLS_CONFIG } from '../internal/constants/dev-tools-config'
import { RDX_INTERNAL_PREFIXES } from '../internal/constants/library-prefixes'
import { DEFAULT_REDUX_SAGAS_CONFIG } from '../internal/constants/sagas-config'
import { combineSagas } from '../sagas'
import type {
  ActionCreator,
  ConfiguredStore,
  RdxAction,
  RdxOutput,
  RdxRootConfiguration,
} from '../types'
import { getObjectPaths, id, keyMirror } from '../utils'
import { createActions, extendActions } from './create-actions'
import { createSelectors } from './create-selectors'
import { createRdxActionTypesFromState, extendTypes } from './create-types'
import { createMappers } from './map-props'

function combineModules<
  State extends _Object,
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
  CustomReducers extends ReducersMapObject = Record<string, never>,
>(...modules): RdxOutput<State, '', CustomActions, CustomReducers>
function combineModules(...modules) {
  const root = {
    state: {},
    reducers: {},
    types: {},
    actions: {},
    selectors: {},
  }

  for (let i = 0, len = modules.length; i < len; i++) {
    const mod = modules[i]

    const prefix = mod[RDX_INTERNAL_PREFIXES.RDX_MODULE_PREFIX]

    if (!prefix) {
      throw new Error(
        `rdx requires that all modules provided to combineModules be created with rdx. Received object with keys ${Object.keys(
          mod,
        ).join(`, `)}`,
      )
    }

    if (root.state[prefix]) {
      throw new Error(
        `Duplicate prefix "${prefix}" is not allowed. All modules combined by RDX must have a unique prefix.`,
      )
    }

    root.state[prefix] = mod.state
    root.reducers[prefix] = mod.reducers
  }

  const paths = getObjectPaths(root.state)

  root.types = extendTypes(
    keyMirror(createRdxActionTypesFromState(root.state, paths, ``)),
    ...modules.map((m) => m.types),
    keyMirror([`@@rdx/SET_BATCH_ACTIONS`]),
  )

  root.actions = extendActions(
    createActions(root.state, paths, ``),
    modules.reduce((totalActions, nextMod) => {
      const nextActions = nextMod.actions

      for (const actionName in nextActions) {
        totalActions[actionName] = nextActions[actionName]
      }

      return totalActions
    }, {}),
  )
  root.selectors = createSelectors(root.state, paths, ``)
  // root.reducers = createAutoReducer(root.state as State, ``)

  return root
}

const defaultConfig = {
  middleware: [],
  provideMappers: true,
  wrapReducersWith: id,
  devtools: DEFAULT_DEVTOOLS_CONFIG,
  sagas: DEFAULT_REDUX_SAGAS_CONFIG,
}

function createStore<
  State extends _Object,
  CustomActions extends Record<string, ActionCreator> = Record<string, never>,
  CustomReducers extends ReducersMapObject = Record<string, never>,
>({
  modules,
  config = defaultConfig,
}: RdxRootConfiguration<State, CustomActions>): ConfiguredStore<
  State,
  CustomActions,
  CustomReducers
  > {
  let storeConfig = config

  if (!Object.is(defaultConfig, config)) {
    storeConfig = Object.assign({}, defaultConfig, config)
  }

  const sagasMiddleware = createSagaMiddleware(storeConfig?.sagas?.options)

  let enhancer: any = applyMiddleware

  if (storeConfig?.devtools?.enabled) {
    const devToolsEnhancer = composeWithDevTools(storeConfig?.devtools?.options ?? {})

    enhancer = (...middleware: Middleware[]) => devToolsEnhancer(applyMiddleware(...middleware))
  }

  const store: Store<State, RdxAction> = createReduxStore(
    (storeConfig.wrapReducersWith ?? id)(
      typeof modules.reducers === `function`
        ? modules.reducers
        : combineReducers<State>(modules.reducers),
    ),

    enhancer(
      ...[storeConfig?.middleware ?? []].flat()
        // eslint-disable-next-line unicorn/prefer-spread
        .concat(storeConfig?.sagas?.enabled ? sagasMiddleware : []),
    ),
  )

  const { mapActions, mapState } = createMappers<State, CustomActions>({
    actions: modules.actions,
    selectors: modules.selectors,
  })

  return {
    ...modules,
    store,
    mapActions: mapActions(store.dispatch),
    mapState: mapState,
    ...(storeConfig?.sagas?.enabled
      ? {
        runSagas: (args: Saga[]) => {
          sagasMiddleware.run(combineSagas(...[args].flat()))
        },
      }
      : {
        runSagas: (..._: any[]) => {
          throw new Error(`RDX: runSagas() was called but RDX was not configured with sagas.`)
        },
      }),
  }
}

export { combineModules, createStore }
