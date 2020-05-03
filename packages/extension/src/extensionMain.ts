import * as http from 'http'
import {
  diff2,
  generateDom,
  parse2,
  SuccessResult,
  updateOffsetMap,
  ErrorResult,
} from 'virtual-dom'
import * as vscode from 'vscode'
import * as WebSocket from 'ws'
import { minimizeEdits } from './services/Commands-util/minimizeEdits/minimizeEdits'
import { HTML_PREVIEW_JS } from './htmlPreview'
import * as url from 'url'
import * as querystring from 'querystring'
import * as send from 'send'

let state: 'uninitialized' | 'starting-server' | 'started-server' = 'uninitialized'

interface Preview {
  readonly dispose: () => void
  readonly start: () => void
  readonly update: (message: string) => void
}

let preview: Preview | undefined
const cachedValues: {
  [pathname: string]: {
    readonly result: SuccessResult | ErrorResult
    readonly id: number
    readonly offsetMap: { readonly [offset: number]: number }
    readonly generatedDom: string | undefined
    readonly previousText: string
  }
} = Object.create(null)

const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath

const findDocument = (relativePath: string) => {
  return vscode.workspace.textDocuments.find(
    document => document.uri.fsPath.slice(workspaceFolder.length) === relativePath
  )
}

const createPreview: () => Preview = () => {
  const server = http.createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.statusCode = 405
      response.setHeader('Allow', 'GET, HEAD')
      response.setHeader('Content-Length', '0')
      response.end()
      return
    }
    const parsedUrl = url.parse(request.url)
    if (parsedUrl.pathname === '/html-preview.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript' })
      return response.end(HTML_PREVIEW_JS)
    }
    if (parsedUrl.pathname === '/result.json') {
      const query = querystring.parse(parsedUrl.query)
      const pathname = query.pathname as string
      if (pathname in cachedValues) {
        const { result } = cachedValues[pathname]
        response.writeHead(200, { 'Content-Type': 'text/json' })
        return response.end(JSON.stringify(result, null, 2))
      } else {
        response.writeHead(400)
        return response.end()
      }
    }
    if (parsedUrl.pathname in cachedValues) {
      const { result } = cachedValues[parsedUrl.pathname]
      if (result.status === 'invalid') {
        response.writeHead(400)
        return response.end()
      } else {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        return response.end(generateDom(result))
      }
    } else {
      const document = findDocument(parsedUrl.pathname)
      if (!document) {
        const stream = send(request, parsedUrl.pathname, {
          root: workspaceFolder,
          cacheControl: false,
          etag: false,
          lastModified: false,
        })
        stream.pipe(response)
        return
      }
      let id = 0
      let offsetMap = Object.create(null)
      const previousText = document.getText()
      const result = parse2(previousText, offset => {
        const nextId = id++
        offsetMap[offset] = nextId
        return nextId
      })
      // @ts-ignore TODO check if valid
      const generatedDom = generateDom(result)
      cachedValues[parsedUrl.pathname] = {
        id,
        offsetMap,
        result,
        generatedDom,
        previousText,
      }
      response.writeHead(200, { 'Content-Type': 'text/html' })
      return response.end(generatedDom)
    }
  })
  const webSocketServer = new WebSocket.Server({
    server,
  })
  server.once('error', error => {
    // @ts-ignore
    if (error.code === 'EADDRINUSE') {
      server.close()
      vscode.window.showErrorMessage('Cannot open preview because port 3000 is blocked')
    }
  })
  return {
    dispose: () => {
      server.removeAllListeners()
      server.close()
    },
    start: () => {
      server.listen(3000)
    },
    update: message => {
      for (const webSocket of webSocketServer.clients) {
        webSocket.send(message)
      }
    },
  }
}

export const activate = (context: vscode.ExtensionContext) => {
  console.log(vscode.workspace.textDocuments)
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('html-preview')
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      diagnosticCollection.clear()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('htmlPreview.openPreview', async () => {
      switch (state) {
        case 'uninitialized': {
          preview = createPreview()
          preview.start()
          break
        }
        case 'starting-server': {
          break
        }
        case 'started-server': {
          break
        }
      }
    })
  )
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.contentChanges.length === 0) {
        return
      }
      const pathname = event.document.uri.fsPath.slice(workspaceFolder.length)
      if (!(pathname in cachedValues)) {
        console.log(Object.keys(cachedValues))
        console.log(pathname)
        console.log('return')
        return
      }
      console.log('need to update')
      const { result, offsetMap, previousText, id } = cachedValues[pathname]
      const updatedOffsetMap = updateOffsetMap(
        offsetMap,
        minimizeEdits(previousText, event.contentChanges)
      )
      let newOffsetMap = Object.create(null)
      const newText = event.document.getText()
      let currentId = id
      const newResult = parse2(newText, (offset, tokenLength) => {
        let nextId: number
        nextId: if (offset in updatedOffsetMap) {
          nextId = updatedOffsetMap[offset]
        } else {
          for (let i = offset + 1; i < offset + tokenLength; i++) {
            if (i in updatedOffsetMap) {
              nextId = updatedOffsetMap[i]
              break nextId
            }
          }
          nextId = currentId++
        }
        newOffsetMap[offset] = nextId
        return nextId
      })
      if (newResult.status === 'invalid') {
        cachedValues[pathname] = {
          id,
          offsetMap: updatedOffsetMap,
          previousText: newText,
          result,
          generatedDom: undefined,
        }
        return
      }
      cachedValues[pathname] = {
        id: currentId,
        offsetMap: newOffsetMap,
        previousText: newText,
        result: newResult,
        generatedDom: undefined,
      }
      if (result.status === 'invalid') {
        // TODO initial preview was invalid
        return
      }
      const edits = diff2(result, newResult)
      console.log(JSON.stringify(edits, null, 2))
      preview.update(JSON.stringify(edits))
    })
  )
}
