export interface EditorProxy {
  readonly onDidChangeTextDocument: (listener: (text: string) => void) => void
  readonly getText: () => string
}

export const createEditorProxy: () => EditorProxy = () => {
  const $textarea = document.querySelector('textarea') as HTMLTextAreaElement

  const getText: EditorProxy['getText'] = () => $textarea.value

  const onDidChangeTextDocument: EditorProxy['onDidChangeTextDocument'] = (() => {
    const listeners: ((text: string) => void)[] = []
    $textarea.addEventListener('input', event => {
      for (const listener of listeners) {
        listener($textarea.value)
      }
    })
    return (listener: (text: string) => void) => {
      listeners.push(listener)
    }
  })()

  return {
    getText,
    onDidChangeTextDocument,
  }
}
