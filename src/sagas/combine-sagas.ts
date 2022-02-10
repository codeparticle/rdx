import { Saga } from 'redux-saga'
import { all } from 'redux-saga/effects'

/// ///////////////////
// functions that make the main 2 below work properly

const generateCombineSagaErrorText = notSaga =>
  `Arguments provided to combineSagas must be sagas. Received ${notSaga} instead`

const checkGeneratorKeys = (maybeGen) => {
  if (typeof maybeGen !== `function`) {
    throw new Error(generateCombineSagaErrorText(maybeGen))
  }

  const testGen = maybeGen()

  if (
    typeof testGen[Symbol.iterator] === `function` &&
      typeof testGen.next === `function` &&
      typeof testGen.throw === `function`
  ) {
    // it's safe to assume the function is a generator function or a shim that behaves like a generator function
    return testGen
  }

  throw new Error(generateCombineSagaErrorText(testGen))
}

const combineSagas = (
  ...sagas: Array<Iterator<any>>
): Saga => {
  if (sagas.length === 1 && !Array.isArray(sagas[0])) {
    // if this is the case, this has probably already been combined. in any case, we don't need to wrap it in all()
    return () => checkGeneratorKeys(sagas[0])
  }

  const _sagas = (Array.isArray(sagas[0]) ? sagas[0] : sagas).flat(3)

  console.log(`========\n`, `_sagas`, _sagas, `\n========`)

  return function * () {
    yield all(_sagas.map(checkGeneratorKeys))
  }
}

export {
  combineSagas,
}
