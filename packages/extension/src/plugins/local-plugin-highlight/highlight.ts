import { LocalPlugin } from '../localPluginApi'
import * as vscode from 'vscode'

export const highlight: LocalPlugin = api => {
  let highlightedId: number | undefined

  api.webSocketServer.onMessage((message: any) => {
    if (message.type === 'request' && message.command === 'highlight') {
      const { id } = message.payload
      // console.log('id', message.message.payload.id);
      // console.log(parser.prefixSums);
      for (const [key, value] of Object.entries(api.parser.prefixSums)) {
        if (value === id) {
          const parsedKey = parseInt(key, 10)
          vscode.window.activeTextEditor.selection = new vscode.Selection(
            vscode.window.activeTextEditor.document!.positionAt(parsedKey),
            vscode.window.activeTextEditor.document!.positionAt(parsedKey)
          )
        }
      }
    }
  })

  vscode.window.onDidChangeTextEditorSelection(event => {
    if (event.selections.length !== 1) {
      return
    }

    const selection = event.selections[0]
    const offset = vscode.window.activeTextEditor.document.offsetAt(selection.active)
    let previousValue
    let found
    for (const [key, value] of Object.entries(api.parser.prefixSums) as any[]) {
      const parsedKey = parseInt(key, 10)
      // @debug
      if (!api.parser.nodeMap[value]) {
        console.log(api.parser.prefixSums)
        console.error(`node ${value} doesn\'t exist`)
        api.webSocketServer.broadcast(
          [
            {
              command: 'error',
              payload: {
                message: `highlight error, node ${value} doesn\'t exist`,
              },
            },
          ],
          {}
        )
      }

      const isElementNode = api.parser.nodeMap[value].nodeType === 'ElementNode'

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

    if (highlightedId === found) {
      return
    }

    highlightedId = found

    api.webSocketServer.broadcast(
      [
        {
          command: 'highlight',
          payload: {
            id: found,
          },
        },
      ],
      {}
    )
  })
}
