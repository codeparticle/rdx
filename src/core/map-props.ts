import { bindActionCreators, Dispatch, DeepPartial } from "redux"
import { ActionMapper, SelectionMapper, RdxMappers, ActionCreator } from "../types"
import { isObject } from "../utils/is-object"
import { keyMirror } from '../utils/key-mirror'

const getValidActions = <A>(actions: A, actionsRequested) => {
  const validActions = {}

  if (!actionsRequested) return validActions

  const keys = Object.keys(actionsRequested)
  let i = keys.length

  while (i--) {
    const key = keys[i]
    const name = actionsRequested[key]
    const action = actions[name]

    if (!action) {
      console.error(`no action found with name ${name}`)
    } else {
      validActions[name] = action
    }
  }

  return validActions
}

const getValidSelectors = (selectors, selectorsRequested) => {
  const validSelectors = {}

  if (!selectorsRequested) return validSelectors

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

const mapActions = <A>(actions: A): ReturnType<ActionMapper<A>> => {
  return <B=A>(...actionsRequested) => {
    const validActions = getValidActions<A>(
      actions,
      keyMirror(actionsRequested) as Record<keyof B, keyof B>,
    ) as Record<keyof B, ActionCreator<any>>

    return (dispatch: Dispatch) =>
      bindActionCreators<Record<keyof B, ActionCreator<any>>, Record<keyof B, ActionCreator<any>>>(
        validActions,
        dispatch,
      )
  }
}

const mapState = <S>(selectors: S): ReturnType<SelectionMapper<S>> => {
  return <A=S>(...selectorsRequested) => {
    const validSelectors = getValidSelectors(
      selectors,
      isObject(selectorsRequested[0])
        ? selectorsRequested[0]
        : keyMirror(selectorsRequested) as Record<keyof A, keyof A>,
    ) as Record<keyof A, any>

    return <B=A>(globalState) => {
      const componentState = {}
      const keys = Object.keys(validSelectors)
      let i = keys.length

      while(i--) {
        const key = keys[i]
        const selector = validSelectors[key]

        componentState[key] = selector(globalState)
      }

      return componentState as Record<keyof B, DeepPartial<any>>
    }
  }}

function generateMappers<A, S>(
  { actions, selectors }: {actions: A; selectors: S},
): RdxMappers<A, S> {
  return {
    mapActions: mapActions<A>(actions),
    mapState: mapState<S>(selectors),
  }
}

export {
  mapActions,
  mapState,
  generateMappers,
}