## RDX

`yarn add @codeparticle/rdx`

This package exposes a new way of defining redux stores.

define your types, reducers, actions, and selectors like so:

```js
import { rdx } from '@codeparticle/rdx'

const createReduxModule = rdx({ prefix: 'app' })

createReduxModule`
    [bedroom]

    light switch | boolean | false
    heating status | object | { tooCold: false, tooWarm: false }

    [sibling]

    todos | array | [{ prank: { done: false } }]
  `
```

Anything in `[brackets]` is going to be the name of a generated reducer function. the values below it are going to be its keys.

each value has a name, a primitive type, and an initial state. if you don't want to add an initial state, a reasonable default will be used.

the types are recommended, but if you don't want to supply them, `null` will be used as an initial state instead.

each key's name is automatically cased to camelCase for actions, selectors and reducer keys, with CONSTANT_CASE for actions.

spaces, newlines, and indentation don't matter. if you prefer to write things in camelCase, go ahead. if you want to tab things out for clarity, that's fine.

Running this will return combined reducers whose initial state looks like this:

```js
{
    bedroom: {
        lightSwitch: false,
        heatingStatus: {
            tooCold: false,
            tooWarm: false
        }
    },
    sibling: {
        todos: [{
            prank: {
                done: false
            }
        }]
    }
}
```

A list of types that looks like this: `${ prefix }_SET_${ reducerName }_${ reducerKey }`.

```js
    {
        'APP_SET_BEDROOM': 'APP_SET_BEDROOM',
        'APP_RESET_BEDROOM': 'APP_RESET_BEDROOM',
        'APP_SET_BEDROOM_LIGHT_SWITCH': 'APP_SET_BEDROOM_LIGHT_SWITCH',
        'APP_SET_BEDROOM_HEATING_STATUS': 'APP_SET_HEATING_STATUS',

        'APP_SET_SIBLING': 'APP_SET_SIBLING',
        'APP_RESET_SIBLING': 'APP_RESET_SIBLING',
        'APP_SET_SIBLING_TODOS': 'APP_SET_SIBLING_TODOS',
    }
```

as well as a set of actions that looks like this:

```js
{
  // any keys from initial state that are included will overwrite the state of the reducer
  setBedroom: (payload) => ({
      id: 'APP_SET_BEDROOM',
      type: 'APP_SET_BEDROOM',
      payload
  }),
  // will reset everything in the reducer
  resetBedroom: () => ({
      id: 'APP_SET_BEDROOM',
      type: 'APP_SET_BEDROOM'
  }),
  // setBedroomLightSwitch(false) or setBedroomLightSwitch(true)
  setBedroomLightSwitch: (payload) => ({
    id: 'APP_SET_BEDROOM_LIGHT_SWITCH',
    type: 'APP_SET_BEDROOM_LIGHT_SWITCH',
    payload
  }),
  // this payload will overwrite keys only in bedroom.heatingStatus
  setBedroomHeatingStatus: (payload) => ({
      id: 'APP_SET_BEDROOM_HEATING_STATUS',
      type: 'APP_SET_BEDROOM_HEATING_STATUS',
      payload
  }),
  // etc.
  setSibling: (payload) => ({
      id: 'APP_SET_SIBLING',
      type: 'APP_SET_SIBLING',
      payload
  }),
  resetSibling: () => ({
      id: 'APP_RESET_SIBLING',
      type: 'APP_RESET_SIBLING'
  }),
  setSiblingTodos: (payload) => ({
      id: 'APP_SET_SIBLING_TODOS',
      type: 'APP_SET_SIBLING_TODOS',
      payload
  })
}
```

and selectors that look like this:

```js
{
  // gets the whole reducer's state
  getBedroom: state => state.bedroom || (initialState of state.bedroom)

  // gets just that key
  getBedroomLightSwitch: state => state.bedroom.lightSwitch || (initialState of state.bedroom.lightSwitch),
  // etc
  getBedroomHeatingStatus,
  // etc.
  getSibling,
  getSiblingTodos,

}
```

This project has a peer dependency of redux v4. While it hooks up its generated reducers, it intentionally does not configure the rest of the store for you
in order to be adopted incrementally.

if you don't want the whole thing, there are a couple of helper functions exposed:

```js
import {
  generateTypes,
  prefixTypes,
  generateActions,
  createAction,
  createReducer
} from '@codeparticle/rdx'

const types = generateTypes`
    TYPE_1
    TYPE_2
    TYPE_3
` // returns a type object

const prefixed = prefixTypes('awesome')(types) // { AWESOME_TYPE_1, AWESOME_TYPE_2, AWESOME_TYPE_3 }

const actions = generateActions(types) // { setType1, setType2, setType3 }

const myAction = createAction('wow') // returns a function accepting a payload

const myReducer = createReducer(initialState, {
  [TYPE_1](state, action) {
    return { ...state, ...action.payload }
  }
  // etc
})
```
