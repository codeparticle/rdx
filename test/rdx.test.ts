/* eslint-disable @typescript-eslint/no-unsafe-argument */
/**
 * @file Unit tests for @codeparticle/rdx
 */

import { combineReducers } from 'redux'
import { put } from 'redux-saga/effects'
import { inspect } from 'util'
import { createHandlerKeys, formatTypeString } from '../src/internal'
import {
  apiRequestState,
  apiState,
  combineModules,
  createAction,
  createReducer,
  createStore,
  extendActions,
  extendReducers,
  extendTypes,
  createActionsFromTypes,
  createTypes,
  get,
  rdx,
  replaceReducerHandler,
  selector,
  mapPaths,
  RdxReducer,
} from "../src"
import { combineSagas, createSagas } from '../src/sagas'
import * as utils from '../src/utils'

const module1State = {
  lightSwitch: true,
  metadata: { isCool: true },
  settings: {},
  mega: {
    num: 20,
    string: ``,
    mega: `mega`,
  },
  todo: {
    todos: [1, 2, 3],
  },
  apiCall: apiRequestState<boolean | Record<string, any>>(),
  deeply: {
    nested: {
      object: {
        is: {
          fine: true, // but only for selectors
        },
      },
    },
  },
}

const module2State = {
  wow: `big if true`,
}

interface AppState {
  app: typeof module1State
  whoa: typeof module2State
}

const module1 = rdx<`app`>({
  prefix: `app`,
})(module1State)
const module2 = rdx<`whoa`>({
  prefix: `whoa`,
})(module2State)

const customTypes = createTypes([
  `what`,
  `coolDude`,
  `sweet`,
] as const)

const customActions = createActionsFromTypes(customTypes)

// eslint-disable-next-line
const modules = combineModules<AppState, typeof customActions>(module1, module2)

modules.types = extendTypes(modules.types, customTypes)
modules.actions = extendActions<typeof modules.actions, typeof customActions>(modules.actions, customActions)

describe(`redux utils`, () => {
  it(`formatString properly formats`, () => {
    expect(formatTypeString(`app`, ``, true)).toEqual(`@@rdx/RESET_APP`)
    expect(formatTypeString(``, `app`, true)).toEqual(`@@rdx/RESET_APP`)
    expect(formatTypeString(`big_oof`, ``, true)).toEqual(`@@rdx/RESET_BIG_OOF`)
    expect(formatTypeString(`big_oof`, ``)).toEqual(`@@rdx/SET_BIG_OOF`)
    expect(formatTypeString(`big_oof`, `bigOof`, true)).toEqual(`@@rdx/RESET_BIG_OOF_BIG_OOF`)
  })
  it(`should be able to create reducer, type, action, and selector names from an initial state object`, () => {
    const expectedNames = {
      setType: `@@rdx/SET_ANY_STRING`,
      resetType: `@@rdx/RESET_ANY_STRING`,
      actionName: `setAnyString`,
      resetActionName: `resetAnyString`,
      reducerKey: `anyString`,
    }
    const actualNames = createHandlerKeys(`anyString`, ``)

    for (const name of Object.values(actualNames)) {
      expect(Object.values(expectedNames).includes(name)).toBeTruthy()
    }
  })
  it(`should create types from a template string with createTypes`, () => {
    const templateStringTypes = createTypes`
      coolDude
      sweet
      what
    `

    for (const val in templateStringTypes) {
      expect(Object.keys(customTypes).includes(val)).toBeTruthy()
    }
  })

  it(`should accept a curried version of createAction`, () => {
    const expectedAction = {
      type: `type`,
      payload: true,
    }

    expect(createAction(`type`)(true)).toEqual(expectedAction)
    expect(createAction<any, any>(`type`)(true, { meta: { isAwesome: true } })).toEqual({
      ...expectedAction,
      meta: { isAwesome: true },
    })
    expect(createAction<any, any>(`type`)(true, { meta: { isAwesome: true }, id: `killer` })).toEqual({
      ...expectedAction,
      meta: { isAwesome: true },
      id: `killer`,
    })
  })
})

describe(`RDX`, () => {
  const storeActions = {
    batchActions: expect.any(Function),
    coolDude: expect.any(Function),
    resetApp: expect.any(Function),
    resetAppApiCall: expect.any(Function),
    resetAppApiCallData: expect.any(Function),
    resetAppApiCallDataLoaded: expect.any(Function),
    resetAppApiCallError: expect.any(Function),
    resetAppApiCallFetching: expect.any(Function),
    resetAppDeeply: expect.any(Function),
    resetAppDeeplyNested: expect.any(Function),
    resetAppDeeplyNestedObject: expect.any(Function),
    resetAppDeeplyNestedObjectIs: expect.any(Function),
    resetAppDeeplyNestedObjectIsFine: expect.any(Function),
    resetAppLightSwitch: expect.any(Function),
    resetAppMega: expect.any(Function),
    resetAppMegaMega: expect.any(Function),
    resetAppMegaNum: expect.any(Function),
    resetAppMegaString: expect.any(Function),
    resetAppMetadata: expect.any(Function),
    resetAppMetadataIsCool: expect.any(Function),
    resetAppSettings: expect.any(Function),
    resetAppTodo: expect.any(Function),
    resetAppTodoTodos: expect.any(Function),
    resetWhoa: expect.any(Function),
    resetWhoaWow: expect.any(Function),
    setApp: expect.any(Function),
    setAppApiCall: expect.any(Function),
    setAppApiCallData: expect.any(Function),
    setAppApiCallDataLoaded: expect.any(Function),
    setAppApiCallError: expect.any(Function),
    setAppApiCallFailure: expect.any(Function),
    setAppApiCallFetching: expect.any(Function),
    setAppApiCallRequest: expect.any(Function),
    setAppApiCallSuccess: expect.any(Function),
    setAppDeeply: expect.any(Function),
    setAppDeeplyNested: expect.any(Function),
    setAppDeeplyNestedObject: expect.any(Function),
    setAppDeeplyNestedObjectIs: expect.any(Function),
    setAppDeeplyNestedObjectIsFine: expect.any(Function),
    setAppLightSwitch: expect.any(Function),
    setAppMega: expect.any(Function),
    setAppMegaMega: expect.any(Function),
    setAppMegaNum: expect.any(Function),
    setAppMegaString: expect.any(Function),
    setAppMetadata: expect.any(Function),
    setAppMetadataIsCool: expect.any(Function),
    setAppSettings: expect.any(Function),
    setAppTodo: expect.any(Function),
    setAppTodoTodos: expect.any(Function),
    setWhoa: expect.any(Function),
    setWhoaWow: expect.any(Function),
    sweet: expect.any(Function),
    what: expect.any(Function),
  }

  const storeSelectors = {
    getApp: expect.any(Function),
    getAppApiCall: expect.any(Function),
    getAppApiCallData: expect.any(Function),
    getAppApiCallDataLoaded: expect.any(Function),
    getAppApiCallError: expect.any(Function),
    getAppApiCallFetching: expect.any(Function),
    getAppDeeply: expect.any(Function),
    getAppDeeplyNested: expect.any(Function),
    getAppDeeplyNestedObject: expect.any(Function),
    getAppDeeplyNestedObjectIs: expect.any(Function),
    getAppDeeplyNestedObjectIsFine: expect.any(Function),
    getAppLightSwitch: expect.any(Function),
    getAppMega: expect.any(Function),
    getAppMegaMega: expect.any(Function),
    getAppMegaNum: expect.any(Function),
    getAppMegaString: expect.any(Function),
    getAppMetadata: expect.any(Function),
    getAppMetadataIsCool: expect.any(Function),
    getAppSettings: expect.any(Function),
    getAppTodo: expect.any(Function),
    getAppTodoTodos: expect.any(Function),
    getWhoa: expect.any(Function),
    getWhoaWow: expect.any(Function),
  }

  const storeTypes = {
    [`@@rdx/RESET_APP_API_CALL_DATA_LOADED`]: `@@rdx/RESET_APP_API_CALL_DATA_LOADED`,
    [`@@rdx/RESET_APP_API_CALL_DATA`]: `@@rdx/RESET_APP_API_CALL_DATA`,
    [`@@rdx/RESET_APP_API_CALL_ERROR`]: `@@rdx/RESET_APP_API_CALL_ERROR`,
    [`@@rdx/RESET_APP_API_CALL_FETCHING`]: `@@rdx/RESET_APP_API_CALL_FETCHING`,
    [`@@rdx/RESET_APP_API_CALL`]: `@@rdx/RESET_APP_API_CALL`,
    [`@@rdx/RESET_APP_DEEPLY_NESTED_OBJECT_IS_FINE`]: `@@rdx/RESET_APP_DEEPLY_NESTED_OBJECT_IS_FINE`,
    [`@@rdx/RESET_APP_DEEPLY_NESTED_OBJECT_IS`]: `@@rdx/RESET_APP_DEEPLY_NESTED_OBJECT_IS`,
    [`@@rdx/RESET_APP_DEEPLY_NESTED_OBJECT`]: `@@rdx/RESET_APP_DEEPLY_NESTED_OBJECT`,
    [`@@rdx/RESET_APP_DEEPLY_NESTED`]: `@@rdx/RESET_APP_DEEPLY_NESTED`,
    [`@@rdx/RESET_APP_DEEPLY`]: `@@rdx/RESET_APP_DEEPLY`,
    [`@@rdx/RESET_APP_LIGHT_SWITCH`]: `@@rdx/RESET_APP_LIGHT_SWITCH`,
    [`@@rdx/RESET_APP_MEGA_MEGA`]: `@@rdx/RESET_APP_MEGA_MEGA`,
    [`@@rdx/RESET_APP_MEGA_NUM`]: `@@rdx/RESET_APP_MEGA_NUM`,
    [`@@rdx/RESET_APP_MEGA_STRING`]: `@@rdx/RESET_APP_MEGA_STRING`,
    [`@@rdx/RESET_APP_MEGA`]: `@@rdx/RESET_APP_MEGA`,
    [`@@rdx/RESET_APP_METADATA_IS_COOL`]: `@@rdx/RESET_APP_METADATA_IS_COOL`,
    [`@@rdx/RESET_APP_METADATA`]: `@@rdx/RESET_APP_METADATA`,
    [`@@rdx/RESET_APP_SETTINGS`]: `@@rdx/RESET_APP_SETTINGS`,
    [`@@rdx/RESET_APP_TODO_TODOS`]: `@@rdx/RESET_APP_TODO_TODOS`,
    [`@@rdx/RESET_APP_TODO`]: `@@rdx/RESET_APP_TODO`,
    [`@@rdx/RESET_APP`]: `@@rdx/RESET_APP`,
    [`@@rdx/RESET_WHOA_WOW`]: `@@rdx/RESET_WHOA_WOW`,
    [`@@rdx/RESET_WHOA`]: `@@rdx/RESET_WHOA`,
    [`@@rdx/SET_APP_API_CALL_DATA_LOADED`]: `@@rdx/SET_APP_API_CALL_DATA_LOADED`,
    [`@@rdx/SET_APP_API_CALL_DATA`]: `@@rdx/SET_APP_API_CALL_DATA`,
    [`@@rdx/SET_APP_API_CALL_ERROR`]: `@@rdx/SET_APP_API_CALL_ERROR`,
    [`@@rdx/SET_APP_API_CALL_FAILURE`]: `@@rdx/SET_APP_API_CALL_FAILURE`,
    [`@@rdx/SET_APP_API_CALL_FETCHING`]: `@@rdx/SET_APP_API_CALL_FETCHING`,
    [`@@rdx/SET_APP_API_CALL_REQUEST`]: `@@rdx/SET_APP_API_CALL_REQUEST`,
    [`@@rdx/SET_APP_API_CALL_SUCCESS`]: `@@rdx/SET_APP_API_CALL_SUCCESS`,
    [`@@rdx/SET_APP_API_CALL`]: `@@rdx/SET_APP_API_CALL`,
    [`@@rdx/SET_APP_DEEPLY_NESTED_OBJECT_IS_FINE`]: `@@rdx/SET_APP_DEEPLY_NESTED_OBJECT_IS_FINE`,
    [`@@rdx/SET_APP_DEEPLY_NESTED_OBJECT_IS`]: `@@rdx/SET_APP_DEEPLY_NESTED_OBJECT_IS`,
    [`@@rdx/SET_APP_DEEPLY_NESTED_OBJECT`]: `@@rdx/SET_APP_DEEPLY_NESTED_OBJECT`,
    [`@@rdx/SET_APP_DEEPLY_NESTED`]: `@@rdx/SET_APP_DEEPLY_NESTED`,
    [`@@rdx/SET_APP_DEEPLY`]: `@@rdx/SET_APP_DEEPLY`,
    [`@@rdx/SET_APP_LIGHT_SWITCH`]: `@@rdx/SET_APP_LIGHT_SWITCH`,
    [`@@rdx/SET_APP_MEGA_MEGA`]: `@@rdx/SET_APP_MEGA_MEGA`,
    [`@@rdx/SET_APP_MEGA_NUM`]: `@@rdx/SET_APP_MEGA_NUM`,
    [`@@rdx/SET_APP_MEGA_STRING`]: `@@rdx/SET_APP_MEGA_STRING`,
    [`@@rdx/SET_APP_MEGA`]: `@@rdx/SET_APP_MEGA`,
    [`@@rdx/SET_APP_METADATA_IS_COOL`]: `@@rdx/SET_APP_METADATA_IS_COOL`,
    [`@@rdx/SET_APP_METADATA`]: `@@rdx/SET_APP_METADATA`,
    [`@@rdx/SET_APP_SETTINGS`]: `@@rdx/SET_APP_SETTINGS`,
    [`@@rdx/SET_APP_TODO_TODOS`]: `@@rdx/SET_APP_TODO_TODOS`,
    [`@@rdx/SET_APP_TODO`]: `@@rdx/SET_APP_TODO`,
    [`@@rdx/SET_APP`]: `@@rdx/SET_APP`,
    [`@@rdx/SET_BATCH_ACTIONS`]: `@@rdx/SET_BATCH_ACTIONS`,
    [`@@rdx/SET_WHOA_WOW`]: `@@rdx/SET_WHOA_WOW`,
    [`@@rdx/SET_WHOA`]: `@@rdx/SET_WHOA`,
    [`coolDude`]: `coolDude`,
    [`sweet`]: `sweet`,
    [`what`]: `what`,
  }

  describe(`createStore`, () => {
    const testMiddleware = () => next => (action): any => {
      return next(action)
    }

    const { types, reducers, actions, selectors, store, runSagas } = createStore<AppState>({
      modules,
      config: {
        middleware: [testMiddleware],
      },
    })

    const successSaga = createAction(`successSagaType`)
    const failSaga = createAction(`failSagaType`)

    const resetSaga = createAction<never>(`resetSagaType`)

    const sagas = createSagas({
      every: {
        [`successSagaType`]: function * () {
          const successData = { sagaWorkedOnEvery: true }

          yield put(actions.setAppApiCallRequest())
          yield put(actions.setAppApiCallSuccess(successData))
        },
      },
      latest: {
        [`failSagaType`]: function * () {
          const failureData = { sagaWorkedOnLatest: true }

          yield put(actions.setAppApiCallData(failureData))
          yield put(actions.setAppApiCallFailure())

          // const apiCall = yield select(selectors.getAppApiCall)
        },
      },
      [`resetSagaType`]: function * () {
        yield put(actions.resetAppApiCall())
      },
    })

    // this also checks to see if combineSagas composes with itself, which it should.
    runSagas([combineSagas(...[combineSagas(...sagas)])])

    it(`should handle custom middleware`, () => {
      expect(() => {
        createStore<AppState>({
          modules,
          config: {
            middleware: [testMiddleware, testMiddleware],
          },
        })
      }).not.toThrowError()
    })
    it(`should properly create types`, () => {
      expect(types).toMatchObject({
        ...storeTypes,
        what: `what`,
        coolDude: `coolDude`,
        sweet: `sweet`,
      })
    })

    it(`should properly handle undefined keys in reducers`, () => {
      expect(() => createReducer(0, {
        // @ts-expect-error - this is meant to fail
        [undefined]: () => 2,
      })).toThrow()
    })

    it(`should handle batched actions`, () => {
      const batchReducer = createReducer(0, {
        ADD: (state: number, _) => state + 1,
      })

      const goodBatchedActions = actions.batchActions([{ type: `ADD` }, { type: `ADD` }, { type: `ADD` }])

      const badBatchedActions = {
        type: `BATCH_ACTIONS`,
        payload: 0,
        id: `BATCH_ACTIONS`,
      }

      expect(batchReducer(0, goodBatchedActions)).toEqual(3)
      expect(batchReducer(0, badBatchedActions)).toEqual(0)
    })

    it(`should properly create and combine reducers`, () => {
      const initialState = store.getState()

      expect(reducers).toEqual({
        app: expect.any(Function),
        whoa: expect.any(Function),
      })

      const newReducer: RdxReducer<number> = createReducer(2, {
        [`wow`]: replaceReducerHandler,
      })

      expect(newReducer(2, { payload: 5, type: `wow` })).toEqual(5)

      const extendedReducers = extendReducers<AppState, { wow: number }>(modules.reducers, { wow: newReducer })

      expect(extendedReducers).toEqual({ ...modules.reducers, wow: newReducer })

      expect(combineReducers(extendedReducers)(initialState, { payload: 5, type: `wow` })).toEqual({
        ...initialState,
        wow: 5,
      })
    })
    it(`should create actions from a set of reducer definitions`, () => {
      expect(actions).toMatchObject(storeActions)
    })

    it(`should create selectors from an initial state object`, () => {
      expect(selectors).toMatchObject(storeSelectors)

      expect(selectors.getAppMegaNum(store.getState())).toEqual(20)
    })

    it(`should successfully create API state`, () => {
      expect(selectors.getAppApiCall(store.getState())).toStrictEqual(apiState)
    })

    it(`should register actions created with sagas`, () => {
      expect(sagas.length).toEqual(3)

      store.dispatch(successSaga())
      expect(get(store.getState(), `app.apiCall.dataLoaded`, null)).toEqual(true)
      expect(get(store.getState(), `app.apiCall.data`, null)).toEqual({ sagaWorkedOnEvery: true })
      store.dispatch(failSaga())
      expect(selectors.getAppApiCallError(store.getState())).toEqual(true)

      store.dispatch(resetSaga())

      expect(selectors.getAppApiCall(store.getState())).toEqual(apiState)
    })

    it(`should properly create a selection from a set of state paths`, () => {
      const mappedSelector = mapPaths<AppState>({
        api: `app.apiCall`,
        apiData: `whoa.wow`,
      })

      expect(mappedSelector(store.getState())).toEqual({
        api: get(store.getState(), `app.apiCall`),
        apiData: get(store.getState(), `whoa.wow`),
      })
    })
  })

  describe(`internal utils`, () => {
    it(`valueOr`, () => {
      expect(utils.valueOr(undefined, 2)).toEqual(2)
      expect(utils.valueOr(false, 2)).toEqual(false)
      expect(utils.valueOr(null, `wow`)).toEqual(`wow`)
    })
    it(`get, setPath`, () => {
      interface TestObjType { deeply: { nested: { wow: true } }; dang: { dude: `dude` } }
      const testObj: TestObjType = { deeply: { nested: { wow: true } }, dang: { dude: `dude` } }

      expect(utils.get(testObj, `deeply.nested.wow`, 9)).toEqual(true)
      expect(utils.get(testObj, `dang.dude`, 9)).toEqual(`dude`)

      // @ts-expect-error - this is meant to fail
      expect(utils.get({}, ``, 9)).toEqual({})
      // @ts-expect-error - this is meant to fail
      expect(utils.get({}, `anything`, 9)).toEqual(9)

      expect(utils.get({ bob: `bob` }, `f`, 9)).toEqual(9)
      // eslint-disable-next-line
      // @ts-ignore
      expect(utils.get(null, `whoa`)).toEqual(null)
      expect(utils.setPath(testObj, `deeply.nested.wow`, 5)).toEqual({
        ...testObj,
        deeply: {
          ...testObj.deeply,
          nested: {
            ...testObj.deeply.nested,
            wow: 5,
          },
        },
      })
      expect(utils.setPath(testObj, `deeply.nested.wow.wow`, 5)).toEqual({
        ...testObj,
        deeply: {
          ...testObj.deeply,
          nested: {
            ...testObj.deeply.nested,
            wow: {
              wow: 5,
            },
          },
        },
      })
      expect(utils.setPath(testObj, `deeply.nested.wow`, { value: 5 })).toEqual({
        ...testObj,
        deeply: {
          ...testObj.deeply,
          nested: {
            ...testObj.deeply.nested,
            wow: { value: 5 },
          },
        },
      })
      expect(() => {
        // @ts-expect-error this is intentional
        utils.get([], [], 9)
      }).toThrow()
    })

    it(`keyMirror`, () => {
      expect(utils.keyMirror([`1`])).toEqual({ 1: `1` })
      expect(utils.keyMirror([`wow`, `bro`] as const)).toEqual({ wow: `wow`, bro: `bro` })
      expect(utils.keyMirror([])).toEqual({})
      // eslint-disable-next-line
      expect(utils.keyMirror(false as any)).toEqual({})
    })

    it(`isObject`, () => {
      expect(utils.isObject({})).toBe(true)
      expect(utils.isObject(1)).toBe(false)
      expect(utils.isObject([1])).toBe(false)
      expect(utils.isObject(false)).toBe(false)
      expect(utils.isObject(true)).toBe(false)
      expect(utils.isObject(`wow`)).toBe(false)
      expect(utils.isObject(Symbol(`wow`))).toBe(false)
      expect(utils.isObject(null)).toBe(false)
      expect(utils.isObject(undefined)).toBe(false)
    })
  })

  describe(`createRdxModule`, () => {
    it(`should create reducers correctly`, () => {
      expect(module1.reducers).toEqual(expect.any(Function))
    })

    it(`should create types correctly`, () => {
      expect(storeTypes).toEqual(modules.types)
    })

    it(`should create actions correctly`, () => {
      expect(storeActions).toMatchObject(modules.actions)
    })

    it(`should create selectors correctly`, () => {
      const moduleKeys = Object.keys(modules.selectors).sort()
      const expectedKeys = Object.keys(storeSelectors).sort()

      expect(moduleKeys).toMatchObject(expectedKeys)

      for (const key of moduleKeys) {
        expect(expectedKeys.includes(key)).toEqual(true)
      }
    })

    it(`should be able to combine with other modules`, () => {
      expect(modules).toEqual({
        types: { ...storeTypes, ...customTypes },
        actions: storeActions,
        reducers: {
          app: expect.any(Function),
          whoa: expect.any(Function),
        },
        selectors: storeSelectors,
        state: {
          app: module1State,
          whoa: module2State,
        },
      })
    })
  })

  describe(`Redux interop`, () => {
    const { actions, types, selectors, store, state, mapActions, mapState } = createStore<AppState, typeof customActions>({
      modules,
      config: {
        devtools: {
          enabled: true,
        },
        sagas: {
          enabled: true,
        },
        wrapReducersWith: reducer => (...args) => {
          console.log(inspect({
            action: args[1],
            reducer: reducer.apply(reducer, args),
          }, { depth: 6 }))

          return reducer(...args)
        },
      },
    })

    const _types = Object.keys(types)

    Object.entries(actions).forEach(([_, action]) => {
      const { type } = action()

      if (!_types.includes(type)) {
        console.log(`========\n`, `failed action type`, type, `\n========`)
      }

      expect(_types.includes(action().type)).toEqual(true)
    })

    it(`has the correct initial state`, () => {
      expect(store.getState()).toMatchObject(state)
    })

    const mappedActions = mapActions(
      `setWhoaWow`,
      `setAppTodo`,
      `setAppTodoTodos`,
      `setAppMetadata`,
      `coolDude`,
      `setAppMetadataIsCool`,
      `resetAppMega`,
    )

    const mappedState = mapState({
      whoaWow: `getWhoaWow`,
      todo: `getAppTodo`,
      metadata: `getAppMetadata`,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    })(store.getState())

    it(`properly maps state`, () => {
      expect(store.getState()).toEqual(modules.state)
      expect(mappedState.whoaWow).toEqual(`big if true`)
      expect(mappedState.metadata).toEqual({ isCool: true })
      expect(mappedState.todo).toEqual({ todos: [1, 2, 3] })
    })
    it(`has the correct mapped actions`, () => {
      expect(mappedActions).toMatchObject({
        setWhoaWow: expect.any(Function),
        setAppTodo: expect.any(Function),
        setAppTodoTodos: expect.any(Function),
        setAppMetadata: expect.any(Function),
        setAppMetadataIsCool: expect.any(Function),
        resetAppMega: expect.any(Function),
        coolDude: expect.any(Function),
      })
    })

    it(`fires mapped actions correctly`, () => {
      expect(mappedActions.setWhoaWow(50000)).toEqual({ type: `@@rdx/SET_WHOA_WOW`, payload: 50000 })

      expect(store.getState().whoa.wow).toEqual(50000)

      mappedActions.setAppTodo({ todos: [1, 2, 3, 4, 5] })

      expect(store.getState().app.todo).toMatchObject({ todos: [1, 2, 3, 4, 5] })

      const _selector = selector<AppState>(`app.todo`)

      expect(_selector(store.getState())).toMatchObject({
        todos: [1, 2, 3, 4, 5],
      })

      mappedActions.setAppTodoTodos([1, 2, 3, 4, 5, 6])
      expect(store.getState().app.todo).toMatchObject({ todos: [1, 2, 3, 4, 5, 6] })

      mappedActions.setAppMetadataIsCool(true)
      expect(selectors.getAppMetadataIsCool(store.getState())).toEqual(true)

      mappedActions.setAppMetadata({ isCool: false })
      const state = store.getState()

      expect(selectors.getAppMetadata(state)).toMatchObject({ isCool: false })
    })

    it(`actually works with redux`, () => {
      expect(actions.setAppMegaNum(2000)).toMatchObject({
        type: `@@rdx/SET_APP_MEGA_NUM`,
        payload: 2000,
      })

      store.dispatch(actions.setAppMegaNum(2000))

      expect(store.getState().app.mega.num).toEqual(2000)

      expect(selectors.getAppMegaNum(store.getState())).toEqual(2000)
      expect(selectors.getAppMega(store.getState())).toEqual({
        ...store.getState().app.mega,
        num: 2000,
      })

      expect(mappedActions.resetAppMega()).toMatchObject({
        type: `@@rdx/RESET_APP_MEGA`,
      })

      expect(selectors.getAppMega(store.getState())).toEqual(store.getState().app.mega)
      expect(selectors.getAppApiCall(store.getState())).toEqual(apiState)

      expect(actions.setAppApiCallFailure(true)).toEqual({
        type: `@@rdx/SET_APP_API_CALL_FAILURE`,
        payload: true,
      })

      store.dispatch(actions.setAppApiCallFailure(true))

      expect(selectors.getAppApiCall(store.getState())).not.toEqual(apiState)
      expect(selectors.getAppApiCallDataLoaded(store.getState())).toEqual(false)
      expect(selectors.getAppApiCallError(store.getState())).toEqual(true)

      store.dispatch(actions.resetApp())
      expect(store.getState().app).toEqual(modules.state.app)
    })
  })
})
