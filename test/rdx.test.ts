/**
 * @file Unit tests for @codeparticle/formal
 */

import { createStore } from 'redux'
import {
  createAction,
  generateActions,
  generateActionsFromDefs,
  generateDefs,
  generateReducersFromDefs,
  generateSelectorsFromDefs,
  generateTypesFromDefs,
  prefixTypes,
  rdx
} from '../src/rdx/index'
import { charactersBetween, dropUntil, takeUntil } from '../src/rdx/internal'

describe(`String helpers`, () => {
  const stringCondition = char => char === `c`
  const arrCondition = str => str === `cool`

  it(`takeUntil`, () => {
    expect(takeUntil(stringCondition)(`aaaac`)).toBe(`aaaa`)
    expect(takeUntil(arrCondition)([`beans`, `dude`, `cool`])).toMatchObject([`beans`, `dude`])
  })

  it(`dropUntil`, () => {
    expect(dropUntil(stringCondition)(`aaaac`)).toBe(`c`)
    expect(dropUntil(arrCondition)([`beans`, `dude`, `cool`])).toMatchObject([`cool`])
  })

  it(`charactersBetween`, () => {
    expect(charactersBetween(`[`, `]`)(`   [wow] `)).toBe(`wow`)
  })
})

describe(`RDX`, () => {
  const prefix = `prefix`
  const userDefs = `
    [app]
    light switch | boolean | false
    metadata     | object  | { isCool: false }
    [todo]
    todos | array | []
    [mega]
    string | string | ''
    num     | number | 2
  `

  const createModule = rdx({ prefix })

  const defs = generateDefs(userDefs, { prefix })
  const types = generateTypesFromDefs(defs)
  const prefixedTypes = prefixTypes(prefix)(types)
  const actions = generateActions(types)
  const actionsFromDefs = generateActionsFromDefs(defs)
  const reducersFromDefs = generateReducersFromDefs(defs)
  const selectorsFromDefs = generateSelectorsFromDefs(defs)
  const reduxModule = createModule(userDefs)

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
    setMegaNum: expect.any(Function)
  }

  const expectedSelectors = {
    getApp: expect.any(Function),
    getAppLightSwitch: expect.any(Function),
    getAppMetadata: expect.any(Function),
    getTodo: expect.any(Function),
    getTodoTodos: expect.any(Function),
    getMega: expect.any(Function),
    getMegaString: expect.any(Function),
    getMegaNum: expect.any(Function)
  }

  const expectedReducers = {
    app: expect.any(Function),
    todo: expect.any(Function),
    mega: expect.any(Function)
  }
  // const prefixedTypes = prefixTypes('app')(types);
  // const prefixedActions = generateActions(prefixedTypes);

  it(`should create actions from a template string with createTypes`, () => {
    // expect(defs).toEqual(1);

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
      SET_TODO_TODOS: `SET_TODO_TODOS`
    })
  })

  it(`should accept a curried version of createAction`, () => {
    const expectedAction = {
      type: `type`,
      payload: true,
      id: `type`
    }

    expect(createAction(`type`)(true)).toMatchObject(expectedAction)
  })

  it(`should generate actions with generateActions`, () => {
    expect(actions).toMatchObject(expectedActions)
  })

  it(`should generate actions from a set of reducer definitions`, () => {
    expect(actionsFromDefs).toMatchObject(expectedActions)
  })

  it(`should generate reducers from a set of reducer definitions`, () => {
    expect(reducersFromDefs).toMatchObject(expectedReducers)
  })

  it(`should generate selectors from a set of reducer definitions`, () => {
    expect(selectorsFromDefs).toMatchObject(expectedSelectors)
  })

  it(`should generate a redux module from a set of reducer definitions`, () => {
    expect(reduxModule).toMatchObject({
      reducers: expect.any(Function),
      types: prefixedTypes,
      actions: expectedActions,
      selectors: expectedSelectors
    })
  })

  it(`actually works with redux`, () => {
    const { actions, selectors, reducers } = reduxModule

    const store = createStore(reducers)

    expect(store.getState()).toMatchObject({
      app: {
        lightSwitch: true,
        metadata: { isCool: false }
      },
      mega: {
        num: 2,
        string: ``
      },
      todo: {
        todos: []
      }
    })

    store.dispatch(actions.setMegaNum(20) as never)

    let state = store.getState()

    expect(state[`mega`][`num`]).toBe(20)

    expect(selectors.getMegaNum(state)).toBe(20)
    expect(selectors.getMega(state)).toBe(state.mega)

    store.dispatch(actions.resetMega() as never)

    state = store.getState()

    expect(selectors.getMegaNum(state)).toBe(2)
    expect(selectors.getMega(state)).toBe(state.mega)
  })
})
