/**
 * Creates a full root redux store.
 */
import { createStore as createReduxStore, combineReducers, applyMiddleware, PreloadedState, Middleware } from 'redux'
import { RdxRootConfiguration, Action, ConfiguredStore, ModuleCombination, RdxOutput, RdxModule } from "../types"
import { generateSelectors  } from './generate-selectors'
import { generateMappers } from './map-props'
import { id } from '../utils'
import { composeWithDevTools } from 'redux-devtools-extension'
import { DEFAULT_DEVTOOLS_CONFIG } from '../internal/constants/dev-tools-config'
import { combineSagas } from '../sagas'
import createSagaMiddleware from 'redux-saga'
import { DEFAULT_REDUX_SAGAS_CONFIG } from '../internal/constants/sagas-config'

const getFirstObjectKey = <O>(obj: O): string => {
  const keys = Object.keys(obj)
  const firstProperty = keys[0]

  return firstProperty
}

const assignModule = <T, R = RdxOutput<any>>(currentModule: T, root: R): R => {
  const prefix = getFirstObjectKey(currentModule)
  const {
    types: currentTypes,
    actions: currentActions,
    reducers: currentReducers,
    state: currentState,
  } = currentModule[prefix]

  const { types, actions, reducers, state } = root as unknown as RdxOutput<any>

  return Object.assign(
    root,
    {
      types: Object.assign(
        types,
        currentTypes,
      ),
      actions: Object.assign(
        actions,
        currentActions,
      ),
      state: Object.assign(
        state,
        {
          [prefix]: currentState,
        },
      ),
      reducers: Object.assign(
        reducers,
        {
          [prefix]: combineReducers(currentReducers),
        },
      ),
    },
  )
}

const combineModules = <State=any>(...modules: RdxModule[]): ModuleCombination<State> => {
  let root: RdxOutput<any> = {
    types: {},
    actions: {},
    reducers: {} as any,
    state: {},
    selectors: {},
  }

  modules.reduce((acc, mod: RdxModule) => {
    const prefix = getFirstObjectKey(mod)

    if (acc.includes(prefix)) {
      throw new Error(
        `Duplicate prefix "${prefix}" is not allowed. All modules combined by RDX must have a unique prefix.`,
      )
    }

    acc.push(prefix)

    return acc
  }, [])

  let len = modules.length

  while (len--) {
    const mod = modules[len]

    root = assignModule(mod, root)
  }

  root.selectors = generateSelectors(root.state)

  return root as ModuleCombination<State>
}

const defaultConfig = {
  middleware: [],
  provideMappers: true,
  wrapReducersWith: id,
  devtools: DEFAULT_DEVTOOLS_CONFIG,
  sagas: DEFAULT_REDUX_SAGAS_CONFIG,
}

const createStore = <State = any>({
  modules,
  config = defaultConfig,
}: RdxRootConfiguration<State>): ConfiguredStore<State> => {
  let sagasMiddleware: any = {}
  const storeConfig = Object.assign(defaultConfig, config)

  if (storeConfig.sagas.enabled) {
    sagasMiddleware = createSagaMiddleware(storeConfig.sagas.options ?? {})
    storeConfig.middleware.push(sagasMiddleware)
  }

  let enhancer: any = applyMiddleware

  if (storeConfig.devtools.enabled) {
    const devToolsEnhancer = composeWithDevTools(storeConfig.devtools?.options ?? {})

    enhancer = (...middleware: Middleware[]) => devToolsEnhancer(
      applyMiddleware(...middleware),
    )

  }

  const configuredStore = {
    ...modules,
    ...(
      storeConfig.provideMappers
        ? generateMappers<ModuleCombination<State>['actions'], ModuleCombination<State>['selectors']>({
          actions: modules.actions,
          selectors: modules.selectors,
        })
        : {})
    ,
    ...(
      storeConfig.sagas.enabled
        ? {
          runSagas: (...args) =>
            sagasMiddleware.run(
              combineSagas(...[].concat((args as unknown) as Generator | (() => Generator))),
            ),
        }
        : {}),

    store: createReduxStore<State, Action<any>, any, any>(
      (config?.wrapReducersWith ?? id)(combineReducers<State>(modules.reducers)),
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
