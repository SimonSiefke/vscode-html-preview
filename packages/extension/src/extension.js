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
			const messages = JSON.parse(data)
			for(const message of messages){
				const {payload} = message
				const {parentId} = payload
				if(message.payload.type==='textReplace'){
					const {type, content} = payload
					const $el = document.querySelector(\`[data-brackets-id="\${parentId}"]\`)
					$el.innerText = content
				} else if (payload.type==='attrAdd' || payload.type==='attrChange'){
					const {tagId} = payload
					const $el = document.querySelector(\`[data-brackets-id="\${tagId}"]\`)
					$el.setAttribute(payload.attribute, payload.value||'')
				} else if (payload.type==='attrDelete'){
					const {tagId} = payload
					const $el = document.querySelector(\`[data-brackets-id="\${tagId}"]\`)
					$el.removeAttribute(payload.attribute)
				}

				else{
					console.log(JSON.stringify(message))
					// console.log(message.payload.type)
					// console.log('else')
					// window.location.reload(true)
				}
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
				diff.map(dif => ({
					command: dif.type,
					payload: dif
				})),
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
