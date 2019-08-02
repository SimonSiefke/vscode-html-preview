/* eslint-disable no-negated-condition */
import * as vscode from 'vscode';
import {createWebSocketServer} from './WebSocketServer/createWebSocketServer';
import * as http from 'http';

import {build} from '../../../src/HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';
import {genDom} from './genDom';
import * as fs from 'fs';
import * as path from 'path';
import {domdiff} from '../../../src/VirtualDom/diff';
import {createParser} from '../../../src/VirtualDom/parse';

export function activate() {
	let previousText =
		(vscode.window.activeTextEditor &&
			vscode.window.activeTextEditor.document.getText()) ||
		'';
	const webSocketServer = createWebSocketServer();
	const indexJs = fs.readFileSync(
		path.join(__dirname, '../../client/src/index.js')
	);
	const parser = createParser();
	let previousDom = parser.parse(previousText);

	const httpServer = http.createServer((req, res) => {
		try {
			if (req.url === '/') {
				res.writeHead(200, {'Content-Type': 'text/html'});
				let dom = genDom(previousText);
				const bodyIndex = dom.lastIndexOf('</body');
				previousDom = parser.parse(previousText);
				const $virtualDom = `<script id="virtual-dom">${JSON.stringify(
					previousDom
				)}</script>`;
				const $script = '<script src="index.js"></script>';
				const $inner = '\n' + $virtualDom + '\n' + $script;
				if (bodyIndex !== -1) {
					dom = dom.slice(0, bodyIndex) + $inner + dom.slice(bodyIndex);
				} else {
					dom += $inner;
				}

				res.write(dom);
				res.end();
			} else if (req.url === '/index.js') {
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.write(indexJs);
				res.end();
			}
		} catch (error) {
			console.error(error);
		}
	});
	httpServer.listen(3000, () => {
		console.log('listening');
	});
	webSocketServer.start(3001);
	vscode.workspace.onDidChangeTextDocument(event => {
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
				console.log(change);
				const nextDom = parser.edit(newText, [
					{
						rangeOffset: change.rangeOffset,
						rangeLength: change.rangeLength,
						text: change.text
					}
				]);
				const newNodeMap = parser.nodeMap;
				console.log(oldNodeMap);
				console.log(newNodeMap);
				const diffs = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap});
				previousDom = nextDom;
				webSocketServer.broadcast(diffs, {});
				previousText = newText;
				console.log('yes');
				console.log(diffs);
			} else {
				console.log(event.contentChanges);
				console.log('sorry no diffs');
				webSocketServer.broadcast(
					[
						{
							command: 'error',
							payload: 'too many changes'
						}
					],
					{}
				);
			}
		} catch (error) {
			console.error(error);
		}
	});
}
