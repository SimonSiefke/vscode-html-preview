import { EditorProxy } from 'html-preview-web/dist/local/localMain'

const $textarea = document.querySelector('textarea') as HTMLTextAreaElement

const getSelections: EditorProxy['getSelections'] = () => [
  [$textarea.selectionStart, $textarea.selectionEnd],
]

const getText: EditorProxy['getText'] = () => $textarea.value

const onDidChangeSelection: EditorProxy['onDidChangeSelection'] = (() => {
  const listeners: (() => void)[] = []
  const handleSelection = () => {
    if (document.activeElement !== $textarea) {
      return
    }
    for (const listener of listeners) {
      listener()
    }
  }
  document.addEventListener('selectionchange', handleSelection)
  $textarea.addEventListener('mouseup', handleSelection) // workaround for firefox
  $textarea.addEventListener('keyup', handleSelection) // workaround for firefox
  $textarea.addEventListener('input', handleSelection)
  return <EditorProxy['onDidChangeSelection']>(listener => {
    listeners.push(listener)
  })
})()

const onDidChangeTextDocument: EditorProxy['onDidChangeTextDocument'] = (() => {
  const listeners: (() => void)[] = []
  $textarea.addEventListener('input', () => {
    for (const listener of listeners) {
      listener()
    }
  })
  return <EditorProxy['onDidChangeSelection']>( (listener) => {
    listeners.push(listener)
  })
})()

export const editorProxy: EditorProxy = {
  getSelections,
  getText,
  onDidChangeSelection,
  onDidChangeTextDocument,
}
