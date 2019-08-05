/* eslint-disable no-negated-condition */
import * as vscode from 'vscode';
import {createWebSocketServer} from './WebSocketServer/createWebSocketServer';
import * as http from 'http';

import {genDom} from '../extension/src/genDom';
import * as fs from 'fs';
import * as path from 'path';
import {domdiff} from './src/VirtualDom/diff';
import {createParser} from './src/VirtualDom/parse';

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
	console.log(previousDom);

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
				const $script = '<script defer src="index.js"></script>';
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
		// Console.log(event);
		// return;
		if (event.contentChanges.length === 0) {
			return;
		}

		if (!previousText) {
			previousText = event.document.getText();
			return;
		}

		const newText = event.document.getText();

		// 		Const testCase = {
		// 			previousDom: `<!DOCTYPE html>
		// <html lang="en">
		// <head>
		//   <meta charset="UTF-8">
		//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
		//   <meta http-equiv="X-UA-Compatible" content="ie=edge">
		//   <title>Document</title>
		// </head>
		// <body>
		//   <h1>hello world</h1>
		// </body>
		// </html>`,
		// 			nextDom: `<!DOCTYPE html>
		// <html lang="en">
		// <head>
		//   <meta charset="UTF-8">
		//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
		//   <meta http-equiv="X-UA-Compatible" content="ie=edge">
		//   <title>Document</title>
		// </head>
		// <body>
		//   <h1>hello world</h1>

		// </body>
		// </html>`
		// 		};

		// PreviousDom = parser.parse(testCase.previousDom);
		// console.log(previousDom);
		try {
			if (event.contentChanges.length === 1) {
				const change = event.contentChanges[0];
				console.log(change);
				const oldNodeMap = parser.nodeMap;
				const nextDom = parser.edit(newText, [change]);
				const newNodeMap = parser.nodeMap;
				const diffs = domdiff(previousDom, nextDom, {oldNodeMap, newNodeMap});
				console.log(nextDom.pretty());
				previousDom = nextDom;
				webSocketServer.broadcast(diffs, {});
				previousText = newText;
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
