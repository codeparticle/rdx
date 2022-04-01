import type { Saga } from 'redux-saga'
import { takeEvery, takeLatest } from 'redux-saga/effects'

import type { DefaultSagasObject, SagasObject } from '../types'

const createTakeEverySaga: (key: string, sagaToRun: Saga) => Saga = (key, sagaToRun) =>
  function* () {
    yield takeEvery(key, sagaToRun)
  }

const createTakeLatestSaga: (key: any, sagaToRun: Saga) => Saga = (key, sagaToRun) =>
  function* () {
    yield takeLatest(key, sagaToRun)
  }

const createTakeEverySagas = (takeEverySagas: DefaultSagasObject): Saga[] =>
  Object.entries(takeEverySagas).reduce<Saga[]>((acc, [key, sagaToRun]) => {
    acc.push(createTakeEverySaga(key, sagaToRun))

    return acc
  }, [])

const createTakeLatestSagas = (takeLatestSagas: DefaultSagasObject): Saga[] =>
  Object.entries(takeLatestSagas).reduce<Saga[]>((acc, [key, sagaToRun]) => {
    acc.push(createTakeLatestSaga(key, sagaToRun))

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
