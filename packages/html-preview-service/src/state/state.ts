// import { Parser, createParser, ParsingResult, diff } from '@htmlpit/virtual-dom'
// import { genDom as genDomWithoutInjectedScript } from '../genDom/genDom'

// const genDomWithInjectedScript = (dom: any) => {
//   const bodyIndex = dom.lastIndexOf('</body')
//   const $script = '<script type="module" src="/html-preview.js"></script>'
//   if (bodyIndex !== -1) {
//     dom = dom.slice(0, bodyIndex) + $script + dom.slice(bodyIndex)
//   } else {
//     dom += $script
//   }
// }

// export const createStateApi = () => {
//   let parserMap: Map<string, { parser: Parser; previousParsingResult: ParsingResult }> = new Map()

//   return {
//     create: ({ fsPath, text }) => {
//       const parser = createParser()
//       const previousParsingResult = parser.parse(text)
//       parserMap.set(fsPath, {
//         parser,
//         previousParsingResult,
//       })
//     },
//     genDom: ({ fsPath, text }: { fsPath: string; text: string }) => {
//       const { parser } = parserMap.get(fsPath)
//       const domWithoutInjectedScript = genDomWithoutInjectedScript(text, parser.dom)
//       return genDomWithInjectedScript(domWithoutInjectedScript)
//     },
//     update: ({ fsPath, text, edits }: { fsPath: string; text: string; edits: any[] }) => {
//       const { parser, previousParsingResult } = parserMap.get(fsPath)
//       const oldNodeMap = api.parser.nodeMap
//       const nextParsingResult = parser.edit(text, edits)
//       if (nextParsingResult.error) {
//         // onUpdateError
//         return
//       }
//       const newNodeMap = parser.nodeMap
//       const diffs = diff(
//         previousParsingResult.htmlDocument.children,
//         nextParsingResult.htmlDocument.children,
//         { oldNodeMap, newNodeMap }
//       )
//       parserMap.set(fsPath, {
//         parser,
//         previousParsingResult: nextParsingResult,
//       })
//       // onUpdateSuccess
//       api.webSocketServer.broadcast({ fsPath, diffs, exclude: [] })
//     },
//     delete: (fsPath: string) => {
//       // @debug
//       if (!parserMap.has(fsPath)) {
//         console.error(`doesn't exist`)
//       }
//       parserMap.delete(fsPath)
//     },
//     dispose: () => {
//       //@debug
//       if (!parserMap) {
//         throw new Error('already disposed')
//       }
//       parserMap = undefined
//     },
//   }
// }
