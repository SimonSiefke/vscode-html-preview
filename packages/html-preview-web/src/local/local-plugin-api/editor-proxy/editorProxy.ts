import { Selection } from '../../../shared/selection'

export interface EditorProxy {
  readonly getSelections: () => readonly Selection[]
  readonly getText: () => string
  readonly onDidChangeSelection: (listener: () => void) => void
  readonly onDidChangeTextDocument: (listener: () => void) => void
}
