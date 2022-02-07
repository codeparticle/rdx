import { RdxGeneratedPrefixes } from '../../types'

export const LIBRARY_PREFIXES_TO_TRIM = [
  RdxGeneratedPrefixes[`set_`],
  RdxGeneratedPrefixes[`reset_`],
]

export const enum RDX_INTERNAL_PREFIXES {
  RDX_TYPE_PREFIX = `@@rdx/`,
  RDX_MODULE_PREFIX = `@@rdx/prefix`
}
