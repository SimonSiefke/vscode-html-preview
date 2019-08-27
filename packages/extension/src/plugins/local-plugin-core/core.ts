import { LocalPlugin } from '../localPluginApi'
import { minimizeEdits } from '../../services/Commands-util/minimizeEdits/minimizeEdits'
import { createParser, diff, HtmlDocument } from 'html-preview-service'
import * as vscode from 'vscode'

export const core: LocalPlugin = api => {
  let previousText =
    (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.getText()) || ''
  api.parser = createParser()
  const parsingResult = api.parser.parse(previousText)
  let previousDom: HtmlDocument
  if (!parsingResult.error) {
    previousDom = parsingResult.htmlDocument
  } else {
    previousDom = { children: [] }
  }

  api.vscode.window.onDidChangeActiveTextEditor(event => {
    if (event.document.languageId !== 'html') {
      return
    }

    previousText = event.document.getText()
    api.parser = createParser()
    const parsingResult = api.parser.parse(previousText)
    previousDom = parsingResult && parsingResult.htmlDocument
  })
  api.vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.languageId !== 'html') {
      return
    }

    if (event.contentChanges.length === 0) {
      return
    }

    const edits = minimizeEdits(previousText, event.contentChanges)
    console.log('min', edits)
    const newText = event.document.getText()

    if (edits.length === 0) {
      return
    }

    try {
      console.log('change')
      console.log(edits)
      const oldNodeMap = api.parser.nodeMap
      const { htmlDocument: nextDom } = api.parser.edit(newText, edits)
      const newNodeMap = api.parser.nodeMap
      const diffs = diff(previousDom.children, nextDom.children, { oldNodeMap, newNodeMap })
      previousDom = nextDom
      api.webSocketServer.broadcast(diffs, {})
      previousText = newText
      console.log('diffs')
      console.log(diffs)
    } catch (error) {
      console.error(error)
    }
  })
}
