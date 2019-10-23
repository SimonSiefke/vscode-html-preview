import * as vscode from 'vscode'
import { LocalPlugin } from '../localPluginApi'

export const localPluginHighlightSelection: LocalPlugin = async api => {
  api.vscode.window.onDidChangeTextEditorSelection(event => {
    console.log(event.selections)
    if (event.selections.length !== 1) {
      return
    }
    const relativePath = '/' + vscode.workspace.asRelativePath(event.textEditor.document.uri)

    const start = event.textEditor.document.offsetAt(event.selections[0].start)
    const end = event.textEditor.document.offsetAt(event.selections[0].end)

    const offset = start
    let previousValue
    let found: number
    const state = api.stateMap[relativePath]
    const parser = state.parser
    let parsedKey
    let previousParsedKey
    for (const [key, value] of Object.entries(parser.prefixSums) as any[]) {
      previousParsedKey = parsedKey
      parsedKey = parseInt(key, 10)
      // @debug
      if (!parser.nodeMap[value]) {
        console.error(`node ${value} doesn\'t exist`)
        api.webSocketServer.broadcastToRelativePath({
          relativePath,
          commands: [
            {
              command: 'error',
              payload: {
                message: `highlight error, node ${value} doesn\'t exist`,
              },
            },
          ],
        })
      }

      const isElementNode = state.parser.nodeMap[value].nodeType === 'ElementNode'

      if (parsedKey === offset && isElementNode) {
        found = value

        break
      }

      if (parsedKey > offset) {
        found = previousValue
        break
      }

      if (isElementNode) {
        previousValue = value
      }
    }

    if (!found) {
      found = previousValue
    }

    if (!found) {
      return
    }

    console.log('found')
    console.log(found)

    api.webSocketServer.broadcast({
      commands: [
        {
          command: 'highlightSelection',
          payload: {
            nodeId: found,
            selectionOffset: start - previousParsedKey,
            parsedKey,
            previousParsedKey,
            start,
            end,
            selectionLength: end - start,
          },
        },
      ],
    })
  })
}
