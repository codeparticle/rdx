import { O } from 'ts-toolbelt'
import type { RdxModule, RdxModuleConfiguration, RdxTypesObject, ReflectedStatePath } from '../types'
import { getObjectPaths, keyMirror } from '../utils'
import { generateActions } from './generate-actions'
import { generateReducers } from './generate-reducers'
import { generateSelectors } from './generate-selectors'
import { generateTypesFromStateObjectPaths } from './generate-types'

function createRdxModule<State extends O.Object, Prefix extends string> (config: RdxModuleConfiguration<Prefix>) {
  return (userDefs: State): RdxModule<State, Prefix> => {
    const { prefix } = config

    let paths: Array<ReflectedStatePath<State>> = []
    let types = {}
    let actions = {}
    let reducers = {}
    let selectors = {}

    paths = getObjectPaths<State>(userDefs)

    types = keyMirror<string>(generateTypesFromStateObjectPaths<State>(userDefs, paths, prefix)) as unknown as RdxTypesObject<Prefix>

    actions = generateActions<State, Prefix>(userDefs, paths, prefix)
    reducers = generateReducers(userDefs, paths, prefix)
    selectors = generateSelectors<State, Prefix>(userDefs, paths, prefix)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      [`@@rdx/prefix`]: prefix,
      types,
      actions,
      reducers,
      selectors,
      state: userDefs,
    } as RdxModule<State, Prefix>
  }
}

export { createRdxModule }
