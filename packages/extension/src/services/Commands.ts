import * as vscode from 'vscode';
import {createParser, diff} from 'virtual-dom';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import {createWebSocketServer, genDom} from 'html-preview-service';

const packagesRoot =
	process.env.NODE_ENV === 'production' ?
		path.join(__dirname, '../../') :
		path.join(__dirname, '../../../');

const wrapError = fn => {
	try {
		fn();
	} catch (error) {
		console.error(error);
	}
};

let highlightedId;

function highlight(parser, webSocketServer) {
	vscode.window.onDidChangeTextEditorSelection(event => {
		wrapError(() => {
			if (event.selections.length !== 1) {
				return;
			}

			const selection = event.selections[0];
			const offset = vscode.window.activeTextEditor.document.offsetAt(selection.active);
			let previousValue;
			let found;
			for (const [key, value] of Object.entries(parser.prefixSums)) {
				const parsedKey = parseInt(key, 10);
				// @debug
				// @ts-ignore
				if (!parser.nodeMap[value]) {
					console.log(parser.prefixSums);
					console.error(`node ${value} doesn\'t exist`);
					webSocketServer.broadcast(
						[
							{
								command: 'error',
								payload: `highlight error, node ${value} doesn\'t exist`
							}
						],
						{}
					);
				}

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

			if (highlightedId === found) {
				return;
			}

			highlightedId = found;

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
	});
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('htmlPreview.openPreview', () => {
			context.subscriptions.push(
				vscode.window.onDidChangeActiveTextEditor(event => {
					// event.document.uri.
					webSocketServer.broadcast(
						[
							{
								command: 'redirect',
								payload: vscode.workspace.asRelativePath(event.document.uri)
							}
						],
						{}
					);
				})
			);

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

			const send = false;

			const httpServer = http.createServer((req, res) => {
				try {
					try {
						const file = fs.readFileSync(
							path.join(packagesRoot, `injected-code/dist/${req.url}.js`),
							'utf-8'
						);
						res.writeHead(200, {'Content-Type': 'text/javascript'});
						res.write(file);
						res.end();
					} catch (error) {}

					if (req.url === '/') {
						// TODO later: caching and etags
						// if (!send) {
						// 	send = true;
						// } else {
						// 	res.statusCode = 304;
						// 	console.log('already sent');
						// 	res.end();
						// 	return;
						// }

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
						res.write(indexJsMap);
						res.end();
					} else {
						res.statusCode = 404;
						res.end();
					}
				} catch (error) {
					console.error(error);
					vscode.window.showErrorMessage(error);
				}
			});
			httpServer.on('error', error => {
				console.error(error);
				vscode.window.showErrorMessage(error.message);
			});

			httpServer.listen(3000, () => {
				console.log('listening');
			});
			context.subscriptions.push({
				dispose() {
					httpServer.close();
				}
			});

			try {
				webSocketServer.start(3001);
			} catch (error) {
				console.error(error);
				vscode.window.showErrorMessage(error);
			}

			context.subscriptions.push({
				dispose() {
					webSocketServer.stop();
				}
			});
			webSocketServer.onMessage(message => {
				if (message.type === 'request' && message.message.command === 'highlight') {
					const {id} = message.message.payload;
					// console.log('id', message.message.payload.id);
					// console.log(parser.prefixSums);
					for (const [key, value] of Object.entries(parser.prefixSums)) {
						if (value === id) {
							const parsedKey = parseInt(key, 10);
							vscode.window.activeTextEditor.selection = new vscode.Selection(
								vscode.window.activeTextEditor.document!.positionAt(parsedKey),
								vscode.window.activeTextEditor.document!.positionAt(parsedKey)
							);
						}
					}
				}
				// if(message.type!=='response'){}
			});

			if (vscode.workspace.getConfiguration().get('htmlPreview.highlight')) {
				highlight(parser, webSocketServer);
			}

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
						console.log('change');
						console.log(change);
						const oldNodeMap = parser.nodeMap;
						const nextDom = parser.edit(newText, [change]);
						const newNodeMap = parser.nodeMap;
						const diffs = diff(previousDom, nextDom, {oldNodeMap, newNodeMap});
						previousDom = nextDom;
						webSocketServer.broadcast(diffs, {});
						previousText = newText;
						console.log('oldNodeMap');
						console.log(JSON.stringify(oldNodeMap, null, 2));
						console.log('newNodeMap');
						console.log(JSON.stringify(newNodeMap, null, 2));
						console.log('diffs');
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
