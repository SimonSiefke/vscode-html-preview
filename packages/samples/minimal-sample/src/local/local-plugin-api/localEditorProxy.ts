import { EditorProxy } from 'html-preview-web'

const $textarea = document.querySelector('textarea') as HTMLTextAreaElement

const getText: EditorProxy['getText'] = () => $textarea.value

const onDidChangeTextDocument: EditorProxy['onDidChangeTextDocument'] = (() => {
  const listeners: ((text: string) => void)[] = []
  $textarea.addEventListener('input', () => {
    for (const listener of listeners) {
      listener($textarea.value)
    }
  })
  return (listener: (text: string) => void) => {
    listeners.push(listener)
  }
})()

export const editorProxy: EditorProxy = {
  getText,
  onDidChangeTextDocument,
}
