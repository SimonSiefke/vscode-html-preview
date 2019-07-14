import * as vscode from 'vscode';
import {createWebSocketServer} from './WebSocketServer/createWebSocketServer';
import * as http from 'http';
import {domdiff} from '../../../src/HtmlDomDiff/HTMLDOMDiff';

import {build} from '../../../src/HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {genDom} from './genDom';

export function activate() {
	let previousText =
		(vscode.window.activeTextEditor &&
			vscode.window.activeTextEditor.document.getText()) ||
		'';
	const webSocketServer = createWebSocketServer();
	const httpServer = http.createServer((req, res) => {
		res.end(`${genDom(
			previousText
		)}<script>const ws = new WebSocket('ws://localhost:3001')
		ws.onmessage = ({ data }) => {
			const message = JSON.parse(data)
			if(message[0].payload[0].type==='textReplace'){
				const {type, content, parentId} = message[0].payload[0]
				const $el = document.querySelector(\`[data-brackets-id="\${parentId}"]\`)
				$el.innerText = content
			}
		}</script>`);
	});
	httpServer.listen(3000, () => {
		console.log('listening');
	});
	webSocketServer.start(3001);
	vscode.workspace.onDidChangeTextDocument(event => {
		if (!previousText) {
			previousText = event.document.getText();
			return;
		}

		if (event.contentChanges.length === 0) {
			return;
		}

		console.log('change');
		const newText = event.document.getText();
		try {
			// @ts-ignore
			console.log(build(previousText).dom);
			// Console.log(build(previousText));
			// @ts-ignore
			const diff = domdiff(build(previousText).dom, build(newText).dom);
			webSocketServer.broadcast(
				[
					{
						command: 'update',
						payload: diff
					}
				],
				{}
			);
			console.log('after');
			console.log(diff);
			previousText = newText;
		} catch (error) {
			console.error(error);
		}
	});
}
