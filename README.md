# RDX

`yarn add @codeparticle/rdx`

This package exposes a simpler way of defining redux stores.

It weighs in at just under 4kb gzipped, and can easily knock more than that from your build size.

define your types, reducers, actions, and selectors like so:

```js
import { rdx } from "@codeparticle/rdx";

const createReduxModule = rdx({ prefix: "app" });

const { types, actions, selectors, reducers } = createReduxModule({
  bedroom: {
    lightSwitch: false,
    heatingStatus: {
      tooCold: false,
      tooWarm: false
    }
  },
  sibling: {
    todos: [
      {
        prank: {
          done: false
        }
      }
    ]
  }
});

export { types, actions, selectors, reducers };
```

each key's name is automatically cased to camelCase for actions, selectors and reducer keys, with CONSTANT_CASE for actions.

Running this will return a list of types that looks like this: `${ prefix }_SET_${ reducerName }_${ reducerKey }`.

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

## Helper functions and optional features

### redux-related

RDX ships the following redux-related helpers designed for incremental adoption.

```js
import {
  generateTypes,
  prefixTypes,
  generateActions,
  createAction,
  createReducer,
  generateSelectors,
  generateReducers,
  apiState
} from "@codeparticle/rdx";

const initialState = {
  wow: "big if true",
  apiCall: apiState // { loaded: false, fetching: false, failed: false, error: {}, data: {} }
};

const types = generateTypes`
    TYPE_1
    TYPE_2
    TYPE_3
`; // returns a key mirrored type object - { TYPE_1: 'TYPE_1' .. TYPE_3 }. can also be called like: generateTypes(['TYPE_1', 'TYPE_2', 'TYPE_3'])

const prefixed = prefixTypes("awesome")(types); // { AWESOME_TYPE_1, AWESOME_TYPE_2, AWESOME_TYPE_3 }

const actions = generateActions(types); // { setType1, setType2, setType3 }
const selectors = generateSelectors(initialState); // { getWow: state => state.wow ?? 'big if true' }
const myAction = createAction("wow"); // returns a function accepting a payload

const myReducer = createReducer(initialState, {
  [TYPE_1](state, action) {
    return { ...state, ...action.payload };
  }
  // etc
});
```

if you would like to generate reducers automatically, you can use

```ts
generateReducers(initialState);
```

which will create a reducer with the same initial state, but listen for these types:

```ts
SET_WOW;
SET_API_CALL;
RESET_API_CALL;
SET_API_CALL_FETCHING;
SET_API_CALL_LOADED;
SET_API_CALL_FAILED;
SET_API_CALL_ERROR;
SET_API_CALL_DATA;
```

and will crawl down one level if it's an object with nested keys.

### non-redux-related

RDX exports a few generic functions that can help in some situations.

```ts
import {
  filter,
  map,
  get, // just like lodash's
  getObjectPaths,
  isObject, // and not an array
  pipe
} from "@codeparticle/rdx"; // or, for build size, @codeparticle/rdx/utils

filter(Boolean)([false, true, 1]); // [true, 1]
map(x => x * 2)(2); // [2]
map(x => x * 2)([1, 2, 3]); // 2,4,6

const obj = { wow: { big: true } };
const allPaths = getObjectPaths(obj); // [['wow'], ['wow', 'big']]

get(obj, allPaths[0], "backupValue") === { big: true };
get(obj, ["what", "where", "not", "there"], "backupValue") === "backupValue";

isObject({}) === true;
isObject([]) === false;
isObject(3) === false; /// ...

pipe(map(triple), filter(isEven))([1, 2, 3]) === [6];
```

### Sagas helpers

There are a couple of helpers in place for use with redux sagas. **These are optional, and require you to have redux-saga as a dependency.**

`yarn add redux-saga`

```ts
import { generateSagas, combineSagas } from "@codeparticle/rdx/sagas";
import { generateTypes } from "@codeparticle/rdx";
import { actions } from "app-actions";
import { put } from "redux-saga/effects";

const customTypes = generateTypes([`WISH_HAPPY_TRAILS`]); // types generated from rdx({}) do not work, sagas need their own types.

const sagas = generateSagas({
  [customTypes.WISH_HAPPY_TRAILS]* () {
    yield put(actions.setHomePageMessage('Happy trails!'));
    // ...
  } // ...
});

const moduleSagas = combineSagas(sagas);

const customSagas = [saga1, saga2, ...].map(s => s())

const allAppSagas = combineSagas([...moduleSagas, ...customSagas, anotherModulesSagas]);
// ...

sagaMiddleware.run(allAppSagas);
```

you can choose between takeAll and takeEvery for sagas.

```ts
const sagas = generateSagas({
  // every, latest, both, or neither
  every: {
    [customTypes.WISH_HAPPY_TRAILS]: function*() {
      yield put(actions.setHomePageMessage("Happy trails!"));
      // ...
    } // ...
  },
  latest: {
    [otherType]: function*() {
      // ...
    }
  }
  // sagas below these two will default to takeLatest.
});
```
