/**
 * @file Unit tests for @codeparticle/rdx
 */

import { createStore } from 'redux'
import { createNames } from '../src/internal'
import { generateActions, generateActionsFromDefs } from '../src/generate-actions'
import { generateDefs } from '../src/generate-defs'
import { createAction } from '../src/create-action'
import { generateReducersFromDefs } from '../src/generate-reducers'
import { generateSelectors } from '../src/generate-selectors'
import { generateTypesFromDefs, generateTypes, prefixTypes } from '../src/generate-types'
import { rdx } from '../src/rdx'

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
  }

  const createModule = rdx({ prefix })
  const reduxModule = createModule(objectUserDefs)
  const selectors = generateSelectors(objectUserDefs)
  const defs = generateDefs(objectUserDefs, { prefix })
  const typesObject = generateTypes`
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
  }

  const expectedReducers = {
    app: expect.any(Function),
    todo: expect.any(Function),
    mega: expect.any(Function),
  }
  // const prefixedTypes = prefixTypes('app')(types);
  // const prefixedActions = generateActions(prefixedTypes);

  it(`should be able to generate reducer, type, action, and selector names from a string`, () => {
    expect(createNames(`any string`)).toMatchObject({
      typeName: `SET_ANY_STRING`,
      actionName: `setAnyString`,
      selectorName: `getAnyString`,
      reducerKey: `anyString`,
    })
  })
  it(`should create actions from a template string with createTypes`, () => {
    expect(typesObject).toMatchObject({
      WOW: `WOW`,
      COOL_DUDE: `COOL_DUDE`,
      SWEET: `SWEET`,
    })

    expect(types).toMatchObject({
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
    })
  })

  it(`should accept a curried version of createAction`, () => {
    const expectedAction = {
      type: `type`,
      payload: true,
      id: `type`,
    }

    expect(createAction(`type`)(true)).toMatchObject(expectedAction)
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
    const store = createStore(reducers)
    const expectedState = objectUserDefs

    expect(store.getState()).toMatchObject(expectedState)

    store.dispatch(actions.setMegaNum(20) as never)

    let state = store.getState()

    expect(state[`mega`][`num`]).toBe(20)

    expect(selectors.getMegaNum(state)).toBe(20)
    expect(selectors.getMega(state)).toMatchObject({ ...expectedState.mega, num: 20 })

    store.dispatch(actions.resetMega() as never)

    state = store.getState()

    expect(selectors.getMegaNum(state)).toBe(2)
    expect(selectors.getMega(state)).toMatchObject({ ...expectedState.mega })

  })
})
