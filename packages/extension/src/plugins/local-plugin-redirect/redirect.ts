import {LocalPlugin} from '../localPluginApi';
import * as vscode from 'vscode';

export const redirect: LocalPlugin = api => {
	api.vscode.window.onDidChangeActiveTextEditor(event => {
		// event.document.uri.
		api.webSocketServer.broadcast(
			[
				{
					command: 'redirect',
					payload: {
						url: vscode.workspace.asRelativePath(event.document.uri)
					}
				}
			],
			{}
		);
	});
	return {};
};
