import { EditorProxy } from 'html-preview-web/dist/local/localMain'
import * as CodeMirror from 'codemirror'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import emmet from '@emmetio/codemirror-plugin/dist/emmet-codemirror-plugin.es.js'

// @ts-ignore
emmet(CodeMirror.default)

const editor = CodeMirror.fromTextArea(document.querySelector('textarea'), {
  lineNumbers: true,
  mode: 'htmlmixed',
  extraKeys: {
    Tab: 'emmetExpandAbbreviation',
    Enter: 'emmetInsertLineBreak',
  },
  // @ts-ignore
  markTagPairs: true,
  // Requires `markTagPairs` to be enabled
  autoRenameTags: true,
})

const getText: EditorProxy['getText'] = () => editor.getValue()

const onDidChangeTextDocument: EditorProxy['onDidChangeTextDocument'] = (() => {
  const listeners: ((text: string) => void)[] = []
  editor.on('change', instance => {
    const text = instance.getValue()
    for (const listener of listeners) {
      listener(text)
    }
  })
  return (listener: (text: string) => void) => {
    listeners.push(listener)
  }
})()

export const editorProxy: EditorProxy = { getText, onDidChangeTextDocument }
