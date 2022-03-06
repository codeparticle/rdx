import type { AutoPath } from 'ts-toolbelt/out/Function/AutoPath'
import type { Object as _Object } from 'ts-toolbelt/out/Object/Object'
import type { PathsOf } from '../types'
import { get, type PathOrBackup } from './get'

type SelectorWithSuggestions<State, Path extends string, BackupValue = null> = <P extends string = Path>(
  path: AutoPath<State, P>,
  backupValue?: BackupValue
) => (s: State) => PathOrBackup<State, P, BackupValue>

type StrictSelector<State extends _Object, Path extends string = PathsOf<State>, BackupValue = null> = <P extends string = Path>(
  path: P,
  backupValue?: BackupValue
) => (s: State) => PathOrBackup<State, P, BackupValue>
type LooseSelector<State extends _Object, Path extends string = string, BackupValue = null> = <P extends string = Path>(
  path: P,
  backupValue?: BackupValue
) => (s: State) => PathOrBackup<State, P, BackupValue>
type SelectorWithKnownPath<State extends _Object, Path extends PathsOf<State>, BackupValue = null> = (
  path: Path,
  backupValue?: BackupValue
) => (s: State) => PathOrBackup<State, Path, BackupValue>
type SelectorWithUnknownPath<State extends _Object, Path extends string = string, BackupValue = null> = (
  path: Path,
  backupValue?: BackupValue
) => (s: State) => PathOrBackup<State, Path, BackupValue>

function selector<State extends _Object, Path extends string, BackupValue = null> (
  path: AutoPath<State, Path>,
  backupValue?: BackupValue
): (s: State) => PathOrBackup<State, Path, BackupValue>
function selector<State extends _Object, Path extends string = PathsOf<State>, BackupValue = null> (
  path: Path,
  backupValue?: BackupValue
): (s: State) => PathOrBackup<State, Path, BackupValue>
function selector<State extends _Object, Path extends string = string, BackupValue = null> (
  path: Path,
  backupValue?: BackupValue
): (s: State) => PathOrBackup<State, Path, BackupValue>
function selector<State extends _Object, Path extends PathsOf<State>, BackupValue = null> (
  path: Path,
  backupValue?: BackupValue
): (s: State) => PathOrBackup<State, Path, BackupValue>
function selector<State extends _Object, Path extends string = string, BackupValue = null> (
  path: Path,
  backupValue?: BackupValue
): (s: State) => PathOrBackup<State, Path, BackupValue>

function selector (path, backupValue?) {
  return (state) => get(state, path, backupValue)
}

export {
  selector,
  type SelectorWithSuggestions,
  type StrictSelector,
  type LooseSelector,
  type SelectorWithKnownPath,
  type SelectorWithUnknownPath,
}
