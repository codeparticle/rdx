import type { Saga } from 'redux-saga'
import { all } from 'redux-saga/effects'

/// ///////////////////
// functions that make the main 2 below work properly

const createCombineSagaErrorText = notSaga =>
  `Arguments provided to combineSagas must be sagas. Received ${notSaga} instead`

const checkGeneratorKeys = (maybeGen) => {
  let testGen = maybeGen

  if (typeof testGen === `function`) {
    testGen = testGen()
  }

  if (
    typeof testGen[Symbol.iterator] === `function` &&
      typeof testGen.next === `function` &&
      typeof testGen.throw === `function`
  ) {
    // it's safe to assume the function is a generator function or a shim that behaves like a generator function
    return testGen
  }

  throw new Error(createCombineSagaErrorText(testGen))
}

const combineSagas = (
  ...sagas: Array<Saga | Iterator<any>>
): Saga => {
  if (sagas.length === 1 && !Array.isArray(sagas[0])) {
    // if this is the case, this has probably already been combined. in any case, we don't need to wrap it in all()
    return (() => checkGeneratorKeys(sagas[0])) as Saga
  }

  const _sagas = (Array.isArray(sagas[0]) ? sagas[0] : sagas).flat(3)

  return function * () {
    yield all(_sagas.map(checkGeneratorKeys))
  }
}

export {
  combineSagas,
}
