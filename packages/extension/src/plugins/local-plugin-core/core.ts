import {LocalPlugin} from '../localPluginApi';
import {minimizeEdits} from '../../services/Commands-util/minimizeEdits/minimizeEdits';

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
		if (event.document.languageId !== 'html') {
			return;
		}

		if (event.contentChanges.length === 0) {
			return;
		}

		const edits = minimizeEdits(previousText, event.contentChanges);
		const newText = event.document.getText();

		if (edits.length === 0) {
			return;
		}

		try {
			if (edits.length === 1) {
				console.log('change');
				console.log(edits[0]);
				const change = edits[0];
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
				console.log(edits.length);
				console.log(edits);
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
