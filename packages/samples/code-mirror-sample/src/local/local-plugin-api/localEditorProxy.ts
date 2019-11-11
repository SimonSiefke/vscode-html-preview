import { EditorProxy } from 'html-preview-web/dist/local/localMain'
import * as CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
// @ts-ignore
import emmet from '@emmetio/codemirror-plugin/dist/emmet-codemirror-plugin.es.js'

// @ts-ignore
emmet(CodeMirror.default)

const editor = CodeMirror.fromTextArea(document.querySelector('textarea') as HTMLTextAreaElement, {
  lineNumbers: true,
  mode: 'htmlmixed',
  extraKeys: {
    Tab: 'emmetExpandAbbreviation',
    Enter: 'emmetInsertLineBreak',
  },
  // @ts-ignore
  markTagPairs: true,
  autoRenameTags: true,
})

const getSelections: EditorProxy['getSelections'] = () => {
  const text = editor.getValue()
  const lineLengths = text.split('\n').map(line => line.length)
  return editor.listSelections().map(({ anchor }) => {
    const start =
      lineLengths.slice(0, anchor.line + 1).reduce((total, current) => total + current, 0) +
      anchor.ch
    return [start, start]
  })
}

const getText: EditorProxy['getText'] = () => editor.getValue()

const onDidChangeSelection: EditorProxy['onDidChangeSelection'] = (() => {
  const listeners: (() => void)[] = []
  const handleSelection = () => {
    for (const listener of listeners) {
      listener()
    }
  }
  editor.on('cursorActivity', handleSelection)
  return <EditorProxy['onDidChangeSelection']>(listener => {
    listeners.push(listener)
  })
})()

const onDidChangeTextDocument: EditorProxy['onDidChangeTextDocument'] = (() => {
  const listeners: (() => void)[] = []
  editor.on('change', () => {
    for (const listener of listeners) {
      listener()
    }
  })
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
