import { bindActionCreators } from "redux"
import {
  ActionObject,
  PathsOf,
  RdxSelector,
  SelectionMapper,
  SelectorPath,
  SelectorsObject,
  RdxMappers,
  ActionMapper,
  ActionCreator,
} from "../types"
import type { Object as _Object } from "ts-toolbelt/out/Object/Object"
import { PathOrBackup, selector } from '../utils'

function getValidActions <Actions extends _Object> (actions: Actions, actionsRequested: Array<PathsOf<Actions, 0>>): {
  [key in keyof Actions]: ActionCreator
}
function getValidActions (actions, actionsRequested) {
  const validActions = {}

  if (!actionsRequested) return validActions

  const keys = actionsRequested
  let i = keys.length

  while (i--) {
    const key = keys[i]
    const existingAction = actions[key]

    if (!existingAction) {
      if (process.env.NODE_ENV !== `production`) {
        console.error(`no action found with name "${key}"`)
        throw new Error(`no action found with name "${key}"`)
      }
    } else {
      validActions[key] = function (...args) {
        return existingAction.apply(this, args)
      }
    }
  }

  return validActions
}

function getValidSelectors<State extends object> (selectors: SelectorsObject<State>, selectorsRequested: Record<string, SelectorPath<State>>): Record<string, RdxSelector<State>>
function getValidSelectors (selectors, selectorsRequested) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const validSelectors = {}

  if (!selectorsRequested) {
    return validSelectors
  }

  const selectorKeys = Object.keys(selectorsRequested)
  let i = selectorKeys.length

  while (i--) {
    const key = selectorKeys[i]
    const info = selectorsRequested[key]
    const selector = selectors[info]

    if (!selector) {
      console.error(`no selector found with info: ${info}`)
    } else {
      // eslint-disable-next-line
      // @ts-ignore
      validSelectors[key] = selector
    }
  }

  return validSelectors
}

function mapActions<State extends _Object, Actions extends ActionObject<State, ''>> (
  actions: Actions
): ReturnType<ActionMapper<State, Actions>>
function mapActions (actions) {
  return (dispatch) => (...actionsRequested) => bindActionCreators(
    getValidActions(
      actions,
      actionsRequested,
    ),
    dispatch,
  )
}

function mapState<State extends _Object> (selectors: SelectorsObject<State>): ReturnType<SelectionMapper<State>>
function mapState (selectors) {
  return (selectorsRequested) => {
    const validSelectors = getValidSelectors(
      selectors,
      selectorsRequested,
    )

    return (globalState) => {
      const mappedState = {}
      const keys = Object.keys(validSelectors)
      let i = keys.length

      while (i--) {
        const key = keys[i]
        const _selector = validSelectors[key]

        mappedState[key] = _selector(globalState)
      }

      return mappedState
    }
  }
}

function mapPaths<State extends _Object, Selectors extends Record<string, PathsOf<State>> = Record<string, PathsOf<State>>> (selectors: Selectors):
(state: State) => {
  [K in keyof Selectors]: PathOrBackup<State, Selectors[K], null>
}
function mapPaths (selectors) {
  return (state) => {
    const mappedState = {}
    const keys = Object.keys(selectors)
    let i = keys.length

    while (i--) {
      const key = keys[i]

      const _selector = selector(selectors[key])

      mappedState[key] = _selector(state)
    }

    return mappedState
  }
}

function createMappers<State extends _Object, CustomActions extends Record<string, ActionCreator> = Record<string, never>> (
  { actions, selectors }: { actions: ActionObject<State, '', CustomActions>; selectors: SelectorsObject<State> },
): RdxMappers<State, CustomActions> {
  return {
    mapActions: mapActions<State, ActionObject<State, '', CustomActions>>(actions),
    mapState: mapState<State>(selectors),
  }
}

export {
  mapActions,
  mapState,
  mapPaths,
  createMappers,
}
