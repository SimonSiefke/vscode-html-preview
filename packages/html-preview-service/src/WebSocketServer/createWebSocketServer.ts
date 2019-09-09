import * as WebSocket from 'ws'
import { HttpServer } from '../HttpServer/createHttpServerNew'
import { urlParsePathname, urlParseQuery, urlParseHtmlPathname } from '../url/url'
export interface WebSocketServer {
  /**
   * Send a list of commands to all connected clients.
   */
  readonly broadcast: ({ commands, skip }: { commands: object[]; skip?: WebSocket }) => void
  /**
   * Send a list of commands to all connected clients for a relative path.
   */
  readonly broadcastToRelativePath: ({
    commands,
    skip,
    relativePath,
  }: {
    commands: object[]
    skip?: WebSocket
    relativePath: string
  }) => void

  readonly onMessage: (fn: (message: object) => void) => void
  /**
   * Stop the websocket server. Also stops the underlying http server.
   */
  readonly stop: () => Promise<void>
}

const nextId = (() => {
  let id = 0
  return () => id++
})()

const pendingResults: any = {}

export function createWebSocketServer(httpServer: HttpServer): WebSocketServer {
  const webSocketServer = new WebSocket.Server({ server: httpServer.server })
  const webSocketMap: { [normalizedPath: string]: Set<WebSocket> } = {}

  webSocketServer.on('connection', (webSocket, request) => {
    console.log('conn')
    const query = urlParseQuery(request.url as string)
    const normalizedPath = urlParseHtmlPathname(query.originalUrl) as string
    console.log('normalized')
    console.log(normalizedPath)
    webSocketMap[normalizedPath] = webSocketMap[normalizedPath] || new Set()
    webSocketMap[normalizedPath].add(webSocket)
    webSocket.on('close', () => {
      webSocketMap[normalizedPath].delete(webSocket)
    })
    webSocket.on('message', data => {
      const message = JSON.parse(data.toString())
      onMessageListeners.forEach(fn => fn(message))
      // const {id} = JSON.parse(data.toString());
      // const {start} = pendingResults[id];
      // const end = Math.round(process.hrtime(start)[1] / 1000000);
      // if (end > 15) {
      // this.broadcast([
      // 	{command: 'error', payload: ` - performance violation: handler took ${end}ms`}
      // ]);
      // }

      // console.log(end);
      // console.log(end / 1000000);
      // console.log(id);
    })
  })
  const onMessageListeners: Array<(message: any) => void> = []
  const broadcast = ({ commands, skip, clients }) => {
    const id = nextId()
    const stringifiedMessage = JSON.stringify({ messages: commands, id, type: 'request' })
    for (const client of clients) {
      if (skip !== client && client.readyState === WebSocket.OPEN) {
        // if(relativePath!==undefined && )
        client.send(stringifiedMessage)
      }
    }
  }
  return {
    broadcastToRelativePath({ commands, skip, relativePath }) {
      console.log('relllll')
      console.log(relativePath)
      console.log(webSocketServer.clients)
      const clients = webSocketMap[relativePath]
      broadcast({ clients, commands, skip })
    },
    broadcast({ commands, skip }) {
      const clients = webSocketServer.clients
      broadcast({ commands, skip, clients })
    },
    onMessage: fn => {
      onMessageListeners.push(fn)
    },
    stop() {
      return new Promise((resolve, reject) => {
        webSocketServer.close(error => {
          if (error) {
            reject(error)
          }
          resolve()
        })
      })
    },
  }
}
