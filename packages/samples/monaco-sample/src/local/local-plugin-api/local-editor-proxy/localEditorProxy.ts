import { EditorProxy } from 'html-preview-web/dist/local/localMain'
import { monacoEditor } from './monaco'

const getSelections: EditorProxy['getSelections'] = () => {
  const monacoSelections = monacoEditor.getSelections()
  if (!monacoSelections) {
    return []
  }
  const model = monacoEditor.getModel()
  if (!model) {
    return []
  }
  return monacoSelections.map(selection => [
    model.getOffsetAt(selection.getStartPosition()),
    model.getOffsetAt(selection.getEndPosition()),
  ])
}

const getText: EditorProxy['getText'] = () => monacoEditor.getValue()

const onDidChangeSelection: EditorProxy['onDidChangeSelection'] = (() => {
  const listeners: (() => void)[] = []
  monacoEditor.onDidChangeCursorSelection(() => {
    for (const listener of listeners) {
      listener()
    }
  })
  return <EditorProxy['onDidChangeSelection']>(listener => {
    listeners.push(listener)
  })
})()

const onDidChangeTextDocument: EditorProxy['onDidChangeTextDocument'] = (() => {
  const listeners: (() => void)[] = []
  const handleChange = () => {
    for (const listener of listeners) {
      listener()
    }
  }
  monacoEditor.onDidChangeModelContent(handleChange)
  return <EditorProxy['onDidChangeTextDocument']>(listener => {
    listeners.push(listener)
  })
})()

export const editorProxy: EditorProxy = {
  getSelections,
  getText,
  onDidChangeSelection,
  onDidChangeTextDocument,
}
