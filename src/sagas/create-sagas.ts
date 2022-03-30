import type { Saga } from 'redux-saga'
import { takeEvery, takeLatest } from 'redux-saga/effects'

import type { DefaultSagasObject, SagasObject } from '../types'

const createTakeEverySaga: (key: string, runSaga: Saga) => Saga = (key, runSaga) =>
  function* () {
    yield takeEvery(key, runSaga)
  }

const createTakeLatestSaga: (key: any, runSaga: Saga) => Saga = (key, runSaga) =>
  function* () {
    yield takeLatest(key, runSaga)
  }

const createTakeEverySagas = (takeEverySagas: DefaultSagasObject): Saga[] =>
  Object.entries(takeEverySagas).reduce<Saga[]>((acc, [key, runSaga]) => {
    acc.push(createTakeEverySaga(key, runSaga))

    return acc
  }, [])

const createTakeLatestSagas = (takeLatestSagas: DefaultSagasObject): Saga[] =>
  Object.entries(takeLatestSagas).reduce<Saga[]>((acc, [key, runSaga]) => {
    acc.push(createTakeLatestSaga(key, runSaga))

    return acc
  }, [])

/// /////////////////

const createSagas = (sagas: SagasObject): Saga[] => {
  const { every, latest, ...otherSagas } = sagas
  const resultSagas: Saga[] = []

  if (every != null) {
    resultSagas.push(...createTakeEverySagas(every as DefaultSagasObject))
  }

  if (latest != null) {
    resultSagas.push(...createTakeLatestSagas(latest as DefaultSagasObject))
  }

  if (latest != null && every == null) {
    resultSagas.push(...createTakeEverySagas(otherSagas as DefaultSagasObject))
  } else {
    resultSagas.push(...createTakeLatestSagas(otherSagas as DefaultSagasObject))
  }

  return resultSagas
}

export { createSagas, createTakeEverySagas, createTakeLatestSagas }
