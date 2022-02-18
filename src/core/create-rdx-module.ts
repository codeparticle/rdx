import type { O } from 'ts-toolbelt'
import { RDX_INTERNAL_PREFIXES } from '../internal/constants/library-prefixes'
import type { RdxModule, RdxModuleConfiguration, RdxTypesObject } from '../types'
import { getObjectPaths, keyMirror } from '../utils'
import { createActions } from './create-actions'
import { createAutoReducer } from './create-reducers'
import { createSelectors } from './create-selectors'
import { createRdxActionTypesFromState } from './create-types'

function createRdxModule<Prefix extends string> (config: RdxModuleConfiguration<Prefix>) {
  return <State extends O.Object>(userDefs: State): RdxModule<State, Prefix> => {
    const { prefix } = config
    const paths = getObjectPaths<State>(userDefs)

    const types: RdxTypesObject<Prefix> = keyMirror(createRdxActionTypesFromState<State>(userDefs, paths, prefix))
    const actions = createActions<State, Prefix>(userDefs, paths, prefix)
    const reducers = createAutoReducer(userDefs, prefix)
    const selectors = createSelectors<State, Prefix>(userDefs, paths, prefix)

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const mod = {
      [RDX_INTERNAL_PREFIXES.RDX_MODULE_PREFIX]: prefix,
      types,
      actions,
      reducers,
      selectors,
      state: userDefs,
    }

    // @@ts-expect-error types object too stringent
    return mod as unknown as RdxModule<State, Prefix>
  }
}

const rdx = createRdxModule

export { createRdxModule, rdx }
