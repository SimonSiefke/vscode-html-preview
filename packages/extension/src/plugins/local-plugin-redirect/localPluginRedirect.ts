import { LocalPlugin } from '../localPluginApi'
import * as vscode from 'vscode'

export const localPluginRedirect: LocalPlugin = api => {
  // api.vscode.window.onDidChangeActiveTextEditor(event => {
  // 	if (event.document.languageId !== 'html') {
  // 		return;
  // 	}

  // 	api.webSocketServer.broadcast(
  // 		[
  // 			{
  // 				command: 'redirect',
  // 				payload: {
  // 					url: vscode.workspace.asRelativePath(event.document.uri)
  // 				}
  // 			}
  // 		],
  // 		{}
  // 	);
  // });
  return {}
}
