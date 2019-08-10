import {LocalPlugin} from '../localPluginApi';

export const core: LocalPlugin = api => {
	const {vscode, webSocketServer, parser, diff} = api;
	let previousText =
		(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.getText()) || '';
	let previousDom = parser.parse(previousText) as {children: any[]};
	api.vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId !== 'html') {
			return;
		}

		if (event.contentChanges.length === 0) {
			return;
		}

		if (!previousText) {
			previousText = event.document.getText();
			return;
		}

		const newText = event.document.getText();

		try {
			if (event.contentChanges.length === 1) {
				const change = event.contentChanges[0];
				const oldNodeMap = parser.nodeMap;
				const nextDom = parser.edit(newText, [change]);
				const newNodeMap = parser.nodeMap;
				const diffs = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap});
				previousDom = nextDom;
				webSocketServer.broadcast(diffs, {});
				previousText = newText;
			} else {
				console.log(event.contentChanges);
				console.log('sorry no diffs');
				webSocketServer.broadcast(
					[
						{
							command: 'error',
							payload: {
								message: 'too many changes'
							}
						}
					],
					{}
				);
			}
		} catch (error) {
			console.error(error);
		}
	});
};
