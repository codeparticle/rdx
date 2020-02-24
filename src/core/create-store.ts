/**
 * Creates a full root redux store.
 */
import { createStore as createReduxStore, combineReducers, applyMiddleware, PreloadedState, ReducersMapObject } from 'redux'
import { RdxRootConfiguration, Action, ConfiguredStore, ModuleCombination, RdxOutput, RdxSubmodule } from "../types"
import { generateSelectors  } from './generate-selectors'
import { generateMappers } from './map-props'
import { pipe } from '../utils/pipe'
import { composeWithDevTools } from 'redux-devtools-extension'
import { DEFAULT_DEVTOOLS_CONFIG } from '../internal/constants/dev-tools-config'
import { combineSagas } from '../sagas'
import createSagaMiddleware from 'redux-saga'
import { DEFAULT_REDUX_SAGAS_CONFIG } from '../internal/constants/sagas-config'

const assignModule = <T extends RdxOutput<object>, R extends RdxOutput<object>>(
  currentModule: T,
  root: Omit<R, 'prefix'>,
) => {
  const {
    types: currentTypes,
    actions: currentActions,
    reducers: currentReducers,
    state: currentState,
    prefix,
  } = currentModule

  const {
    types,
    actions,
    reducers,
    state,
  } = root

  return {
    ...root,
    types: { ...types, ...currentTypes },
    actions: { ...actions, ...currentActions },
    state: { ...state, [prefix]: currentState },
    reducers: { ...reducers, [prefix]: currentReducers },
  }
}

const combineModules = <State=any>(...modules: RdxSubmodule<any>[]): ModuleCombination<State> => {
  let root = {
    types: {},
    actions: {},
    reducers: {} as any,
    state: {},
    selectors: {},
  }

  modules.reduce((acc, { prefix }) => {
    if (acc.includes(prefix)) {
      throw new Error(
        `Duplicate prefix "${prefix}" is not allowed. All modules combined by RDX must have a unique prefix.`,
      )
    }

    return acc.concat(prefix)
  }, [])

  let i = modules.length

  while (i--) {
    root = assignModule(modules[i], root)
  }

  root.selectors = generateSelectors(root.state, ``)
  root.reducers = combineReducers<State>(root.reducers as ReducersMapObject<State>)

  return root as ModuleCombination<State>
}

const defaultConfig = {
  middleware: [],
  provideMappers: true,
  devtools: DEFAULT_DEVTOOLS_CONFIG,
  sagas: DEFAULT_REDUX_SAGAS_CONFIG,
}

const createStore = <State = any>({
  modules,
  config = defaultConfig,
}: RdxRootConfiguration<State>): ConfiguredStore<State> => {
  let sagasMiddleware: any = {}
  const storeConfig = { ...defaultConfig, ...config }

  if (storeConfig.sagas.enabled) {
    sagasMiddleware = createSagaMiddleware()
    storeConfig.middleware.push(sagasMiddleware)
  }

  let enhancer: any = applyMiddleware

  if (storeConfig.devtools.enabled) {
    enhancer = pipe(applyMiddleware, composeWithDevTools(storeConfig.devtools?.options || {}))
  }

  const configuredStore = {
    ...modules,
    ...(storeConfig.provideMappers
      ? generateMappers<ModuleCombination<State>['actions'], ModuleCombination<State>['selectors']>({ actions: modules.actions, selectors: modules.selectors })
      : {}),
    ...(storeConfig.sagas.enabled
      ? {
        runSagas: (...args) =>
          sagasMiddleware.run(
            combineSagas(...[].concat((args as unknown) as Generator | (() => Generator))),
          ),
      }
      : {}),

    store: createReduxStore<State, Action<any>, any, any>(
      modules.reducers,
      modules.state as PreloadedState<State>,
      enhancer(...storeConfig.middleware),
    ),
  }

  return configuredStore
}

export {
  combineModules,
  createStore,
}