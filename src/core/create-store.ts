/* eslint-disable @typescript-eslint/no-unsafe-argument */
/**
 * Creates a full root redux store.
 */
import { composeWithDevTools } from '@redux-devtools/extension'
import {
  applyMiddleware,
  combineReducers,
  createStore as createReduxStore,
  Middleware,
  Store,
} from 'redux'
import createSagaMiddleware from 'redux-saga'
import type { Saga } from 'redux-saga'

import { DEFAULT_DEVTOOLS_CONFIG } from '../internal/constants/dev-tools-config'
import { DEFAULT_REDUX_SAGAS_CONFIG } from '../internal/constants/sagas-config'
import { combineSagas } from '../sagas'
import { getObjectPaths, id, keyMirror } from '../utils'
import { createSelectors } from './create-selectors'
import { extendTypes, createRdxActionTypesFromState } from './create-types'
import type {
  RdxAction,
  ConfiguredStore,
  RdxOutput,
  RdxRootConfiguration,
} from "../types"
import type { O } from 'ts-toolbelt'
import { RDX_INTERNAL_PREFIXES } from '../internal/constants/library-prefixes'
import { createActions, extendActions } from './create-actions'
import { createMappers } from './map-props'

function combineModules<
  State extends O.Object,
> (...modules): RdxOutput<State, ''> {
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
      throw new Error(`rdx requires that all modules provided to combineModules be created with rdx. Received object with keys ${Object.keys(mod).join(`, `)}`)
    }

    if (root.state[prefix]) {
      throw new Error(
        `Duplicate prefix "${prefix}" is not allowed. All modules combined by RDX must have a unique prefix.`,
      )
    }

    root.state[prefix] = mod.state
    root.reducers[prefix] = mod.reducers
  }

  const paths = getObjectPaths<State>(root.state as State)

  root.types = extendTypes(
    keyMirror(createRdxActionTypesFromState<State>(root.state as State, paths, ``)),
    ...modules.map(m => m.types),
    keyMirror([`@@rdx/SET_BATCH_ACTIONS`]),
  )

  root.actions = extendActions(createActions<State>(root.state as State, paths, ``), ...modules.map(m => m.actions))
  root.selectors = createSelectors(root.state as State, paths, ``)
  // root.reducers = createAutoReducer(root.state as State, ``)

  return root as RdxOutput<State, ''>
}

const defaultConfig = {
  middleware: [],
  provideMappers: true,
  wrapReducersWith: id,
  devtools: DEFAULT_DEVTOOLS_CONFIG,
  sagas: DEFAULT_REDUX_SAGAS_CONFIG,
}

const createStore = <State extends object>({
  modules,
  config = defaultConfig,
}: RdxRootConfiguration<State>): ConfiguredStore<State> => {
  let storeConfig = config

  if (!Object.is(defaultConfig, config)) {
    storeConfig = Object.assign({}, defaultConfig, config)
  }

  const sagasMiddleware = createSagaMiddleware(storeConfig?.sagas?.options)

  let enhancer: any = applyMiddleware

  if (storeConfig?.devtools?.enabled) {
    const devToolsEnhancer = composeWithDevTools(storeConfig?.devtools?.options ?? {})

    enhancer = (...middleware: Middleware[]) => devToolsEnhancer(
      applyMiddleware(...middleware),
    )
  }

  const store: Store<State> = createReduxStore<State, RdxAction<any, any>, never, never>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    (storeConfig.wrapReducersWith ?? id)(
      typeof modules.reducers === `function`
        ? modules.reducers
        : combineReducers<State>(modules.reducers),
    ),

    // @ts-expect-error array types
    enhancer(...([].concat(storeConfig?.middleware ?? []).concat(storeConfig?.sagas?.enabled ? sagasMiddleware : []))), // eslint-disable-line @typescript-eslint/no-unsafe-argument
  )

  const {
    mapActions,
    mapState,
  } = createMappers<State>({ actions: modules.actions, selectors: modules.selectors })

  return {
    ...modules,
    store,
    mapActions: mapActions(store.dispatch),
    mapState: mapState,
    ...(
      storeConfig?.sagas?.enabled
        ? {
          runSagas: (args: Saga[]) => {
            // @ts-expect-error array types
            sagasMiddleware.run(combineSagas(...[].concat(args)))
          },
        }
        : {
          runSagas: (..._: any[]) => {
            throw new Error(`RDX: runSagas() was called but RDX was not configured with sagas.`)
          },
        }
    ),
  }
}

export {
  combineModules,
  createStore,
}
