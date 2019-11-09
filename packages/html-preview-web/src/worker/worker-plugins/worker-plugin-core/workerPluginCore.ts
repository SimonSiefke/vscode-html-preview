// import { WorkerPlugin } from '../workerPlugin'
// import { diff, createParser } from 'html-preview-service'
// import { createRequestType } from '../../../shared/requestType'

// interface Edit {
//   readonly rangeOffset: number
//   readonly rangeLength: number
//   readonly text: string
// }

// const requestTypeDocumentChanged = createRequestType<{ text: string; edits: Edit[] }, any>(
//   'html-preview/document-changed'
// )

// export const workerPluginCore: WorkerPlugin = api => {
//   // api.connectionProxy.onRequest()
//   // let previousDom
//   // let previousText
//   // let previousNodeMap
//   // const parser = createParser()
//   // const update = (newText, minimizedEdits) => {
//   //   const oldNodeMap = previousNodeMap
//   //   const { htmlDocument: nextDom } = parser.edit(newText, minimizedEdits)
//   //   const newNodeMap = parser.nodeMap
//   //   const diffs = diff(previousDom.children, nextDom!.children, { oldNodeMap, newNodeMap })
//   //   previousDom = nextDom
//   //   previousText = newText
//   //   previousNodeMap = newNodeMap
//   //   api.messageChannel.broadcastMessage(diffs)
//   // }
//   // api.editor.onDidChangeTextDocument(newText => {
//   //   if (!previousDom) {
//   //     const parsingResult = parser.parse(newText)
//   //     previousDom = parser.dom
//   //     previousText = newText
//   //     previousNodeMap = parser.nodeMap
//   //     return
//   //   }
//   //   const edits = [
//   //     {
//   //       rangeOffset: 0,
//   //       rangeLength: newText.length,
//   //       text: newText,
//   //     },
//   //   ]
//   //   const minimizedEdits = minimizeEdits(previousText, edits)
//   //   update(newText, minimizedEdits)
//   // })
//   // @ts-ignore
//   // update('<h1>hello world</h1>')
//   // setTimeout(() => {
//   //   update('<h1>hello world!</h1>', [
//   //     {
//   //       rangeOffset: 15,
//   //       rangeLength: 0,
//   //       text: '!',
//   //     },
//   //   ])
//   // }, 1000)
// }
