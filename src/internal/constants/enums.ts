/**
 * Exported as objects here as a limitation of the build system.
 */

import type { HandlerType } from '../../types'

export const HandlerTypes: HandlerType = {
  string: `string`,
  number: `number`,
  boolean: `boolean`,
  array: `array`,
  object: `object`,
  api: `api`,
  default: `default`,
}

export const RdxGeneratedPrefixes = {
  set: `@@rdx/set`,
  get: `@@rdx/get`,
  reset_: `@@rdx/reset_`,
  set_: `@@rdx/set_`,
  RESET: `@@rdx/RESET_`,
  SET: `@@rdx/SET_`,
} as const
