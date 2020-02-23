/**
 * @file Unit tests for @codeparticle/rdx
 */

import { createNames } from '../src/internal'
import {
  defineState,
  createAction,
  generateReducersFromDefs,
  generateSelectors,
  generateTypes,
  generateMappers,
  combineModules,
  createStore,
  rdx,
  apiState,
} from "../src/rdx"

import * as utils from '../src/utils'
import { put, select } from 'redux-saga/effects'
import { combineSagas, generateSagas } from '../src/sagas'

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

  const module1 = rdx({ prefix: `app` })(module1State)
  const module2 = rdx({ prefix: `whoa` })(module2State)
  const modules = combineModules<{ app: typeof module1['state']; whoa: typeof module2['state']}>(
    module1,
    module2,
  )

  type CombinedModules = typeof modules['actions']

  const defs = defineState(module1State)
  const customTypes = generateTypes`
    WOW
    COOL_DUDE
    SWEET
  `

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
    setAppApiCallFailed: expect.any(Function),
    setAppApiCallFetching: expect.any(Function),
    setAppApiCallLoaded: expect.any(Function),
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
    getAppApiCallFailed: expect.any(Function),
    getAppApiCallFetching: expect.any(Function),
    getAppApiCallLoaded: expect.any(Function),
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
    SET_APP_API_CALL: `SET_APP_API_CALL`,
    SET_APP_API_CALL_DATA: `SET_APP_API_CALL_DATA`,
    SET_APP_API_CALL_ERROR: `SET_APP_API_CALL_ERROR`,
    SET_APP_API_CALL_FAILED: `SET_APP_API_CALL_FAILED`,
    SET_APP_API_CALL_FETCHING: `SET_APP_API_CALL_FETCHING`,
    SET_APP_API_CALL_LOADED: `SET_APP_API_CALL_LOADED`,
    SET_APP_LIGHT_SWITCH: `SET_APP_LIGHT_SWITCH`,
    SET_APP_MEGA: `SET_APP_MEGA`,
    SET_APP_MEGA_NUM: `SET_APP_MEGA_NUM`,
    SET_APP_MEGA_STRING: `SET_APP_MEGA_STRING`,
    SET_APP_METADATA: `SET_APP_METADATA`,
    SET_APP_TODO: `SET_APP_TODO`,
    SET_APP_TODO_TODOS: `SET_APP_TODO_TODOS`,
    SET_WHOA_WOW: `SET_WHOA_WOW`,
    SET_APP_DEEPLY: `SET_APP_DEEPLY`,
    SET_APP_DEEPLY_NESTED: `SET_APP_DEEPLY_NESTED`,
    SET_APP_METADATA_IS_COOL: `SET_APP_METADATA_IS_COOL`,
  }

  describe(`createStore`, () => {
    const { types, reducers, actions, selectors, store, runSagas } = createStore({
      modules,
    })

    const sagaActionType = `sagaActionType`
    const sagaAction = createAction(sagaActionType)

    const sagas = generateSagas({
      every: {
        [sagaActionType]: function*() {
          yield put(actions.setAppApiCallData({ sagaWorkedOnEvery: true }))
          const apiCall = yield select(selectors.getAppApiCall)

          console.log({ apiCallSaga: apiCall })
        },
      },
      latest: {
        [sagaActionType]: function*() {
          yield put(actions.setAppApiCallData({ sagaWorkedOnLatest: true }))
        },
      },
      [sagaActionType]: function*() {
        yield put(actions.setAppApiCallData({ sagaWorked: true }))
      },
    })

    runSagas(combineSagas(...[combineSagas(...sagas)]))

    it(`should properly create types`, () => {
      expect(types).toMatchObject(storeTypes)
    })
    it(`should combine reducers`, () => {
      expect(reducers).toEqual(expect.any(Function))
    })
    it(`should generate actions from a set of reducer definitions`, () => {
      expect(actions).toMatchObject(storeActions)
    })

    it(`should generate selectors from an initial state object`, () => {
      expect(selectors).toMatchObject(storeSelectors)

      expect(selectors.getAppMegaNum(store.getState())).toEqual(2)
    })
    it(`should register actions created with sagas`, () => {
      expect(sagas.length).toEqual(3)

      store.dispatch(sagaAction())

      expect(selectors.getAppApiCallData(store.getState())).toEqual({
        sagaWorked: true,
        sagaWorkedOnEvery: true,
        sagaWorkedOnLatest: true,
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
      expect(() => {
        try{
          expect(utils.get(3, null, 9)).toThrowError()
        } catch(e) {
          return e
        }
      }).toBeTruthy()
    })

    it(`keyMirror`, () => {
      expect(utils.keyMirror([1])).toEqual({ "1" : 1 })
      expect(utils.keyMirror([`wow`, `bro`])).toEqual({ "wow": `wow`, "bro": `bro` })
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
    const { SET_WHOA_WOW, ...singleModTypes } = storeTypes

    it(`should generate reducers correctly`, () => {
      const expectedReducers = {
        lightSwitch: expect.any(Function),
        todo: expect.any(Function),
        mega: expect.any(Function),
        apiCall: expect.any(Function),
      }

      expect(generateReducersFromDefs(defs)).toMatchObject(
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
        types: storeTypes,
        actions: storeActions,
        reducers: expect.any(Function),
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
      const customTypesObjectKeys = [`WOW`, `COOL_DUDE`, `SWEET`]

      for (const val of customTypesObjectKeys) {
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

    const mappedActions = mapActions(`setWhoaWow`, `setAppTodo`, `setAppMetadata`, `setAppMetadataIsCool`, `resetAppMega`)(store.dispatch)

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

      store.dispatch(actions.setAppApiCallLoaded(true))

      expect(selectors.getAppApiCall(store.getState())).toEqual({ ...apiState, loaded: true })
    })
  })

})
