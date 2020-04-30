import { parse2, diff2 } from 'virtual-dom'
import { LocalPlugin } from '../localPluginApi'
import { measureStart, measureEnd } from './measure'

let oldState

export const localPluginCore2: LocalPlugin = api => {
  api.vscode.workspace.onDidChangeTextDocument(event => {
    if (event.contentChanges.length === 0) {
      return
    }
    console.log('change')
    const source = event.document.getText()
    measureStart('update')
    const newState = parse2(source)
    measureEnd('update')
    if (newState.status === 'invalid') {
      return
    }
    newState.status
    // const diffs = diff2(oldState, newState)
    oldState = newState
    console.log(oldState)
  })
}
