import {LocalPlugin} from '../localPluginApi';

export const redirect: LocalPlugin = api => {
	api.vscode.window.onDidChangeActiveTextEditor(event => {
		// event.document.uri.
		api.webSocketServer.broadcast(
			[
				{
					command: 'redirect',
					payload: {
						url: api.vscode.workspace.asRelativePath(event.document.uri)
					}
				}
			],
			{}
		);
	});
	return {};
};
