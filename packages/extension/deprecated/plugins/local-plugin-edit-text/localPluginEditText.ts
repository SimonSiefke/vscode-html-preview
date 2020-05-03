// import { LocalPlugin } from '../localPluginApi'

// import * as vscode from 'vscode'

// export const localPluginEditText: LocalPlugin = api => {
//   api.webSocketServer.onMessage('editText', async ({ payload, normalizedPath }) => {
//     console.log(payload)
//     console.log(normalizedPath)
//     console.log('edit text')
//     const textEditor = vscode.window.visibleTextEditors.find(visibleTextEditor =>
//       visibleTextEditor.document.uri.fsPath.endsWith(normalizedPath)
//     )
//     if (!textEditor) {
//       // TODO
//       return
//     }

//     console.log(textEditor.document.getText())
//     console.log()
//     let found: number
//     const prefixSums = api.stateMap[normalizedPath].parser.prefixSums
//     for (let [rawPrefixSum, id] of Object.entries(prefixSums)) {
//       const prefixSum = parseInt(rawPrefixSum, 10)
//       if (id === payload.id) {
//         found = prefixSum
//         break
//       }
//     }
//     console.log(found)
//     const document = textEditor.document
//     const startOffset = document.positionAt(found)
//     const endOffset = document.positionAt(found + payload.previousText.length)
//     const range = new vscode.Range(startOffset, endOffset)
//     const edit = new vscode.WorkspaceEdit()
//     console.log(payload)
//     edit.replace(document.uri, range, payload.text)
//     await vscode.workspace.applyEdit(edit)
//     // console.log(api.stateMap[])
//   })
// }
