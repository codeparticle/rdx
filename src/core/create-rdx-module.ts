import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import { RDX_INTERNAL_PREFIXES } from '../internal/constants/library-prefixes'
import type { RdxModule, RdxModuleConfiguration } from '../types'
import { getObjectPaths, keyMirror } from '../utils'
import { createActions } from './create-actions'
import { createAutoReducer } from './create-reducers'
import { createSelectors } from './create-selectors'
import { createRdxActionTypesFromState } from './create-types'

function createRdxModule<Prefix extends string> (config: RdxModuleConfiguration<Prefix>): <State extends _Object>(userDefs: State) => RdxModule<State, Prefix>

function createRdxModule (config) {
  return (userDefs) => {
    const { prefix } = config
    const paths = getObjectPaths(userDefs)

    const types = keyMirror(createRdxActionTypesFromState(userDefs, paths, prefix))
    const actions = createActions(userDefs, paths, prefix)
    const reducers = createAutoReducer(userDefs, prefix)
    const selectors = createSelectors(userDefs, paths, prefix)

    const mod = {
      [RDX_INTERNAL_PREFIXES.RDX_MODULE_PREFIX]: prefix,
      types,
      actions,
      reducers,
      selectors,
      state: userDefs,
    }

    return mod
  }
}

const rdx = createRdxModule

export { createRdxModule, rdx }
