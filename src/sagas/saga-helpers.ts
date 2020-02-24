import { all, takeEvery, takeLatest } from "redux-saga/effects"
import { SagasObject, DefaultSagasObject } from '../types'

//////////////////////
// functions that make the main 2 below work properly
function * TestGenerator() {
  yield undefined
}

const generateCombineSagaErrorText = notSaga =>
  `Arguments provided to combineSagas must be generators or functions that return a generator. Received ${notSaga} instead`

const checkAndReturnGenerator = (s) => {
  if (s instanceof TestGenerator.constructor && typeof s === `function`) {
    return s()
  }

  if (
    typeof s[Symbol.iterator] == `function` &&
    typeof s[`next`] == `function` &&
    typeof s[`throw`] == `function`
  ) {
    // it's safe to assume the function is a generator function or a shim that behaves like a generator function
    return s
  }

  throw new Error(generateCombineSagaErrorText(s))
}

const generateTakeEverySagas = (takeEverySagas: DefaultSagasObject): Generator[] => Object.entries(takeEverySagas).reduce((acc, [key, runSaga]) => {
  const worker = function* () {
    yield takeEvery(key, runSaga)
  }

  return acc.concat(worker())
}, [])

const generateTakeLatestSagas = (takeLatestSagas: DefaultSagasObject): Generator[] => Object.entries(takeLatestSagas).reduce((acc, [key, runSaga]) => {
  const worker = function*() {
    yield takeLatest(key, runSaga)
  }

  return acc.concat(worker())
}, [])

////////////////////

const generateSagas = (sagas: SagasObject): Generator[] => {
  const { every, latest, ...otherSagas } = sagas
  const resultSagas = []

  if (every) {
    resultSagas.push(...generateTakeEverySagas(every as DefaultSagasObject))
  }

  if (latest) {
    resultSagas.push(...generateTakeLatestSagas(latest as DefaultSagasObject))
  }

  if (latest && !every) {
    resultSagas.push(...generateTakeEverySagas(otherSagas as DefaultSagasObject))
  } else {
    resultSagas.push(...generateTakeLatestSagas(otherSagas as DefaultSagasObject))
  }

  return resultSagas
}

const combineSagas = (
  ...sagas: (Generator | (() => Generator))[]
): (() => Generator) => {

  if (sagas.length === 1 && !Array.isArray(sagas[0])) {
    // if this is the case, this has probably already been combined. in any case, we don't need to wrap it in all()
    checkAndReturnGenerator(sagas[0])
  }

  return function*() {
    try {
      yield all(
        [].concat(Array.isArray(sagas[0]) ? sagas[0]: sagas)
          .flat()
          .map(checkAndReturnGenerator),
      )
    } catch (e) {
      const errorMessages = [
        `Error in root saga:`,
        e,
        ...(e?.stack ? [`Stack trace: `, e.stack] : []),
      ]

      console.error(...errorMessages)
    }
  }
}

export {
  generateSagas,
  combineSagas,
}