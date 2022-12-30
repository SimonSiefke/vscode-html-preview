import * as http from 'http'
import * as querystring from 'querystring'
import send from 'send'
import * as url from 'url'
import {
  diff2,
  ErrorResult,
  generateDom,
  minimizeEdits,
  parse2,
  SuccessResult,
  updateOffsetMap,
} from 'virtual-dom'
import * as vscode from 'vscode'
import * as WebSocket from 'ws'
import { HTML_PREVIEW_JS, ERROR_HTML } from './htmlPreview'

let state: 'uninitialized' | 'starting-server' | 'started-server' = 'uninitialized'

interface Preview {
  readonly dispose: () => void
  readonly start: () => Promise<void>
  readonly update: (message: string) => void
}

let preview: Preview | undefined

export interface CachedValue<T extends SuccessResult | ErrorResult> {
  readonly lastSuccessResult: SuccessResult | undefined
  readonly result: T
  readonly id: number
  readonly offsetMap: { readonly [offset: number]: number }
  readonly generatedDom: string | undefined
  readonly previousText: string
  readonly hasInvalidRequest: boolean
}

const cachedValues: {
  [pathname: string]: CachedValue<SuccessResult | ErrorResult>
} = Object.create(null)

const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath

const fixPathName = (pathname: string) => {
  if (pathname === '/') {
    return '/index.html'
  }
  return pathname
}

const getPathFromDocument = (document: vscode.TextDocument) =>
  document.uri.fsPath.slice(workspaceFolder.length)

const findDocument = (relativePath: string) => {
  return vscode.workspace.textDocuments.find(
    document => getPathFromDocument(document) === relativePath
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
    let pathName = fixPathName(parsedUrl.pathname)
    if (parsedUrl.pathname === '/html-preview.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript' })
      return response.end(HTML_PREVIEW_JS)
    }
    if (pathName === '/result.json') {
      const query = querystring.parse(parsedUrl.query)
      pathName = fixPathName(query.pathname as string)
      if (pathName in cachedValues) {
        const { result } = cachedValues[pathName]
        response.writeHead(200, { 'Content-Type': 'text/json' })
        return response.end(JSON.stringify(result, null, 2))
      } else {
        console.log('400')
        response.writeHead(400)
        return response.end()
      }
    }
    if (pathName in cachedValues) {
      const { result, previousText } = cachedValues[pathName]
      if (result.status === 'invalid') {
        cachedValues[pathName] = {
          ...cachedValues[pathName],
          lastSuccessResult: undefined,
        }
        response.writeHead(200, { 'Content-Type': 'text/html' })
        return response.end(ERROR_HTML(previousText, result))
      } else {
        cachedValues[pathName] = {
          ...cachedValues[pathName],
          hasInvalidRequest: false,
        }
        response.writeHead(200, { 'Content-Type': 'text/html' })
        return response.end(generateDom(result))
      }
    } else {
      const document = findDocument(pathName)
      if (!document) {
        const stream = send(request, pathName, {
          root: workspaceFolder,
          cacheControl: false,
          etag: false,
          lastModified: false,
        })
        stream.pipe(response)
        return
      }
      switch (document.languageId) {
        case 'css': {
          response.writeHead(200, { 'Content-Type': 'text/css' })
          return response.end(document.getText())
        }
        case 'html': {
          let id = 0
          let offsetMap = Object.create(null)
          const previousText = document.getText()
          const result = parse2(previousText, offset => {
            const nextId = id++
            offsetMap[offset] = nextId
            return nextId
          })
          if (result.status === 'invalid') {
            cachedValues[pathName] = {
              id,
              offsetMap,
              previousText,
              result,
              generatedDom: undefined,
              lastSuccessResult: undefined,
              hasInvalidRequest: true,
            }
            response.writeHead(200, { 'Content-Type': 'text/html' })
            return response.end(ERROR_HTML(previousText, result))
          }
          const generatedDom = generateDom(result)
          cachedValues[pathName] = {
            id,
            offsetMap,
            result,
            generatedDom,
            previousText,
            lastSuccessResult: result,
            hasInvalidRequest: false,
          }
          response.writeHead(200, { 'Content-Type': 'text/html' })
          return response.end(generatedDom)
        }
        default: {
          response.writeHead(200)
          return response.end(document.getText())
        }
      }
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
    start: () => new Promise(resolve => server.listen(3000, () => resolve())),
    update: message => {
      for (const webSocket of webSocketServer.clients) {
        webSocket.send(message)
      }
    },
  }
}

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('htmlPreview.openPreview', async textEditor => {
      if (!preview) {
        preview = createPreview()
        await preview.start()
      }
      if (process.env.NODE_ENV !== 'test') {
        vscode.env.openExternal(
          vscode.Uri.parse(`http://localhost:3000${getPathFromDocument(textEditor.document)}`)
        )
      }
    })
  )
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.contentChanges.length === 0) {
        return
      }
      switch (event.document.languageId) {
        case 'css': {
          preview.update(JSON.stringify([{ command: 'updateCss', payload: {} }]))
          break
        }
        case 'html': {
          const pathname = event.document.uri.fsPath.slice(workspaceFolder.length)
          if (!(pathname in cachedValues)) {
            console.log(Object.keys(cachedValues))
            console.log(pathname)
            console.log('return')
            return
          }
          const { offsetMap, previousText, id, lastSuccessResult, hasInvalidRequest } =
            cachedValues[pathname]
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
              result: newResult,
              generatedDom: undefined,
              lastSuccessResult,
              hasInvalidRequest,
            }
            return
          }
          cachedValues[pathname] = {
            id: currentId,
            offsetMap: newOffsetMap,
            previousText: newText,
            result: newResult,
            generatedDom: undefined,
            lastSuccessResult: newResult,
            hasInvalidRequest,
          }
          if (hasInvalidRequest) {
            console.log('HAS INVALID')
            preview.update(JSON.stringify([{ command: 'reload', payload: {} }]))
            return
          }
          const edits = diff2(lastSuccessResult, newResult)
          console.log(JSON.stringify(edits, null, 2))
          preview.update(JSON.stringify(edits))
          break
        }
        default: {
          break
        }
      }
    })
  )
}
