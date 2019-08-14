import {LocalPlugin} from '../localPluginApi';

export const core: LocalPlugin = api => {
	const {vscode, webSocketServer, diff} = api;
	let previousText =
		(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.getText()) || '';
	let previousDom = api.parser.parse(previousText) as {children: any[]};

	api.vscode.window.onDidChangeActiveTextEditor(event => {
		previousText = event.document.getText();
		previousDom = api.parser.parse(previousText) as {children: any[]};
	});
	api.vscode.workspace.onDidChangeTextDocument(event => {
		console.log('change');
		console.log(event.contentChanges);
		if (event.document.languageId !== 'html') {
			return;
		}

		if (event.contentChanges.length === 0) {
			return;
		}

		const newText = event.document.getText();

		try {
			if (event.contentChanges.length === 1) {
				const change = event.contentChanges[0];
				const oldNodeMap = api.parser.nodeMap;
				const nextDom = api.parser.edit(newText, [change]);
				const newNodeMap = api.parser.nodeMap;
				const diffs = diff(previousDom.children, nextDom.children, {oldNodeMap, newNodeMap});
				previousDom = nextDom;
				webSocketServer.broadcast(diffs, {});
				previousText = newText;
				console.log('diffs');
				console.log(diffs);
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
