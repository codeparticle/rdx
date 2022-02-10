import { Saga } from "redux-saga"
import { takeEvery, takeLatest } from "redux-saga/effects"
import { SagasObject, DefaultSagasObject } from '../types'

const createTakeEverySaga: (key: string, runSaga: Saga) => Saga = (key, runSaga) => function * () {
  yield takeEvery(key, runSaga)
}

const createTakeLatestSaga: (key: any, runSaga: Saga) => Saga = (key, runSaga) => function * () {
  yield takeLatest(key, runSaga)
}

const generateTakeEverySagas = (takeEverySagas: DefaultSagasObject): Saga[] => Object.entries(takeEverySagas).reduce<Saga[]>((acc, [key, runSaga]) => {
  acc.push(createTakeEverySaga(key, runSaga))

  return acc
}, [])

const generateTakeLatestSagas = (takeLatestSagas: DefaultSagasObject): Saga[] => Object.entries(takeLatestSagas).reduce<Saga[]>((acc, [key, runSaga]) => {
  acc.push(createTakeLatestSaga(key, runSaga))

  return acc
}, [])

/// /////////////////

const generateSagas = (sagas: SagasObject): Saga[] => {
  const { every, latest, ...otherSagas } = sagas
  const resultSagas: Saga[] = []

  if (every != null) {
    resultSagas.push(...generateTakeEverySagas(every as DefaultSagasObject))
  }

  if (latest != null) {
    resultSagas.push(...generateTakeLatestSagas(latest as DefaultSagasObject))
  }

  if ((latest != null) && (every == null)) {
    resultSagas.push(...generateTakeEverySagas(otherSagas as DefaultSagasObject))
  } else {
    resultSagas.push(...generateTakeLatestSagas(otherSagas as DefaultSagasObject))
  }

  return resultSagas
}

export {
  generateSagas,
  generateTakeEverySagas,
  generateTakeLatestSagas,
}
