import { bindActionCreators, Dispatch } from "redux"
import type {
  ActionMapper,
  ActionObject,
  Paths,
  RdxSelector,
  SelectionMapper,
  SelectorPath,
  SelectorsObject,
  RdxMappers,
  ActionCreator,
  ReflectedStatePath,
} from "../types"
import type { Object as _Object } from "ts-toolbelt/out/Object/Object"
import { Split, ValueOf } from "type-fest"
import { selector } from "./create-selectors"
import { O } from "ts-toolbelt"

const getValidActions = <Actions extends object>(actions: Actions, actionsRequested: Array<Paths<Actions, 0, '_'>>) => {
  const validActions = {}

  if (!actionsRequested) return validActions

  const keys = actionsRequested
  let i = keys.length

  while (i--) {
    const key = keys[i]
    const existingAction = actions[key as string]

    if (!existingAction) {
      if (process.env.NODE_ENV !== `production`) {
        console.error(`no action found with name "${key}"`)
      }
    } else {
      validActions[key as string] = function (...args) {
        return existingAction.apply(this, args)
      }
    }
  }

  return validActions as Record<Paths<Actions, 0, '_'>, ValueOf<Actions>>
}

function getValidSelectors<State extends object> (selectors: SelectorsObject<State>, selectorsRequested: Record<string, SelectorPath<State>>) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const validSelectors = {} as Record<string, RdxSelector<State>>

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
      validSelectors[key] = selector
    }
  }

  return validSelectors
}

function mapActions<State extends object, Actions extends ActionObject<State, ''>> (actions: Actions): ReturnType<ActionMapper<State, Actions>> {
  return (dispatch: Dispatch) => (...actionsRequested) => bindActionCreators(
    getValidActions<Actions>(
      actions,
      actionsRequested,
    ),
    dispatch,
  ) as unknown as Record<(typeof actionsRequested)[number], ActionCreator<any, any>>
}

function mapState<State extends object> (selectors: SelectorsObject<State>): ReturnType<SelectionMapper<State>> {
  return (selectorsRequested) => {
    const validSelectors = getValidSelectors<State>(
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

      return mappedState as Record<string, ReturnType<RdxSelector<State>>>
    }
  }
}

function mapPaths<State extends _Object, Selectors extends Record<string, ReflectedStatePath<State>> = Record<string, ReflectedStatePath<State>>> (selectors: Selectors):
(state: State) => Record<keyof Selectors, O.Path<State, Split<Selectors[keyof Selectors], '.'>>> {
  return (state: State) => {
    const mappedState = {}
    const keys = Object.keys(selectors)
    let i = keys.length

    while (i--) {
      const key = keys[i]

      const _selector = selector(selectors[key])

      mappedState[key] = _selector<State>(state)
    }

    return mappedState as Record<keyof Selectors, O.Path<State, Split<Selectors[keyof Selectors], '.'>>>
  }
}

function createMappers<State extends _Object> (
  { actions, selectors }: { actions: ActionObject<State, ''>; selectors: SelectorsObject<State> },
): RdxMappers<State, typeof actions> {
  return {
    mapActions: mapActions<State, typeof actions>(actions),
    mapState: mapState<State>(selectors),
  }
}

export {
  mapActions,
  mapState,
  mapPaths,
  createMappers,
}
