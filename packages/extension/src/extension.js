import * as vscode from 'vscode';
import {createWebSocketServer} from './WebSocketServer/createWebSocketServer';
import * as http from 'http';

import {build} from '../../../src/HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {genDom} from './genDom';
import * as fs from 'fs';
import * as path from 'path';
import {domdiff} from '../../../src/VirtualDom/diff';
import {parseHtml} from '../../../src/VirtualDom/parse';

export function activate() {
	let previousText =
		(vscode.window.activeTextEditor &&
			vscode.window.activeTextEditor.document.getText()) ||
		'';
	const webSocketServer = createWebSocketServer();
	const indexJs = fs.readFileSync(
		path.join(__dirname, '../../client/src/index.js')
	);
	const httpServer = http.createServer((req, res) => {
		if (req.url === '/') {
			let dom = genDom(previousText);
			const bodyIndex = dom.lastIndexOf('</body');
			const $virtualDom = `<script id="virtual-dom">${JSON.stringify(
				parseHtml(dom)
			)}</script>`;
			const $script = '<script src="index.js"></script>';
			if (bodyIndex) {
				dom =
					dom.slice(0, bodyIndex) +
					$virtualDom +
					'\n' +
					$script +
					dom.slice(bodyIndex);
			} else {
				dom += $virtualDom + '\n' + $script;
			}

			res.end(dom);
		} else if (req.url === '/index.js') {
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			res.write(indexJs);
			res.end();
		}
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

		const newText = event.document.getText();
		try {
			// @ts-ignore
			// console.log(build(previousText).dom);
			// Console.log(build(previousText));
			// @ts-ignore
			// const diff = domdiff(build(previousText).dom, build(newText).dom);

			const diffs = domdiff(parseHtml(previousText), parseHtml(newText));
			webSocketServer.broadcast(diffs, {});
			previousText = newText;
		} catch (error) {
			console.error(error);
		}
	});
}
