/**
 * @file Unit tests for @codeparticle/rdx
 */

import { createStore, applyMiddleware } from 'redux'
import { createNames } from '../src/internal'
import { generateActions, generateActionsFromDefs } from '../src/core/generate-actions'
import { defineState } from '../src/core/generate-defs'
import { createAction } from '../src/core/create-action'
import { generateReducersFromDefs } from '../src/core/generate-reducers'
import { generateSelectors } from '../src/core/generate-selectors'
import { generateTypesFromDefs, generateTypes, prefixTypes } from '../src/core/generate-types'
import { rdx, apiState } from '../src/rdx'
import createSagaMiddleware from 'redux-saga'
import { put } from 'redux-saga/effects'
import { combineSagas, generateSagas } from '../src/sagas'

describe(`RDX`, () => {
  const prefix = `prefix`

  const objectUserDefs = {
    app: {
      lightSwitch: true,
      metadata: { isCool: false },
    },
    mega: {
      num: 2,
      string: ``,
    },
    todo: {
      todos: [],
    },
    apiCall: apiState,
  }

  const reduxModule = rdx(objectUserDefs, { prefix })
  const selectors = generateSelectors(objectUserDefs)
  const defs = defineState(objectUserDefs)
  const customTypes = generateTypes`
    WOW
    COOL_DUDE
    SWEET
  `
  const types = generateTypesFromDefs(defs)
  const prefixedTypes = prefixTypes(prefix)(types)
  const actions = generateActions(types)

  const expectedActions = {
    setApp: expect.any(Function),
    resetApp: expect.any(Function),
    setAppLightSwitch: expect.any(Function),
    setAppMetadata: expect.any(Function),
    setTodo: expect.any(Function),
    resetTodo: expect.any(Function),
    setTodoTodos: expect.any(Function),
    setMega: expect.any(Function),
    resetMega: expect.any(Function),
    setMegaString: expect.any(Function),
    setMegaNum: expect.any(Function),
    setApiCall: expect.any(Function),
    setApiCallLoaded: expect.any(Function),
    setApiCallFailed: expect.any(Function),
    setApiCallError: expect.any(Function),
    setApiCallData: expect.any(Function),
    setApiCallFetching: expect.any(Function),
    resetApiCall: expect.any(Function),
  }

  const expectedSelectors = {
    getApp: expect.any(Function),
    getAppLightSwitch: expect.any(Function),
    getAppMetadata: expect.any(Function),
    getTodo: expect.any(Function),
    getTodoTodos: expect.any(Function),
    getMega: expect.any(Function),
    getMegaString: expect.any(Function),
    getMegaNum: expect.any(Function),
    getApiCall: expect.any(Function),
    getApiCallLoaded: expect.any(Function),
    getApiCallFailed: expect.any(Function),
    getApiCallError: expect.any(Function),
    getApiCallData: expect.any(Function),
    getApiCallFetching: expect.any(Function),
  }

  const expectedReducers = {
    app: expect.any(Function),
    todo: expect.any(Function),
    mega: expect.any(Function),
    apiCall: expect.any(Function),
  }

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
    const customTypesObjectKeys = [
      `WOW`,
      `COOL_DUDE`,
      `SWEET`,
    ]

    for (const val of customTypesObjectKeys) {
      expect(Object.keys(customTypes).includes(val as string)).toBeTruthy()
    }

    expect(types).toEqual({
      SET_APP: `SET_APP`,
      RESET_APP: `RESET_APP`,
      SET_APP_LIGHT_SWITCH: `SET_APP_LIGHT_SWITCH`,
      SET_APP_METADATA: `SET_APP_METADATA`,
      SET_MEGA: `SET_MEGA`,
      RESET_MEGA: `RESET_MEGA`,
      SET_MEGA_NUM: `SET_MEGA_NUM`,
      SET_MEGA_STRING: `SET_MEGA_STRING`,
      SET_TODO: `SET_TODO`,
      RESET_TODO: `RESET_TODO`,
      SET_TODO_TODOS: `SET_TODO_TODOS`,
      RESET_API_CALL: `RESET_API_CALL`,
      SET_API_CALL: `SET_API_CALL`,
      SET_API_CALL_DATA: `SET_API_CALL_DATA`,
      SET_API_CALL_ERROR: `SET_API_CALL_ERROR`,
      SET_API_CALL_FETCHING: `SET_API_CALL_FETCHING`,
      SET_API_CALL_LOADED: `SET_API_CALL_LOADED`,
      SET_API_CALL_FAILED: `SET_API_CALL_FAILED`,
    })
  })

  it(`should accept a curried version of createAction`, () => {
    const expectedAction = {
      type: `type`,
      payload: true,
      id: `type`,
    }

    expect(createAction(`type`)(true)).toEqual(expectedAction)
  })

  it(`should generate actions with generateActions`, () => {
    expect(actions).toMatchObject(expectedActions)
  })

  it(`should generate actions from a set of reducer definitions`, () => {
    expect(generateActionsFromDefs(defs)).toMatchObject(expectedActions)
  })

  it(`should generate reducers from a set of reducer definitions`, () => {
    expect(generateReducersFromDefs(defs)).toMatchObject(expectedReducers)
  })

  it(`should generate selectors from an initial state object`, () => {
    expect(selectors).toMatchObject(expectedSelectors)

    expect(selectors[`getMegaNum`]({ ...objectUserDefs, mega: { num: undefined } })).toBe(2)
  })

  it(`should generate a redux module from a set of reducer definitions`, () => {
    expect(reduxModule).toMatchObject({
      reducers: expect.any(Function),
      types: prefixedTypes,
      actions: expectedActions,
      selectors: expectedSelectors,
    })
  })

  it(`actually works with redux`, () => {
    const { actions, selectors, reducers } = reduxModule
    const sagaActionType = `sagaActionType`

    const sagas = generateSagas({
      every: {
        [sagaActionType]: function*() {
          yield put(actions.setApiCallData({ sagaWorkedOnEvery: true }))
        },
      },
      latest: {
        [sagaActionType]: function*() {
          yield put(actions.setApiCallData({ sagaWorkedOnLatest: true }))
        },
      },
      [sagaActionType]: function*() {
        yield put(actions.setApiCallData({ sagaWorked: true }))
      },
    })

    const allSagas = combineSagas(sagas)
    const sagaMiddleware = createSagaMiddleware()
    const store = createStore(reducers, applyMiddleware(sagaMiddleware))

    sagaMiddleware.run(allSagas)

    const expectedState = objectUserDefs

    expect(store.getState()).toEqual(expectedState)

    store.dispatch(actions.setMegaNum(20))

    let state = store.getState()

    expect(state[`mega`][`num`]).toBe(20)

    expect(selectors.getMegaNum(state)).toBe(20)
    expect(selectors.getMega(state)).toEqual({ ...expectedState.mega, num: 20 })

    store.dispatch(actions.resetMega())

    state = store.getState()

    expect(selectors.getMegaNum(state)).toBe(2)
    expect(selectors.getMega(state)).toEqual({ ...expectedState.mega })

    expect(selectors.getApiCall(state)).toEqual(apiState)
    store.dispatch(actions.setApiCallLoaded(true))

    state = store.getState()

    expect(selectors.getApiCall(state)).toEqual({ ...apiState, loaded: true })

    expect(sagas.length).toBe(3)

    store.dispatch(createAction(sagaActionType)())

    expect(selectors.getApiCallData(store.getState())).toEqual({ sagaWorked: true, sagaWorkedOnEvery: true, sagaWorkedOnLatest: true })
  })
})
