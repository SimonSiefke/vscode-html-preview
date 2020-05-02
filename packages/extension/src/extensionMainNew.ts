import * as vscode from 'vscode'
import { parse2, generateDom } from 'virtual-dom'
import * as http from 'http'

let dom: string

export const activate = (context: vscode.ExtensionContext) => {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('html-preview')
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      diagnosticCollection.clear()
    })
  )
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('htmlPreview.openPreview', textEditor => {
      const text = textEditor.document.getText()
      const result = parse2(
        text,
        (() => {
          let id = 0
          return () => id++
        })()
      )
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
      const dom = generateDom(result)
      console.log(dom)
      const server = http.createServer((request, response) => {
        if (request.url === '/') {
          response.statusCode = 200
          return response.end(dom)
        }
      })
      server.once('error', error => {
        // @ts-ignore
        if (error.code === 'EADDRINUSE') {
          server.close()
          vscode.window.showErrorMessage('Cannot open preview because port 3000 is blocked')
        }
      })
      server.listen(3000, () => {
        console.log('listening')
      })
      context.subscriptions.push({
        dispose: () => {
          server.removeAllListeners()
          server.close()
        },
      })
    })
  )
}
