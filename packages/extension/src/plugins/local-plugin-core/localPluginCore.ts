import * as vscode from 'vscode'
import { diff } from 'html-preview-service'
import { LocalPlugin } from '../localPluginApi'
import { minimizeEdits } from '../../services/Commands-util/minimizeEdits/minimizeEdits'

export const localPluginCore: LocalPlugin = api => {
  api.vscode.workspace.onDidChangeTextDocument(event => {
    const relativePath = '/' + vscode.workspace.asRelativePath(event.document.uri)
    if (event.document.languageId !== 'html') {
      return
    }
    if (event.contentChanges.length === 0) {
      return
    }
    if (!api.stateMap[relativePath]) {
      return
    }
    const state = api.stateMap[relativePath]
    const minimizedEdits = minimizeEdits(state.previousText, event.contentChanges)
    const newText = event.document.getText()

    if (minimizedEdits.length === 0) {
      return
    }

    try {
      console.log('change')
      console.log(minimizedEdits)
      if (!state.previousDom) {
        // if previous dom was invalid and current dom is valid the browser must reload
        const parsingResult = state.parser.parse(newText)
        if (parsingResult.error) {
          // if current result also has an error we cannot update
          return
        }
        state.previousDom = state.parser.dom
        state.previousText = newText
        state.previousNodeMap = state.parser.nodeMap
        return api.webSocketServer.broadcastToRelativePath({
          relativePath,
          commands: [
            {
              command: 'reload',
              payload: {},
            },
          ],
        })
      }
      const oldNodeMap = state.previousNodeMap
      const { htmlDocument: nextDom } = state.parser.edit(newText, minimizedEdits)
      const newNodeMap = state.parser.nodeMap
      const diffs = diff(state.previousDom.children, nextDom.children, { oldNodeMap, newNodeMap })
      state.previousDom = nextDom
      state.previousText = newText
      state.previousNodeMap = newNodeMap
      api.webSocketServer.broadcastToRelativePath({
        relativePath,
        commands: diffs,
      })
      console.log('diffs')
      console.log(diffs)
    } catch (error) {
      console.error(error)
    }
  })
}
