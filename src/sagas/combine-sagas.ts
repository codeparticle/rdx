import type { Saga } from 'redux-saga'
import { all } from 'redux-saga/effects'

const run = (x) => x()

// const createCombineSagaErrorText = (notSaga) =>
//   `Arguments provided to combineSagas must be sagas. Received ${notSaga} instead`

// const checkGeneratorKeys = (maybeGen) => {
//   let testGen = maybeGen

//   if (typeof testGen === `function`) {
//     testGen = testGen()
//   }

//   if (
//     typeof testGen[Symbol.iterator] === `function` &&
//     typeof testGen.next === `function` &&
//     typeof testGen.throw === `function`
//   ) {
//     // it's safe to assume the function is a generator function or a shim that behaves like a generator function
//     return testGen
//   }

//   throw new Error(createCombineSagaErrorText(testGen))
// }

const combineSagas = (...sagas: Array<Saga | Iterator<any>>): Saga => {
  const _sagas = (Array.isArray(sagas[0]) ? sagas[0] : sagas).flat().map(run)

  return function* () {
    yield all(_sagas)
  }
}

export { combineSagas }
