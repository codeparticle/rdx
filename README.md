# RDX

`yarn add redux redux-saga redux-devtools-extension @codeparticle/rdx`

_The goal of RDX is to let you have predictable state management, with defining that state as the only requirement._

To get started, install the following dependencies:

`yarn add redux redux-saga redux-devtools-extension @codeparticle/rdx`

or

`npm i redux redux-saga redux-devtools-extension @codeparticle/rdx`

---

RDX is a modular, configurable set of tools for redux that can be used as a set of simple tools to help reduce your boilerplate or as a redux framework to take care of almost everything you need to

It is similar to [redux-box](https://github.com/anish000kumar/redux-box), but automatically creates actions, reducers, and selectors from state that you provide in any given module.

Under the hood, RDX uses redux, redux-devtools-extension, and redux-sagas. However, use of the latter two is optional and configurable. If you're not concerned about using dev tools or sagas, you can skip the overhead.

RDX is written in typescript, and in most cases, should also be able to maintain type safety for you without effort on your part.

RDX has a peer dependency on redux. You must install redux in addition to RDX.

## Sections

- [Similarities and differences from redux-box](#similarities-and-differences-from-redux-box)

- [RDX](#rdx)
  - [Sections](#sections)
  - [Similarities and differences from redux-box](#similarities-and-differences-from-redux-box)
  - [Modules](#modules)
    - [Creating a Module](#creating-a-module)
    - [What Modules Create For You](#what-modules-create-for-you)
      - [Types](#types)
      - [actions](#actions)
      - [Selectors](#selectors)
      - [Reducers](#reducers)
  - [Composing modules](#composing-modules)
  - [Setting up the store](#setting-up-the-store)
    - [Configuring the store](#configuring-the-store)
  - [Using Sagas](#using-sagas)
    - [createSagas](#createsagas)
    - [combineSagas](#combinesagas)
  - [Using mapState and mapActions](#using-mapstate-and-mapactions)
  - [Helper functions and optional features](#helper-functions-and-optional-features)
    - [redux-related](#redux-related)
      - [createReducer](#createReducer)
      - [API helpers](#api-helpers)
      - [Other util code examples](#other-util-code-examples)
      - [createReducers](#createreducers)
    - [non-redux-related](#non-redux-related)
  - [Usage with Typescript](#usage-with-typescript)

---

## Modules

A module is a section of your total state.

For performance, it should be ( at most ) two levels deep - though you can go deeper if you want. RDX will recursively create actions, selectors, and reducers for you.

You can use a module for a subapp, for example, or a component in that app.

By providing a prefix and the initial state of your module, you will get RDX to create reducers, selectors, actions, and types.

### Creating a Module

```ts
import { rdx } from "@codeparticle/rdx";

const bedroomState = {
  lightSwitch: "off",
  heatingStatus: {
    tooCold: false,
    tooWarm: false
  }
};

const bedroomModule = rdx({ prefix: "bedroom" })(bedroomState);

const {
  bedroom: {
    types,
    actions,
    selectors,
    reducers,
    state // === bedroomState
  }
} = bedroomModule;

export { bedroomModule };
```

### What Modules Create For You

#### Types

each key's name is automatically cased to camelCase for actions, selectors and reducer keys, with CONSTANT_CASE for actions.

Running this will return a list of types that looks like this: `${ prefix }_SET_${ reducerKey }_${ reducerKey }`.

Here's what `types`

```js
    {
      '@@rdx/SET_BEDROOM_LIGHT_SWITCH': 'SET_BEDROOM_LIGHT_SWITCH',
      '@@rdx/SET_BEDROOM_HEATING_STATUS': 'SET_BEDROOM_HEATING_STATUS',
      '@@rdx/SET_BEDROOM_HEATING_STATUS_TOO_COLD': 'SET_BEDROOM_HEATING_STATUS_TOO_COLD',
      '@@rdx/SET_BEDROOM_HEATING_STATUS_TOO_WARM': 'SET_BEDROOM_HEATING_STATUS_TOO_WARM',
      // for all keys, RDX will also provide automatic reset actions.
      '@@rdx/RESET_BEDROOM_LIGHT_SWITCH': 'RESET_BEDROOM_LIGHT_SWITCH',
      '@@rdx/RESET_BEDROOM_HEATING_STATUS': 'RESET_BEDROOM_HEATING_STATUS',
      // ...
    }
```

#### actions

For each path up to two levels deep, actions will be created for those paths and be of the form `set[PascalCasedPath]`.

The actions of the bedroom module look like this:

```js
{
  setBedroomLightSwitch: (payload, additionalKeys = {}, id = type) => ({
    id: 'SET_BEDROOM_LIGHT_SWITCH', // if you want custom IDs, they can be overwritten
    type: 'SET_BEDROOM_LIGHT_SWITCH',
    payload,
    ...additionalKeys // if you want to add meta tags, etc, they will be spread in
  })
  setBedroomHeatingStatus: (payload, additionalKeys = {}, id = type) => ({
    id: 'SET_BEDROOM_HEATING_STATUS',
    type: 'SET_BEDROOM_HEATING_STATUS',
    // this payload will overwrite keys only in bedroom.heatingStatus.
    // it will preserve any keys that are not included.
    // ex: setBedroomHeatingStatus({ tooCold: true })
    payload,
    ...additionalKeys
  })
  setBedroomHeatingStatusTooCold: (payload, additionalKeys = {}, id = type) => ({
    id: 'SET_BEDROOM_HEATING_STATUS_TOO_COLD',
    type: 'SET_BEDROOM_HEATING_STATUS_TOO_WARM',
    payload,
    ...additionalKeys
  })
  setBedroomHeatingStatusTooWarm: (payload, additionalKeys = {}, id = type) => ({
    id: 'SET_BEDROOM_HEATING_STATUS_TOO_WARM',
    type: 'SET_BEDROOM_HEATING_STATUS_TOO_WARM',
    payload,
    ...additionalKeys
  })
  resetBedroomHeatingStatus: () => ({
    id: 'RESET_BEDROOM_HEATING_STATUS',
    type: 'RESET_BEDROOM_HEATING_STATUS',
  }), // will reset bedroom heating status to what was defined in initial state
  resetBedroomLightSwitch: () => ({
    id: 'RESET_BEDROOM_LIGHT_SWITCH',
    type: 'RESET_BEDROOM_LIGHT_SWITCH',
  }), // will reset bedroom heating status to what was defined in initial state
}
```

#### Selectors

The selectors look like this:

Note: these selectors are not memoized, but can be factored into other libraries such as [reselect](https://github.com/reduxjs/reselect) that do that for you.

```js
{
  getBedroomLightSwitch: state => state.bedroom.lightSwitch || (initialState of state.bedroom.lightSwitch),
  // etc
  getBedroomHeatingStatus,
  getBedroomHeatingStatusTooCold,
  getBedroomHeatingStatusTooWarm,
}
```

For any object, selectors will walk down all possible paths and give you a function matching the form `get[PascalCasedPath]`.

RDX also exports a `selector` util that takes a path of your state and returns a selector function.

#### Reducers

RDX will return a group of reducers that looks like this:

```ts
{
  lightSwitch: [reducerFunction],
  heatingStatus: [reducerFunction],
}
```

The prefix supplied and the initial state will also be returned from the module.

## Composing modules

RDX has a utility function called `combineModules` that lets you combine as many modules as you would like.

Let's say that you want a second piece of state describing the kitchen.

```ts
const kitchenState = {
  kitchen: {
    empty: true
  }
};
const kitchenModule = rdx({ prefix: "kitchen" })(kitchenState);

export { kitchenModule };
```

Now you can combine the modules like so:

```ts
import { kitchenModule, bedroomModule, combineModules } from "@codeparticle/rdx";

const modules = combineModules(kitchenModule, bedroomModule);

export { modules };
```

which will give you this:

```ts
{
  types: {...bedroomTypes, ...kitchenTypes},
  actions: {...bedroomActions, ...kitchenActions},
  state: {
    bedroom: bedroomState,
    kitchen: kitchenState
  },
  selectors: combinedSelectors,

  // note: you need to call combineReducers here manually
  // if you aren't using RDX's createStore function.
  // this is done so that you can use RDX's
  // extendReducers function before feeding it all to the store,
  // after which createStore combines everything at the latest possible step.

  reducers: { bedroom: bedroomReducer, kitchen: kitchenReducer }
}
```

This is essentially the same as defining these modules all at once, with a couple of differences:

- reducers will go all the way down the tree structure, if you hit the two level limit before.
- the selectors will have two new methods, `getBedroom` and `getKitchen` that return you the entire state of that module.

This is the only way RDX can combine modules - you can not define modules within each other with `rdx`.

At this point, you will have a combined group of modules that allow you to export all of the contained types, actions, selectors, and reducers from one place.

But maybe you'd like RDX to handle creation of the store for you as well. That's described in the next section.

## Setting up the store

Using RDX to set up the store will provide you a store with devtools and redux-saga set up. Both are optional.

Note that `runSagas` needs to be called right after the store is created. This is to allow freedom in how you organize them. RDX will try to combine them for you, if you haven't already. There are helper functions supplied to help you save some keystrokes with that as well.

This example will also show you how to extend the types, actions, and reducers of RDX's modules before you create a store from them as well.

```ts
import {
  createStore,
  // available if you need them, ie for sagas, which can not use the types that RDX creates automatically.
  extendTypes,
  createTypes,
  createActions,
  prefixTypes,
  extendActions,
  createReducer,
  extendReducers
} from "@codeparticle/rdx";
import { modules as combinedModules } from "./modules";
import { sagas as allSagas } from "./sagas";


////////////////////////////////////////////////////////////////
/// optional extension of types, actions, and reducers (selectors take care of themselves)
const customTypes = createTypes`
  CUSTOM_TYPE_ONE
  CUSTOM_TYPE_TWO
`

const sagaTypes = prefixTypes('saga')(customTypes)

modules.types = extendTypes(
  modules.types,
  customTypes,
  sagaTypes
)
modules.actions = extendActions(
  modules.actions,
  customTypes,
  createActions(sagaTypes) // { customTypeOne, customTypeTwo }
)

const customReducer = createReducer(5, {
  [customTypes.CUSTOM_TYPE_ONE](state, action) {
    return action.payload
  }
})

// will be added as a state key called `custom` at the root level.
modules.reducers = extendReducers(reducers, { custom: customReducer })

////////////////////////////////////////////////////////////////

const {
  store,
  actions,
  types,
  reducers,
  runSagas,
  mapState,
  mapActions,
} = createStore({
  modules: combinedModules // must already by combined via combineModules.
});

runSagas(combinedSagas)

export {
  store,
  mapActions,
  mapState,
  ... // + any of the others, if you'd like.
}
```

### Configuring the store

There's an optional extra set of configs that you can add to the store.

here's the complete list:

```ts
{
  // the combined modules of your app.
  modules: combineModules(module1, module2);
  config?: {
    // supply these just as you would to applyMiddleware()
    middleware?: [...otherAppMiddlewareFunctions],
    devtools?: {
      // if you don't want devtools, you can disable it here.
      enabled: true | false, // process.env.NODE_ENV === 'development' etc. defaults to true.
      // if you want to keep it around, you can provide configs
      options: {...optionsThatGoStraightToDevtools}
    },
    sagas?: {
      // similarly, you can disable the overhead of redux-saga if you aren't using it.
      enabled: true | false, // defaults to true.
      options: {...optionsThatGoStraightToReduxSaga}
    },
    // optional function that you can provide to wrap reducers in your app for setups that require it
    // defaults to id
    wrapReducersWith?: x => x
  }

}
```

## Using Sagas

RDX exposes two helpers to help organize and combine sagas called `createSagas` and `combineSagas`.

### createSagas

`createSagas` takes a map of action names, and maps them to saga functions. it then outputs an array
of initialized generators that are ready to be supplied to `all` or to `combineSagas`.

created sagas can not use the types that are defined by RDX. to make things easier, RDX exports a `createTypes` function that's used like below.

```ts
import { createTypes, createSagas, combineSagas } from "@codeparticle/rdx";

import { actions } from "app-actions";
import { put } from "redux-saga/effects";

// types created from rdx({}) do not work, sagas need their own custom types.
// these must be separated by newline if provided as a template string.
const customTypes = createTypes`
WISH_HAPPY_TRAILS
CURSE_UNHAPPY_TRAILS
`;

const sagas = createSagas({
  [customTypes.WISH_HAPPY_TRAILS]: function*() {
    yield put(actions.setHomePageMessage("Happy trails!"));
    // ...
  } // ...
});
```

you can choose between takeAll and takeEvery for sagas created by `createSagas`.

```ts
const sagas = createSagas({
  // every, latest, both, or neither is fine.
  every: {
    [customTypes.WISH_HAPPY_TRAILS]: function*() {
      yield put(actions.setHomePageMessage("Happy trails!"));
      // ...
    } // ...
  },
  latest: {
    [customTypes.CURSE_UNHAPPY_TRAILS]: function*() {
      yield put(actions.setHomePageMessage("A plague upon your houses"));
    }
  }
  // sagas below these two will default to takeLatest.
  [otherType]: function*() {
    // ...
    // will default to takeLatest(otherType, thisSaga)
  }
});

export { sagas }
```

### combineSagas

`combineSagas` is used to put sagas together.

Sagas supplied to `combineSagas` will be wrapped something akin to the following:

```ts
function * () {
  try {
    yield all(sagas)
  } catch(e) {
    throw new Error(e)
  }
}
```

So that you don't have to write the boilerplate.

Custom sagas are fine - you do not need to supply them via `createSagas`.

In addition, `combineSagas` composes with itself

```ts
combineSagas(...sagas) === combineSagas(combineSagas(...sagas));
```

without wrapping everything in another generator, so you can use this to combine them on a per-module basis.

`runSagas` runs this by default, so you do not need to call `runSagas(combineSagas(sagas))`. All it needs is a list.

if you want to supply an array to `combineSagas`, you can - or you can supply them variadically. It will flatten the list of arguments that you provide and check to ensure that they're all generators.

## Using mapState and mapActions

To make it simpler to access actions and state, the following actions are provided.

`mapActions` takes your set of all actions, accepts a variadic list of strings that match names of actions that you need, and will supply a `mapDispatchToProps` function that returns them to you.

`mapState` does the same thing with selectors, but also allows you to provide custom names for each selector's `get`-prefixed name.

there is a third function that automatically binds both of these to your app's actions + selectors, called `createMappers`. It is called by default by RDX, but if you don't want to use these, you can turn that off in configs when creating a store, and they will not be created via `combineModules` automatically.

Here is a comparison using the `connect` function from react-redux.

```ts
import { mapActions, mapState, actions, selectors } from './store'

const mapDispatchToPropsClassic = dispatch => ({
  actionOne: (payload) => dispatch(actions.actionOne(payload)),
  actionTwo: (payload) => dispatch(actions.actionTwo(payload)),
})

const mapStateToPropsClassic = (state) => ({
  lightSwitch: selectors.getBedroomLightSwitch(state)
  heatingStatus: selectors.getBedroomHeatingStatus(state)
})

connect(mapDispatchToPropsClassic, mapStateToPropsClassic)

// or, using these,

const mapDispatchToProps = mapActions(
  'actionOne',
  'actionTwo'
)
const mapStateToProps = mapState({
  lightSwitch: 'getBedroomLightSwitch',
  heatingStatus: 'getBedroomHeatingStatus'
})

connect(mapDispatchToProps, mapStateToProps)
```

## Helper functions and optional features

RDX ships many different functions to help you adopt it piece by piece. Some of these functions are redux related,
giving shorthands to help you create or extend actions, types, and reducers. Some aren't redux related at all,
but may help you in more general cases of development.

### redux-related

RDX ships the following redux-related helpers designed for incremental adoption and extension.

```ts
import {
  // types related
  createTypes,
  prefixTypes,
  extendTypes,
  // action related
  createActions,
  extendActions,
  createAction,
  // reducer related
  createReducer,
  extendReducers,
  createReducers,
  replaceReducerHandler,
  replacePartialReducerState,
  spreadReducerHandler,
  // state related
  createSelectors,
  mapActions,
  mapState,
  createMappers,
  // API related
  apiState,
  createApiReducer
} from "@codeparticle/rdx";
```

#### createReducer

RDX ships a function called createReducer which is very similar to the one provided by [redux-toolkit](https://redux-toolkit.js.org/api/createReducer).

in addition, it provides a few default reducers to make defining reducers simpler. these are shown in the example below.

```ts
const myReducer = createReducer(initialState, {
  // (state=initialState, action) => { ...state, ...action.payload };
  [TYPE_1]: spreadReducerHandler,
  // (state=initialState, action) => action.payload
  [TYPE_2]: replaceReducerHandler,
  // (state=initialState, action) => isObject(state[key])
  // ? { ...initialState, [key]: {...initialState[key], ...action.payload }}
  // : {...initialState, [key]: action.payload }}
  [TYPE_3]: replacePartialReducerState({ key: `${keyOfInitialState}` })
  // or your own function
  [TYPE_X](state, action) {

      doSomethingTricky(state, action);

      return state;
  }
});
```

#### API helpers

RDX ships two helpers for API requests: `apiState` and `createApiReducer`.

`apiState` is an object with the following properties:

```ts
{
  dataLoaded: boolean, // defaults to false
  fetching: boolean, // defaults to false
  error: boolean | object, // defaults to null.
  data: object, // defaults to {}
}
```

If you use `apiState` in state that you give to RDX, it **must be a top-level key**.

`createApiReducer` is a a reducer function that uses this object as its initial state. It takes two arguments, one being an object with types to listen for ( all of these are required ):

```ts
{
  request: string,
  success: string,
  error: string,
  reset: string,
}
```

and another optional object where you can add new handlers in the same way that you would with `createReducer`.

```ts
{
  [typename]: (state, action) => modifiedState
}
```

```ts
import { createApiReducer } from "@codeparticle/rdx";


initialState = {
  apiReducer: apiState
}

const reducers = {
  apiReducer: createApiReducer(
  {
    // each of these keys below is a type that you provide.
    request: "api_request",
    success: "api_success",
    failure: "api_failure",
    reset: "api_reset",
  },
  // optionally, you can add other functions to reducers here the same way that you would with `createReducer`.
  // RDX does this automatically in order for you to have control over each individual piece of state in API reducers.
  {...}
);
}
```

without any custom functions, `reducers.apiReducer` breaks down to an equivalent of the following:

```ts
const apiState = {
  dataLoaded: false,
  fetching: false,
  error: null,
  data: {}
};

apiReducer = createReducer(apiState, {
  [`api_request`]: state => ({
    ...state,
    fetching: true,
    dataLoaded: false
  }),
  [`api_success`]: (state, action) => ({
    ...state,
    fetching: false,
    dataLoaded: true,
    error: null,
    data: action.payload ?? {}
  }),
  [`api_failure`]: (state, action) => ({
    ...state,
    fetching: false,
    dataLoaded: false,
    error: action.payload ?? null
  }),
  [`api_reset`]: () => apiState
});
```

when RDX creates the actions for these, they look like and should be called like this:

```ts
resetApiReducer();
setApiReducerRequest();
setApiReducerSuccess(responseData);
setApiReducerFailure(errorReturned);
```

#### Other util code examples

```ts
////////////////////////////////////////////////////////////////

const initialState = {
  wow: "big if true",
  apiCall: apiState // { loaded: false, fetching: false, failed: false, error: {}, data: {} }
};

////////////////////////////////////////////////////////////////

// must be separated by newline if provided as a template string.
// can also be called like: createTypes(['TYPE_1', 'TYPE_2', 'TYPE_3'])
const types = createTypes`
TYPE_1
TYPE_2
TYPE_3
`; // returns a key mirrored type object - { TYPE_1: 'TYPE_1' .. TYPE_3 }.

////////////////////////////////////////////////////////////////TYPE_1, AWESOME_TYPE_2, AWESOME_TYPE_3 }

const actions = createActions(types); // { type1, type2, type3 }

const prefixedActions = createActions(prefixedTypes); // { awesomeType1, awesomeType2, awesomeType3 }

////////////////////////////////////////////////////////////////

const selectors = createSelectors(initialState); // { getWow: state => state.wow ?? 'big if true' }

////////////////////////////////////////////////////////////////

const myAction = createAction("wow"); // returns a function accepting a payload as its first argument, additional keys as a second object argument, and an optional string id as a third

////////////////////////////////////////////////////////////////
```

#### createReducers

if you would like to create reducers automatically, you can use

```ts
createReducers(initialState);
```

which will create a reducer with the same initial state, but listen for these types:

```ts
SET_WOW;
SET_API_CALL;
RESET_API_CALL;
SET_API_CALL_REQUEST;
SET_APP_CALL_SUCCESS;
SET_APP_CALL_FAILURE;
SET_API_CALL_FETCHING;
SET_API_CALL_DATA_LOADED;
SET_API_CALL_ERROR;
SET_API_CALL_DATA;
```

and will crawl down one level if it's an object with nested keys.

### non-redux-related

RDX exports a few generic functions that can help in some situations.

```ts
import {
  id,
  filter,
  map,
  get, // like lodash's, but only supports objects.
  getObjectPaths,
  isObject, // and not an array
  pipe,
  keyMirror,
  valueOr
} from "@codeparticle/rdx"; // or, for build size, @codeparticle/rdx/utils

////////////////////////////////////////////////////////////////

id(2) === 2
id(x) === x

////////////////////////////////////////////////////////////////

filter(Boolean)([false, true, 1]); // [true, 1]

////////////////////////////////////////////////////////////////

map(x => x * 2)(2); // [2]
map(x => x * 2)([1, 2, 3]); // 2,4,6

////////////////////////////////////////////////////////////////

const obj = { wow: { big: true } };

const allPaths = getObjectPaths(obj); // [['wow'], ['wow', 'big']]

get(obj, allPaths[0], "backupValue") === { big: true };

get(obj, ["what", "where", "not", "there"], "backupValue") === "backupValue";

////////////////////////////////////////////////////////////////

isObject({}) === true;
isObject([]) === false;
isObject(3) === false; /// ...

////////////////////////////////////////////////////////////////

// note: these are not transducers - if you are doing a lot of transformations this way,
// every step will iterate over the list again.
pipe(
  map(triple),
  filter(isEven)
)([1, 2, 3]) === [6];

////////////////////////////////////////////////////////////////

keyMirror([1, 2, 'cool']) === {
  '1': '1',
  '2', '2',
  'cool': 'cool'
}

////////////////////////////////////////////////////////////////

valueOr(null, 2) === 2
valueOr(undefined, 2) === 2
valueOr(false, 2) === false
valueOr('anything that is not null or undefined', 2) === 'anything that is not null or undefined'
```

## Usage with Typescript

### To have typescript check state for you within RDX and allow editors to autocomplete from it, do the following

When you use `rdx`, give it the prefix as a literal type. It's a little bit cumbersome, but it's necessary to feed the type information downstream.

```ts
const createKitchenModule = rdx<'kitchen'>({
  prefix: 'kitchen',
})
```

When you supply it with a state object, it will infer the type.

```ts
createKitchenModule(kitchenModuleState) // type of kitchenState
```

When you use `combineModules`, you must supply it the shape of your state. Example:

```ts
import { bedroomModule, bedroomModuleState } from "./modules/bedroom";
import { kitchenModule, kitchenModuleState } from "./modules/kitchen";
import { combineModules } from "@codeparticle/rdx";

type AppState = {
  bedroom: typeof bedroomModuleState; // or the type / interface you defined for it
  kitchen: typeof kitchenModuleState; // or the type / interface you defined for it
};

const modules = combineModules<AppState>(bedroomModule, kitchenModule);
```

Say you have a module that contains api state. if you are using the API utils from @codeparticle/rdx, you can use the `apiRequestState` helper to create a module that has the api state.

```ts
type NamesResponseData = string[]
type NamesResponseError = { message: string }

const namesData = apiRequestState<NamesResponseData, NamesResponseError>()

const apiModule = rdx<'api'>({
  prefix: 'api',
})({
  names: namesData, // will be type safe.
});

```