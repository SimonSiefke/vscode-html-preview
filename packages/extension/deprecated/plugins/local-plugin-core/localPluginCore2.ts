// import { parse2, diff2, updateOffsetMap, SuccessResult } from 'virtual-dom'
// import { LocalPlugin } from '../localPluginApi'
// import { measureStart, measureEnd } from './measure'
// import { minimizeEdits } from '../../services/Commands-util/minimizeEdits/minimizeEdits'
// import * as vscode from 'vscode'

// let offsetMap = Object.create(null)

// let id = 1

// let state: SuccessResult
// let previousText: string

// export const localPluginCore2: LocalPlugin = api => {
//   if (vscode.window.activeTextEditor) {
//     const source = vscode.window.activeTextEditor.document.getText()
//     const result = parse2(source, offset => {
//       const nextId = id++
//       offsetMap[offset] = nextId
//       return nextId
//     })
//     if (result.status === 'success') {
//       state = result
//     }
//     previousText = source
//   }
//   vscode.workspace.onDidChangeTextDocument(event => {
//     if (event.contentChanges.length === 0) {
//       return
//     }
//     const source = event.document.getText()

//     if (!state) {
//       const result = parse2(source, offset => {
//         const nextId = id++
//         offsetMap[offset] = nextId
//         return nextId
//       })
//       if (result.status === 'success') {
//         state = result
//       }
//       previousText = source
//       return
//     }
//     const minimizedEdits = minimizeEdits(previousText, event.contentChanges)
//     measureStart('diff')
//     offsetMap = updateOffsetMap(offsetMap, minimizedEdits)
//     let newOffsetMap = Object.create(null)
//     const result = parse2(source, (offset, tokenLength) => {
//       let nextId: number
//       nextId: if (offset in offsetMap) {
//         nextId = offsetMap[offset]
//       } else {
//         for (let i = offset + 1; i < offset + tokenLength; i++) {
//           if (i in offsetMap) {
//             nextId = offsetMap[i]
//             break nextId
//           }
//         }
//         nextId = id++
//       }
//       newOffsetMap[offset] = nextId
//       return nextId
//     })
//     if (result.status === 'invalid') {
//       return
//     }
//     offsetMap = newOffsetMap
//     const edits = diff2(state, result)
//     measureEnd('diff')
//     console.log(JSON.stringify(edits))
//     api.webSocketServer.broadcast(edits)
//   })
// }
