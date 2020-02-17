import { all, takeEvery, takeLatest } from "redux-saga/effects"
import { SagasObject, DefaultSagasObject } from '../types'

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

const combineSagas = (sagas: Generator[]): (() => Generator) => function*() {
  try {
    yield all(sagas)
  } catch (e) {
    const errorMessages = [
      `Error in root saga:`,
      e,
      ...(e?.stack ? [`Stack trace: `, e.stack] : []),
    ]

    console.error(...errorMessages)
  }
}

export {
  generateSagas,
  combineSagas,
}