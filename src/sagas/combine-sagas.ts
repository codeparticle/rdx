import { all } from "redux-saga/effects"

//////////////////////
// functions that make the main 2 below work properly

const generateCombineSagaErrorText = notSaga =>
  `Arguments provided to combineSagas must be generators or functions that return a generator. Received ${notSaga} instead`

const checkGeneratorKeys = (maybeGen: any): any => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const testGen = typeof maybeGen === `function` ? maybeGen() : maybeGen

  if (
    testGen &&
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    typeof testGen[Symbol.iterator] == `function` &&
    typeof testGen[`next`] == `function` &&
    typeof testGen[`throw`] == `function`
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  ) {
  // it's safe to assume the function is a generator function or a shim that behaves like a generator function
    return testGen
  }

  throw new Error(generateCombineSagaErrorText(testGen))
}

const combineSagas = (
  ...sagas: (Generator | (() => Generator))[]
): (() => Generator) => {

  if (sagas.length === 1 && !Array.isArray(sagas[0])) {
    // if this is the case, this has probably already been combined. in any case, we don't need to wrap it in all()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return () => checkGeneratorKeys(sagas[0])
  }

  return function*() {
    yield all(
      [].concat(Array.isArray(sagas[0]) ? sagas[0]: sagas)
        .flat()
        .map(checkGeneratorKeys),
    )
  }
}

export {
  combineSagas,
}
