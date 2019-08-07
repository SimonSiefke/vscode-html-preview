import * as vscode from 'vscode';
import {createParser, diff} from 'virtual-dom';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import {createWebSocketServer, genDom} from 'html-preview-service';

const packagesRoot = path.join(__dirname, '../../../');

export function activate(context: vscode.ExtensionContext) {
	// setInterval(() => {

	// }, 1000);
	context.subscriptions.push(
		vscode.commands.registerCommand('htmlPreview.showPreview', () => {
			vscode.window.onDidChangeTextEditorSelection(event => {
				if (event.selections.length !== 1) {
					return;
				}

				const selection = event.selections[0];
				const offset = vscode.window.activeTextEditor.document.offsetAt(selection.active);
				let previousValue;
				let found;
				for (const [key, value] of Object.entries(parser.prefixSums)) {
					const parsedKey = parseInt(key, 10);
					// @ts-ignore
					const isElementNode = parser.nodeMap[value].type === 'ElementNode';

					if (parsedKey === offset && isElementNode) {
						found = value;

						break;
					}

					if (parsedKey > offset) {
						found = previousValue;
						break;
					}

					if (isElementNode) {
						previousValue = value;
					}
				}

				if (!found) {
					found = previousValue;
				}

				if (!found) {
					return;
				}

				webSocketServer.broadcast(
					[
						{
							command: 'highlight',
							payload: {
								id: found
							}
						}
					],
					{}
				);
			});

			let previousText =
				(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.getText()) || '';
			const webSocketServer = createWebSocketServer();
			const indexJs = fs.readFileSync(
				path.join(packagesRoot, 'injected-code/dist/injectedCodeMain.js')
			);
			const indexJsMap = fs.readFileSync(
				path.join(packagesRoot, 'injected-code/dist/injectedCodeMain.js.map')
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
						const $virtualDom = `<script id="virtual-dom">${JSON.stringify(previousDom)}</script>`;
						const $script = '<script type="module" src="index.js"></script>';
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
					} else if (req.url === '/injectedCodeMain.js.map') {
						// res.writeHead(200, {'Content-Type': 'text/javascript'});
						res.write(indexJsMap);
						res.end();
					} else {
						res.statusCode = 404;
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
			webSocketServer.onMessage(message => {
				if (message.type === 'request' && message.message.command === 'highlight') {
					const {id} = message.message.payload;
					console.log('id', message.message.payload.id);
					console.log(parser.prefixSums);
					for (const [key, value] of Object.entries(parser.prefixSums)) {
						if (value === id) {
							const parsedKey = parseInt(key, 10);
							console.log(parsedKey);
							vscode.window.activeTextEditor.selection = new vscode.Selection(
								vscode.window.activeTextEditor.document!.positionAt(parsedKey),
								vscode.window.activeTextEditor.document!.positionAt(parsedKey)
							);
						}
					}
				}
				// if(message.type!=='response'){}
			});
			vscode.workspace.onDidChangeTextDocument(event => {
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
						console.log(change);
						const oldNodeMap = parser.nodeMap;
						const nextDom = parser.edit(newText, [change]);
						const newNodeMap = parser.nodeMap;
						const diffs = diff(previousDom, nextDom, {oldNodeMap, newNodeMap});
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
		})
	);
}
