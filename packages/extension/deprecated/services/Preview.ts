// import * as vscode from 'vscode'
// import { parse as parseUrl } from 'url'
// import * as fs from 'fs'
// import * as path from 'path'
// import { config } from '../config'
// import { genDom } from 'html-preview-service/dist/genDom/genDom'
// import { Parser, createParser } from 'html-preview-service/dist/createParser/createParser'
// import { urlParsePathname, urlParseHtmlPathname, urlParseQuery } from 'html-preview-service-node'
// import {
//   HttpServer,
//   WebSocketServer,
//   createWebSocketServer,
//   createHttpServer,
// } from 'html-preview-service-node'
// // import { localPluginCore } from '../plugins/local-plugin-core/localPluginCore'
// import { localPluginRedirect } from '../plugins/local-plugin-redirect/localPluginRedirect'
// import { localPluginHighlight } from '../plugins/local-plugin-highlight/localPluginHighlight'
// import * as http from 'http'
// import { LocalPlugin } from '../plugins/localPluginApi'
// import { open } from '../open/open'
// import * as assert from 'assert'
// import { localPluginEditText } from '../plugins/local-plugin-edit-text/localPluginEditText'
// import { localPluginHighlightSelection } from '../plugins/local-plugin-highlight-selection/localPluginHighlightSelection'
// import { localPluginCore2 } from '../plugins/local-plugin-core/localPluginCore2'

// export const invariant = (message: string, value: any) => assert.ok(value, message)

// interface State {
//   parser: Parser
//   previousText?: string
//   previousDom?: any
//   previousNodeMap?: any
// }
// export interface PreviewApi {
//   vscode: {
//     window: {
//       // onDidChangeActiveTextEditor: (listener: (event: vscode.TextEditor) => void) => void
//       onDidChangeTextEditorSelection: (
//         listener: (event: vscode.TextEditorSelectionChangeEvent) => void
//       ) => void
//     }
//     workspace: {
//       onDidChangeTextDocument: typeof vscode.workspace.onDidChangeTextDocument
//       onDidSaveTextDocument: typeof vscode.workspace.onDidSaveTextDocument
//       createFileSystemWatcher: (
//         globPattern: vscode.GlobPattern,
//         ignoreCreateEvents?: boolean,
//         ignoreChangeEvents?: boolean,
//         ignoreDeleteEvents?: boolean
//       ) => vscode.FileSystemWatcher
//     }
//   }
//   stateMap: {
//     [key: string]: State
//   }
//   webSocketServer: WebSocketServer | undefined
//   httpServer: HttpServer | undefined
// }

// // TODO put these 4 lines into html preview service, it has nothing special todo with vscode
// const packagesRoot = path.join(config.root, 'packages')
// const htmlPreviewJs = fs.readFileSync(path.join(packagesRoot, 'injected-code/dist/html-preview.js'))
// const htmlPreviewJsMap = fs.readFileSync(
//   path.join(packagesRoot, 'injected-code/dist/html-preview.js.map')
// )

// const httpMiddlewareSendCss = (api: PreviewApi) => async (
//   req: http.IncomingMessage,
//   res: http.ServerResponse,
//   next: any
// ) => {
//   const url = parseUrl(req.url, true)
//   url.query.name
//   if (!url.pathname.endsWith('.css')) {
//     return next()
//   }

//   const matchingTextEditor = vscode.window.visibleTextEditors.find(
//     textEditor => vscode.workspace.asRelativePath(textEditor.document.uri) === url.pathname.slice(1)
//   )
//   if (matchingTextEditor) {
//     const css = matchingTextEditor.document.getText()
//     res.writeHead(200, { 'Content-Type': 'text/css' })
//     res.write(css)
//     res.end()
//     return
//   }

//   try {
//     const diskPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, url.pathname)
//     const uri = vscode.Uri.file(diskPath)
//     const css = (await vscode.workspace.fs.readFile(uri)).toString()
//     res.writeHead(200, { 'Content-Type': 'text/css' })
//     res.write(css)
//   } catch (error) {
//     res.statusCode = 404
//     res.write('Not Found')
//     res.setHeader('Content-Type', 'text/plain')
//   } finally {
//     res.end()
//   }
// }

// const httpMiddlewareSendHtml = (api: PreviewApi) => async (
//   req: http.IncomingMessage,
//   res: http.ServerResponse,
//   next: any
// ) => {
//   const pathname = urlParseHtmlPathname(req.url as string)
//   if (!pathname) {
//     return next()
//   }

//   const matchingTextEditor = vscode.window.visibleTextEditors.find(
//     textEditor => vscode.workspace.asRelativePath(textEditor.document.uri) === pathname.slice(1)
//   )
//   const sendHtml = (text: string) => {
//     const state: State = { parser: createParser() }
//     api.stateMap[pathname] = state
//     const parsingResult = api.stateMap[pathname].parser.parse(text)
//     if (parsingResult.error) {
//       console.error('initial error')
//       state.previousText = text
//     } else {
//       state.previousDom = parsingResult.htmlDocument
//       state.previousText = text
//       state.previousNodeMap = state.parser.nodeMap
//     }
//     let { gen } = genDom(text, state.parser)
//     const bodyIndex = gen.lastIndexOf('</body')
//     const $script = '<script type="module" src="http://localhost:3000/html-preview.js"></script>'

//     if (bodyIndex !== -1) {
//       gen = gen.slice(0, bodyIndex) + $script + gen.slice(bodyIndex)
//     } else {
//       gen += $script
//     }
//     res.writeHead(200, { 'Content-Type': 'text/html' })
//     res.write(gen)
//     res.end()
//   }

//   if (matchingTextEditor) {
//     const text = matchingTextEditor.document.getText()
//     return sendHtml(text)
//   }

//   // TODO add cache with parser and urls
//   const diskPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, pathname)
//   const uri = vscode.Uri.file(diskPath)
//   try {
//     const text = (await vscode.workspace.fs.readFile(uri)).toString()
//     return sendHtml(text)
//   } catch (error) {
//     res.statusCode = 404
//     res.setHeader('Content-Type', 'text/plain')
//     res.write('Not Found')
//     res.end()
//   }
// }

// const httpMiddlewareSendInjectedCode = (api: PreviewApi) => (
//   req: http.IncomingMessage,
//   res: http.ServerResponse,
//   next: any
// ) => {
//   const pathname = urlParsePathname(req.url as string)
//   if (pathname === '/virtual-dom.json') {
//     const originalPathname = urlParseHtmlPathname(urlParseQuery(req.url as string).originalUrl)
//     res.writeHead(200, { 'Content-Type': 'text/json' })
//     try {
//       const dom = api.stateMap[originalPathname].previousDom
//       if (dom === undefined) {
//         res.write(JSON.stringify('invalid'))
//         return res.end()
//       }
//       // const virtualDom = JSON.stringify(dom.children, getCircularReplacer())
//       res.write(virtualDom)
//       return res.end()
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   if (pathname === '/html-preview.js') {
//     res.writeHead(200, { 'Content-Type': 'text/javascript' })
//     return res.end(htmlPreviewJs)
//   }

//   if (pathname === '/html-preview.js.map') {
//     res.writeHead(200)
//     return res.end(htmlPreviewJsMap)
//   }
//   next()
// }

// const startServer = async (api: PreviewApi): Promise<void> => {
//   api.httpServer = createHttpServer()
//   api.httpServer.use(httpMiddlewareSendHtml(api))
//   api.httpServer.use(httpMiddlewareSendInjectedCode(api))
//   api.httpServer.use(httpMiddlewareSendCss(api))
//   try {
//     await api.httpServer.start({
//       injectedCode: '<script type="module" src="http://localhost:3000/html-preview.js"></script>',
//       directory: vscode.workspace.workspaceFolders[0].uri.fsPath,
//       port: 3000,
//     })
//   } catch (error) {
//     vscode.window.showErrorMessage('failed to start preview server')
//     throw error
//   }

//   api.webSocketServer = createWebSocketServer(api.httpServer)

//   // CSS live edit
//   api.vscode.workspace.onDidChangeTextDocument(event => {
//     if (event.document.languageId !== 'css') {
//       return
//     }

//     if (event.contentChanges.length === 0) {
//       return
//     }

//     // api.webSocketServer.broadcast({
//     //   commands: [
//     //     {
//     //       command: 'updateCss',
//     //       payload: {},
//     //     },
//     //   ],
//     // })
//   })
//   // this might be useful later when using sass
//   // const fileSystemWatcher = api.vscode.workspace.createFileSystemWatcher(
//   // 	new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], '**/*.*')
//   // );
//   // fileSystemWatcher.onDidChange(event => {
//   // 	if (event.fsPath.endsWith('.html')) {
//   // 		return;
//   // 	}

//   // 	if (event.fsPath.endsWith('.css')) {
//   // 		api.webSocketServer.broadcast([
//   // 			{
//   // 				command: 'update-css',
//   // 				payload: {}
//   // 			}
//   // 		]);
//   // 	}
//   // });
// }

// const doDispose = async (api: PreviewApi): Promise<void> => {
//   // api.webSocketServer.broadcast({
//   //   commands: [
//   //     {
//   //       command: 'connectionClosed',
//   //       payload: {},
//   //     },
//   //   ],
//   // })
//   await api.webSocketServer.stop()
//   await api.httpServer.stop()
//   api.httpServer = undefined
//   api.webSocketServer = undefined
// }

// const plugins: LocalPlugin[] = []
// // plugins.push(localPluginCore)
// plugins.push(localPluginCore2)
// if (process.env.NODE_ENV !== 'test') {
//   plugins.push(localPluginRedirect)
// }

// plugins.push(localPluginEditText)

// if (
//   vscode.workspace.getConfiguration().get('htmlPreview.highlight') &&
//   process.env.NODE_ENV !== 'test'
// ) {
//   plugins.push(localPluginHighlight)
// }

// // plugins.push(localPluginHighlightSelection)

// export const Preview = (() => {
//   let previewState: 'opening' | 'open' | 'closing' | 'closed' = 'closed'
//   let closingPromise: Promise<void> | undefined
//   let openingPromise: Promise<void> | undefined
//   const previewApi: PreviewApi = {
//     vscode: {
//       window: {
//         // onDidChangeActiveTextEditor: vscode.window.onDidChangeActiveTextEditor,
//         onDidChangeTextEditorSelection: vscode.window.onDidChangeTextEditorSelection,
//       },
//       workspace: {
//         onDidChangeTextDocument: vscode.workspace.onDidChangeTextDocument,
//         onDidSaveTextDocument: vscode.workspace.onDidSaveTextDocument,
//         createFileSystemWatcher: vscode.workspace.createFileSystemWatcher,
//       },
//     },
//     stateMap: {},
//     httpServer: undefined,
//     webSocketServer: undefined,
//   }
//   return {
//     get state() {
//       return previewState
//     },
//     async open(uri?: vscode.Uri) {
//       console.log('open')
//       if (previewState === 'opening') {
//         return
//       }

//       if (previewState === 'closing') {
//         await closingPromise
//       }

//       if (previewState === 'open') {
//         await open({ uri })
//         await openingPromise
//         openingPromise = undefined
//         return
//       }

//       previewState = 'opening'
//       try {
//         openingPromise = new Promise(async (resolve, reject) => {
//           try {
//             console.log('start server')
//             await startServer(previewApi)
//             console.log('started server')
//             // await open({ uri })
//             console.log('opened')
//             resolve()
//           } catch (error) {
//             console.error(error)
//             reject(error)
//           }
//         })
//         await openingPromise
//         openingPromise = undefined
//         for (const plugin of plugins) {
//           plugin(previewApi)
//         }

//         previewState = 'open'
//       } catch (error) {
//         previewState = 'closed'
//       }
//     },
//     async dispose() {
//       if (previewState === 'closed') {
//         // @debug
//         vscode.window.showErrorMessage('already closed')
//       }

//       if (previewState === 'closing') {
//         // @debug
//         vscode.window.showErrorMessage('already closing')
//         return
//       }

//       await doDispose(previewApi)
//       previewState = 'closing'
//       await closingPromise
//       closingPromise = undefined
//       previewState = 'closed'
//     },
//   }
// })()
