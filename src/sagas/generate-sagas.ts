import { takeEvery, takeLatest } from "redux-saga/effects"
import { SagasObject, DefaultSagasObject } from '../types'

const createTakeEverySaga: (key: string, runSaga: any) => () => Generator = (key, runSaga) => function* () {
  yield takeEvery(key, runSaga)
}

const createTakeLatestSaga: (key: any, runSaga: any) => () => Generator = (key, runSaga) => function* () {
  yield takeLatest(key, runSaga)
}

const generateTakeEverySagas = (takeEverySagas: DefaultSagasObject): Generator[] => Object.entries(takeEverySagas).reduce((acc, [key, runSaga]) => {

  acc.push(createTakeEverySaga(key, runSaga)())

  return acc as Generator[]
}, [])

const generateTakeLatestSagas = (takeLatestSagas: DefaultSagasObject): Generator[] => Object.entries(takeLatestSagas).reduce((acc, [key, runSaga]) => {

  acc.push(createTakeLatestSaga(key, runSaga)())

  return acc as Generator[]
}, [])

////////////////////

const generateSagas = (sagas: SagasObject): Generator[] => {
  const { every, latest, ...otherSagas } = sagas
  const resultSagas: Generator[] = []

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

export {
  generateSagas,
  generateTakeEverySagas,
  generateTakeLatestSagas,
}
