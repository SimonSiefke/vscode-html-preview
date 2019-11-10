export interface EditorProxy {
  readonly onDidChangeTextDocument: (listener: (text: string) => void) => void
  readonly getText: () => string
}
