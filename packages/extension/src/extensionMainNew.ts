import * as vscode from 'vscode'
import { parse2, generateDom, SuccessResult, updateOffsetMap, diff2 } from 'virtual-dom'
import * as http from 'http'
import { minimizeEdits } from './services/Commands-util/minimizeEdits/minimizeEdits'
import * as WebSocket from 'ws'

const HTML_PREVIEW_JS = `const nodeTypeMap = {
  1: 'ElementNode',
  3: 'TextNode',
  8: 'CommentNode',
}

const $nodeMap = Object.create(null)

const hydrate = (node, $node) => {
  if (node.nodeType !== nodeTypeMap[$node.nodeType]) {
    console.log(node)
    console.log($node)
    console.warn('hydration failed 1')
    return false
  }

  switch (node.nodeType) {
    case 'ElementNode': {
      if (node.tag !== $node.tagName.toLowerCase()) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 2')
        return false
      }

      if (node.id != $node.getAttribute('data-id')) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 3')
        return false
      }

      if (node.children.length !== $node.childNodes.length) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 4')
        return false
      }

      $node.removeAttribute('data-id')
      for (let i = 0; i < node.children.length; i++) {
        if (!hydrate(node.children[i], $node.childNodes[i])) {
          return false
        }
      }

      break
    }

    case 'TextNode': {
      if (node.text !== $node.textContent) {
        console.log(node)
        console.log($node)
        console.warn('hydration failed 5')
        return false
      }

      break
    }

    case 'CommentNode': {
      // TODO
      break
    }

    default:
      break
  }

  $nodeMap[node.id] = $node
  return true
}

;(async () => {
  const successResult = await fetch('http://localhost:3000/successResult.json').then(response =>
    response.json()
  )
  document.querySelector('[data-id="html-preview"]').remove()
  const html = successResult.nodes.find(
    node => node.nodeType === 'ElementNode' && node.tag === 'html'
  )
  const success = hydrate(html, document.documentElement)
  if (!success) {
    return
  }
  window.$nodeMap = $nodeMap
  const webSocket = new WebSocket('ws://localhost:3000')
  webSocket.onerror = console.error
  webSocket.onmessage = ({ data }) => {
    const messages = JSON.parse(data)
    for (const { command, payload } of messages) {
      switch (command) {
        case 'textReplace': {
          const $node = $nodeMap[payload.id]
          if (!$node || nodeTypeMap[$node.nodeType] !== 'TextNode') {
            console.log({ command, payload })
            console.warn('failed to update text node')
            return
          }
          $node.textContent = payload.text
          break
        }
        case 'elementInsert': {
          const $parent = $nodeMap[payload.parentId]
          if (!$parent || nodeTypeMap[$parent.nodeType] !== 'ElementNode') {
            console.log({ command, payload })
            console.warn('failed to insert node')
            return
          }
          let $node
          switch (payload.nodeType) {
            case 'ElementNode':
              $node = document.createElement(payload.tag)
              for (const [attributeName, attributeValue] of Object.entries(payload.attributes)) {
                $node.setAttribute(attributeName, attributeValue)
              }
              break
            case 'TextNode': {
              $node = document.createTextNode(payload.text)
              break
            }
            case 'CommentNode': {
              // TODO
              break
            }
            default: {
              break
            }
          }
          if(payload.index===0){
            $parent.prepend($node)
          } else {
            $parent.insertBefore($node, $parent.children[payload.index])
          }
          $nodeMap[payload.id] = $node
          break
        }
        case 'elementDelete': {
          const $node = $nodeMap[payload.id]
          if(!$node){
            console.log({ command, payload })
            console.warn('failed to insert node')
          }
          $node.parentNode.removeChild($node)
          delete $nodeMap[payload.id]
          break
        }
        default: {
          console.log({ command, payload })
          console.warn('unhandled message')
          break
        }
      }
    }
  }
})()

`

let state: 'uninitialized' | 'starting-server' | 'started-server' = 'uninitialized'

interface Preview {
  readonly dispose: () => void
  readonly start: () => void
  readonly update: (message: string) => void
}

let preview: Preview | undefined
let successResult: SuccessResult | undefined

const createPreview: (handler: {
  readonly '/': () => string
  readonly '/successResult.json': () => string
  readonly '/html-preview.js': () => string
}) => Preview = handler => {
  const server = http.createServer((request, response) => {
    switch (request.url) {
      case '/': {
        response.writeHead(200, { 'Content-Type': 'text/html' })
        return response.end(handler['/']())
      }
      case '/successResult.json': {
        response.writeHead(200, { 'Content-Type': 'text/json' })
        return response.end(handler['/successResult.json']())
      }
      case '/html-preview.js': {
        response.writeHead(200, { 'Content-Type': 'text/javascript' })
        return response.end(handler['/html-preview.js']())
      }
      default: {
        response.writeHead(404)
        return response.end()
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
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('html-preview')
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      diagnosticCollection.clear()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('htmlPreview.openPreview', async textEditor => {
      let id = 0
      let offsetMap = Object.create(null)
      let previousText = textEditor.document.getText()
      const result = parse2(previousText, offset => {
        const nextId = id++
        offsetMap[offset] = nextId
        return nextId
      })
      if (result.status === 'invalid') {
        diagnosticCollection.set(textEditor.document.uri, [
          {
            message: 'invalid html',
            range: new vscode.Range(
              textEditor.document.positionAt(result.index - 1),
              textEditor.document.positionAt(result.index)
            ),
            severity: vscode.DiagnosticSeverity.Error,
          },
        ])
        vscode.window.showErrorMessage('Cannot open preview because file contains invalid html')
        return
      }
      successResult = result
      switch (state) {
        case 'uninitialized': {
          preview = createPreview({
            '/': () => generateDom(successResult),
            '/successResult.json': () => JSON.stringify(successResult, null, 2),
            '/html-preview.js': () => HTML_PREVIEW_JS,
          })
          preview.start()
          break
        }
        case 'starting-server': {
          preview.dispose()
          preview = createPreview({
            '/': () => generateDom(successResult),
            '/successResult.json': () => JSON.stringify(successResult.nodes, null, 2),
            '/html-preview.js': () => HTML_PREVIEW_JS,
          })
          preview.start()
          break
        }
        case 'started-server': {
          preview.dispose()
          preview = createPreview({
            '/': () => generateDom(successResult),
            '/successResult.json': () => JSON.stringify(successResult.nodes, null, 2),
            '/html-preview.js': () => HTML_PREVIEW_JS,
          })
          preview.start()
        }
      }
      vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document !== textEditor.document || event.contentChanges.length === 0) {
          return
        }
        offsetMap = updateOffsetMap(offsetMap, minimizeEdits(previousText, event.contentChanges))
        let newOffsetMap = Object.create(null)
        const result = parse2(event.document.getText(), (offset, tokenLength) => {
          let nextId: number
          nextId: if (offset in offsetMap) {
            nextId = offsetMap[offset]
          } else {
            for (let i = offset + 1; i < offset + tokenLength; i++) {
              if (i in offsetMap) {
                nextId = offsetMap[i]
                break nextId
              }
            }
            nextId = id++
          }
          newOffsetMap[offset] = nextId
          return nextId
        })
        if (result.status === 'invalid') {
          return
        }
        console.log('before diff')
        const edits = diff2(successResult, result)
        console.log('after diff')
        console.log(JSON.stringify(edits, null, 2))
        successResult = result
        offsetMap = newOffsetMap
        preview.update(JSON.stringify(edits))
      })
    })
  )
}
