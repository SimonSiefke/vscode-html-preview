import { LocalPlugin } from '../localPluginApi'
import * as vscode from 'vscode'
import { urlParseQuery, urlParseHtmlPathname } from 'html-preview-service'

interface HighlightState {
  highlightedId: number
}

export const localPluginHighlight: LocalPlugin = api => {
  const highlightStateMap: { [key: string]: HighlightState[] } = {}
  let highlightedId: number | undefined

  // rebroadcast highlight message from another client
  api.webSocketServer.onMessage((message: any) => {
    if (message.type === 'request' && message.command === 'highlight') {
      const { id } = message.payload
      // console.log('id', message.message.payload.id);
      // console.log(parser.prefixSums);
      return
      for (const [key, value] of Object.entries(api.stateMap)) {
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
  api.webSocketServer.onConnection((webSocket, request) => {
    const query = urlParseQuery(request.url as string)
    const relativePath = urlParseHtmlPathname(query.originalUrl) as string
    if (!highlightStateMap[relativePath]) {
      return
    }
    api.webSocketServer.broadcastToRelativePath({
      skip: w => w !== webSocket,
      relativePath,
      commands: [
        {
          command: 'highlight',
          payload: {
            id: highlightStateMap[relativePath][0].highlightedId,
          },
        },
      ],
    })
  })

  vscode.window.onDidChangeTextEditorSelection(event => {
    const relativePath = '/' + vscode.workspace.asRelativePath(event.textEditor.document.uri)
    if (event.textEditor.document.languageId !== 'html') {
      return
    }
    if (event.selections.length !== 1) {
      return
    }

    const selection = event.selections[0]
    const offset = vscode.window.activeTextEditor.document.offsetAt(selection.active)
    let previousValue
    let found: number
    const state = api.stateMap[relativePath]
    const parser = state.parser
    for (const [key, value] of Object.entries(parser.prefixSums) as any[]) {
      const parsedKey = parseInt(key, 10)
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

    if (highlightedId === found) {
      return
    }

    highlightedId = found
    highlightStateMap[relativePath] = highlightStateMap[relativePath] || []
    highlightStateMap[relativePath].unshift({ highlightedId })

    api.webSocketServer.broadcastToRelativePath({
      relativePath,
      commands: [
        {
          command: 'highlight',
          payload: {
            id: found,
          },
        },
      ],
    })
  })
}
