/**
 * @file Unit tests for @codeparticle/rdx
 */

import { createNames } from '../src/internal'
import {
  createAction,
  generateSelectors,
  generateTypes,
  generateMappers,
  combineModules,
  extendReducers,
  replaceReducerState,
  createReducer,
  createStore,
  rdx,
  apiState,
  extendTypes,
  generateActions,
  extendActions,
} from "../src/rdx"

import * as utils from '../src/utils'
import { put } from 'redux-saga/effects'
import { combineSagas, generateSagas } from '../src/sagas'
import { combineReducers } from 'redux'

describe(`RDX`, () => {
  const module1State = {
    lightSwitch: true,
    metadata: { isCool: true },
    mega: {
      num: 2,
      string: ``,
    },
    todo: {
      todos: [],
    },
    apiCall: apiState,
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

  const app = rdx({ prefix: `app` })(module1State)
  const whoa = rdx({ prefix: `whoa` })(module2State)

  const { app: module1 } = app
  const { whoa: module2 } = whoa

  const modules = combineModules<{
    app: typeof module1['state']
    whoa: typeof module2['state']
  }>(
    app,
    whoa,
  )

  const customTypes = generateTypes`
    WOW
    COOL_DUDE
    SWEET
  `
  const customActions = generateActions(customTypes)

  modules.types = extendTypes(modules.types, customTypes)
  modules.actions = extendActions(modules.actions, customActions)

  const storeActions = {
    resetAppApiCall: expect.any(Function),
    resetAppMega: expect.any(Function),
    resetAppTodo: expect.any(Function),
    resetAppDeeply: expect.any(Function),
    resetAppLightSwitch: expect.any(Function),
    resetAppMetadata: expect.any(Function),
    resetWhoaWow: expect.any(Function),
    setAppApiCall: expect.any(Function),
    setAppApiCallData: expect.any(Function),
    setAppApiCallError: expect.any(Function),
    setAppApiCallFetching: expect.any(Function),
    setAppApiCallDataLoaded: expect.any(Function),
    setAppApiCallRequest: expect.any(Function),
    setAppApiCallSuccess: expect.any(Function),
    setAppApiCallFailure: expect.any(Function),
    setAppLightSwitch: expect.any(Function),
    setAppMega: expect.any(Function),
    setAppMegaNum: expect.any(Function),
    setAppMegaString: expect.any(Function),
    setAppMetadata: expect.any(Function),
    setAppMetadataIsCool: expect.any(Function),
    setAppTodo: expect.any(Function),
    setAppTodoTodos: expect.any(Function),
    setWhoaWow: expect.any(Function),
    setAppDeeply: expect.any(Function),
    setAppDeeplyNested: expect.any(Function),
  }

  const storeSelectors = {
    getApp: expect.any(Function),
    getAppApiCall: expect.any(Function),
    getAppApiCallData: expect.any(Function),
    getAppApiCallError: expect.any(Function),
    getAppApiCallFetching: expect.any(Function),
    getAppApiCallDataLoaded: expect.any(Function),
    getAppLightSwitch: expect.any(Function),
    getAppMega: expect.any(Function),
    getAppMegaNum: expect.any(Function),
    getAppMegaString: expect.any(Function),
    getAppMetadata: expect.any(Function),
    getAppMetadataIsCool: expect.any(Function),
    getAppDeeply: expect.any(Function),
    getAppDeeplyNested: expect.any(Function),
    getAppDeeplyNestedObject: expect.any(Function),
    getAppDeeplyNestedObjectIs: expect.any(Function),
    getAppDeeplyNestedObjectIsFine: expect.any(Function),
    getAppTodo: expect.any(Function),
    getAppTodoTodos: expect.any(Function),
    getWhoa: expect.any(Function),
    getWhoaWow: expect.any(Function),
  }

  const storeTypes = {
    RESET_APP_API_CALL: `RESET_APP_API_CALL`,
    RESET_APP_DEEPLY: `RESET_APP_DEEPLY`,
    RESET_APP_LIGHT_SWITCH: `RESET_APP_LIGHT_SWITCH`,
    RESET_APP_MEGA: `RESET_APP_MEGA`,
    RESET_APP_METADATA: `RESET_APP_METADATA`,
    RESET_APP_TODO: `RESET_APP_TODO`,
    RESET_WHOA_WOW: `RESET_WHOA_WOW`,
    SET_APP_API_CALL: `SET_APP_API_CALL`,
    SET_APP_API_CALL_DATA: `SET_APP_API_CALL_DATA`,
    SET_APP_API_CALL_DATA_LOADED: `SET_APP_API_CALL_DATA_LOADED`,
    SET_APP_API_CALL_ERROR: `SET_APP_API_CALL_ERROR`,
    SET_APP_API_CALL_FAILURE: `SET_APP_API_CALL_FAILURE`,
    SET_APP_API_CALL_FETCHING: `SET_APP_API_CALL_FETCHING`,
    SET_APP_API_CALL_REQUEST: `SET_APP_API_CALL_REQUEST`,
    SET_APP_API_CALL_SUCCESS: `SET_APP_API_CALL_SUCCESS`,
    SET_APP_DEEPLY: `SET_APP_DEEPLY`,
    SET_APP_DEEPLY_NESTED: `SET_APP_DEEPLY_NESTED`,
    SET_APP_LIGHT_SWITCH: `SET_APP_LIGHT_SWITCH`,
    SET_APP_MEGA: `SET_APP_MEGA`,
    SET_APP_MEGA_NUM: `SET_APP_MEGA_NUM`,
    SET_APP_MEGA_STRING: `SET_APP_MEGA_STRING`,
    SET_APP_METADATA: `SET_APP_METADATA`,
    SET_APP_METADATA_IS_COOL: `SET_APP_METADATA_IS_COOL`,
    SET_APP_TODO: `SET_APP_TODO`,
    SET_APP_TODO_TODOS: `SET_APP_TODO_TODOS`,
    SET_WHOA_WOW: `SET_WHOA_WOW`,
  }

  describe(`createStore`, () => {

    const { types, reducers, actions, selectors, store, runSagas } = createStore({
      modules,
      config: {},
    })

    const sagaActionType = `sagaActionType`
    const sagaAction = createAction(sagaActionType)

    const sagas = generateSagas({
      every: {
        [sagaActionType]: function*() {
          yield put(actions.setAppApiCallRequest())
          yield put(actions.setAppApiCallData({ sagaWorkedOnEvery: true }))
        },
      },
      latest: {
        [sagaActionType]: function*() {
          yield put(actions.setAppApiCallData({ sagaWorkedOnLatest: true }))
          yield put(actions.setAppApiCallFailure())
        },
      },
      [sagaActionType]: function*() {
        yield put(actions.setAppApiCallData({ sagaWorked: true }))
      },
    })

    runSagas(combineSagas(combineSagas(...sagas)))

    it(`should handle custom middleware`, () => {
      const testMiddleware = () => next => (action) => {
        console.log(`ACTION: `, action)

        return next(action)
      }

      expect(() => {
        createStore({
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
        WOW: `WOW`,
        COOL_DUDE: `COOL_DUDE`,
        SWEET: `SWEET`,
      })
    })

    it(`should properly handle undefined keys in reducers`, () => {
      expect(() => createReducer(0, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        [void 0]: () => 2,
      })).toThrow()
    })

    it(`should handle batched actions`, () => {
      const batchReducer = createReducer(0, {
        [`ADD`]: (state) => state + 1,
      })

      const goodBatchedActions = {
        type: `BATCH_ACTIONS`,
        payload: [{ type: `ADD` }, { type: `ADD` }, { type: `ADD` }],
        id: `BATCH_ACTIONS`,
      }

      const badBatchedActions = {
        type: `BATCH_ACTIONS`,
        payload: 0,
        id: `BATCH_ACTIONS`,
      }

      expect(batchReducer(0, goodBatchedActions)).toEqual(3)
      expect(batchReducer(0, badBatchedActions)).toEqual(0)
    })

    it(`should combine reducers`, () => {
      expect(reducers).toEqual({
        app: expect.any(Function),
        whoa: expect.any(Function),
      })
      const newReducer = createReducer(2, {
        [`wow`]: replaceReducerState,
      })

      expect(newReducer(2, { payload: 5, type: `wow`, id: `wow` })).toEqual(5)

      const extendedReducers = extendReducers(module1.reducers, { wow: newReducer })

      expect(extendedReducers).toEqual({ ...module1.reducers, wow: newReducer })

      expect(combineReducers(extendedReducers)({}, { payload: 5, type: `wow`, id: `wow` } as never)).toEqual({
        ... module1State,
        wow: 5,
      })

    })
    it(`should generate actions from a set of reducer definitions`, () => {
      expect(actions).toMatchObject(storeActions)
    })

    it(`should generate selectors from an initial state object`, () => {
      expect(selectors).toMatchObject(storeSelectors)

      expect(selectors.getAppMegaNum(store.getState())).toEqual(2)
    })

    it(`should successfully register API calls`, () => {
      expect(store.getState().app.apiCall).toBe(apiState)
    })

    it(`should register actions created with sagas`, () => {
      expect(sagas.length).toEqual(3)

      store.dispatch(sagaAction())

      expect(selectors.getAppApiCall(store.getState())).toEqual({
        fetching: false,
        dataLoaded: false,
        error: true,
        data: {
          sagaWorked: true,
          sagaWorkedOnEvery: true,
          sagaWorkedOnLatest: true,
        },
      })
    })

  })

  describe(`internal utils`, () => {
    it(`valueOr`, () => {
      expect(utils.valueOr(undefined, 2)).toEqual(2)
      expect(utils.valueOr(false, 2)).toEqual(false)
      expect(utils.valueOr(null, `wow`)).toEqual(`wow`)
    })
    it(`get`, () => {
      const testObj = { deeply: { nested: { wow: true } } }

      expect(utils.get(testObj, [`deeply`, `nested`, `wow`], 9)).toEqual(true)
      expect(utils.get({}, null, 9)).toEqual({})
      expect(utils.get(null, [], 9)).toEqual(9)
      expect(utils.get({}, null, 9)).toEqual({})
      expect(utils.get(null, null, 9)).toEqual(9)
      expect(() => {
        utils.get([], [], 9)
      }).toThrow()

    })

    it(`keyMirror`, () => {
      expect(utils.keyMirror([1])).toEqual({ "1" : `1` })
      expect(utils.keyMirror([`wow`, `bro`])).toEqual({ "wow": `wow`, "bro": `bro` })
      expect(utils.keyMirror([])).toEqual({})
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
    })
  })

  describe(`createRdxModule`, () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setWhoaWow, resetWhoaWow, ...singleModActions } = storeActions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getWhoa, getWhoaWow, getApp, ...singleModSelectors } = storeSelectors
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { SET_WHOA_WOW, RESET_WHOA_WOW, ...singleModTypes } = storeTypes

    it(`should generate reducers correctly`, () => {
      const expectedReducers = {
        lightSwitch: expect.any(Function),
        todo: expect.any(Function),
        mega: expect.any(Function),
        apiCall: expect.any(Function),
      }

      expect(module1.reducers).toMatchObject(
        expectedReducers,
      )
    })
    it(`should generate types correctly`, () => {
      expect(module1.types).toMatchObject(singleModTypes)
    })

    it(`should generate actions correctly`, () => {
      expect(module1.actions).toMatchObject(singleModActions)
    })

    it(`should generate selectors correctly`, () => {
      const moduleKeys = Object.keys(module1.selectors).sort()
      const expectedKeys = Object.keys(singleModSelectors).sort()

      expect(moduleKeys).toMatchObject(expectedKeys)

      for (const key of moduleKeys) {
        expect(expectedKeys.includes(key)).toEqual(true)
      }

      expect(Object.keys(module1.selectors)).toMatchObject(
        Object.keys(generateSelectors(module1State, `app`)),
      )
    })

    it(`should be able to combine with other modules`, () => {
      expect(modules).toEqual({
        types: { ...storeTypes, ...customTypes },
        actions: { ...storeActions, ...customActions },
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

      expect(generateMappers(modules)).toEqual({
        mapActions: expect.any(Function),
        mapState: expect.any(Function),
      })

      const { mapActions, mapState } = generateMappers<typeof modules['actions'], typeof modules['selectors']>(modules)

      expect(mapActions(`setWhoaWow`)).toEqual(expect.any(Function))
      expect(mapState(`getWhoaWow`)).toEqual(expect.any(Function))
      expect(mapState(`getWhoa`)(module2State)).toEqual({
        getWhoa: { wow: `big if true` },
      })
    })
  })

  describe(`redux utils`, () => {
    it(`should be able to generate reducer, type, action, and selector names from an initial state object`, () => {
      const expectedNames = {
        typeName: `SET_ANY_STRING`,
        actionName: `setAnyString`,
        selectorName: `getAnyString`,
        reducerKey: `anyString`,
      }
      const actualNames = createNames(`anyString`)

      for (const name of Object.values(actualNames)) {
        expect(Object.values(expectedNames).includes(name)).toBeTruthy()
      }
    })
    it(`should create actions from a template string with createTypes`, () => {
      const customKeyMirroredObjectKeys = [`WOW`, `COOL_DUDE`, `SWEET`]

      for (const val of customKeyMirroredObjectKeys) {
        expect(Object.keys(customTypes).includes(val)).toBeTruthy()
      }
    })

    it(`should accept a curried version of createAction`, () => {
      const expectedAction = {
        type: `type`,
        payload: true,
        id: `type`,
      }

      expect(createAction(`type`)(true)).toEqual(expectedAction)
      expect(createAction(`type`)(true, { meta: { isAwesome: true } })).toEqual({
        ...expectedAction,
        meta: { isAwesome: true },
      })
      expect(createAction(`type`)(true, { meta: { isAwesome: true } }, `killer`)).toEqual({
        ...expectedAction,
        meta: { isAwesome: true },
        id: `killer`,
      })
    })
  })

  describe(`Redux interop`, () => {
    const { actions, selectors, store, mapActions, mapState } = createStore({
      modules,
      config: {
        devtools: {
          enabled: false,
        },
        sagas: {
          enabled: false,
        },
      },
    })

    const mappedActions = mapActions(`setWhoaWow`,  `setAppTodo`, `setAppMetadata`, `setAppMetadataIsCool`, `resetAppMega`)(store.dispatch)

    it(`actually works with redux`, () => {
      expect(mappedActions).toEqual({
        setWhoaWow: expect.any(Function),
        setAppTodo: expect.any(Function),
        setAppMetadata: expect.any(Function),
        setAppMetadataIsCool: expect.any(Function),
        resetAppMega: expect.any(Function),
      })

      mappedActions.setWhoaWow(5)
      mappedActions.setAppTodo({ todos: [1, 2, 3] })
      mappedActions.setAppMetadataIsCool(true)
      mappedActions.setAppMetadata({ isCool: true })

      const mappedState = mapState({
        whoaWow: `getWhoaWow`,
        todo: `getAppTodo`,
        metadata: `getAppMetadata`,
      })(store.getState())

      expect(mappedState.whoaWow).toEqual(5)
      expect(mappedState.metadata).toEqual({ isCool: true })

      const expectedState = {
        app: {
          ...module1State,
          metadata: { isCool: true },
          todo: { todos: [1, 2, 3] } },
        whoa: {
          wow: 5,
        },
      }

      expect(store.getState()).toEqual(expectedState)

      store.dispatch(actions.setAppMegaNum(20))

      expect(store.getState().app.mega.num).toEqual(20)

      expect(selectors.getAppMegaNum(store.getState())).toEqual(20)
      expect(selectors.getAppMega(store.getState())).toEqual({
        ...expectedState.app.mega,
        num: 20,
      })

      mappedActions.resetAppMega()

      expect(selectors.getAppMega(store.getState())).toEqual(module1State.mega)
      expect(selectors.getAppApiCall(store.getState())).toEqual(apiState)

      store.dispatch(actions.setAppApiCallDataLoaded(true))

      expect(selectors.getAppApiCall(store.getState())).toEqual({ ...apiState, dataLoaded: true })
    })
  })

})
