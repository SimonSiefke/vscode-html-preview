import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
	createWebSocketServer,
	genDom,
	createHttpServer,
	openInBrowser,
	createParser,
	diff,
	WebSocketServer,
	mime
} from 'html-preview-service';
import {core} from '../plugins/local-plugin-core/core';
import {redirect} from '../plugins/local-plugin-redirect/redirect';
import {highlight} from '../plugins/local-plugin-highlight/highlight';
import {LocalPluginApi, LocalPlugin} from '../plugins/localPluginApi';
import {config} from '../config';

const packagesRoot = path.join(config.root, 'packages');

let webSocketServer: WebSocketServer | undefined;

async function open() {
	const browser = vscode.workspace.getConfiguration().get<string>('htmlPreview.browser');
	if (process.env.NODE_ENV !== 'test') {
		await openInBrowser('http://localhost:3000', browser);
	}
}

function handleError(error) {
	console.error(error);
	vscode.window.showErrorMessage(`Html Preview: ${error.message}`);
}

async function openPreview(context: vscode.ExtensionContext) {
	if (webSocketServer) {
		await open();
		return;
	}

	const indexJs = fs.readFileSync(path.join(packagesRoot, 'injected-code/dist/html-preview.js'));
	const indexJsMap = fs.readFileSync(
		path.join(packagesRoot, 'injected-code/dist/html-preview.js.map')
	);
	const httpServer = createHttpServer();
	const parser = createParser();
	httpServer.onRequest(async (req, res) => {
		const notFound = () => {
			console.log('not found');
			res.statusCode = 404;
			res.end();
		};

		try {
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
				let dom = genDom(parser.text);
				const bodyIndex = dom.lastIndexOf('</body');
				// const $virtualDom = `<script id="virtual-dom">${JSON.stringify(
				// 	parser.dom.children
				// )}</script>`;
				const $script = '<script type="module" src="html-preview.js"></script>';
				const $inner = '\n' + $script;
				if (bodyIndex !== -1) {
					dom = dom.slice(0, bodyIndex) + $inner + dom.slice(bodyIndex);
				} else {
					dom += $inner;
				}

				res.write(dom);
				res.end();
			} else if (req.url === '/virtual-dom.json') {
				res.writeHead(200, {'Content-Type': 'text/json'});
				const virtualDom = JSON.stringify(parser.dom.children);
				res.write(virtualDom);
				res.end();
			} else if (req.url === '/html-preview.js') {
				res.writeHead(200, {'Content-Type': 'text/javascript'});
				res.write(indexJs);
				res.end();
			} else if (req.url === '/html-preview.js.map') {
				res.write(indexJsMap);
				res.end();
			} else {
				try {
					let file: Uint8Array | string;
					if (!vscode.workspace.workspaceFolders) {
						const matchingTextEditor = vscode.window.visibleTextEditors.find(textEditor => {
							console.log(textEditor.document.uri.fsPath);
							console.log(req.url);
							return textEditor.document.uri.fsPath.endsWith(req.url);
						});
						if (!matchingTextEditor) {
							return notFound();
						}

						file = matchingTextEditor.document.getText();
					} else {
						const diskPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, req.url);
						const uri = vscode.Uri.file(diskPath);
						file = await vscode.workspace.fs.readFile(uri);
					}

					const mimeType = mime.getType(req.url);
					res.writeHead(200, {'Content-Type': mimeType});
					res.write(file);
					res.end();
				} catch (error) {
					handleError(error);
				}
			}
		} catch (error) {
			handleError(error);
		}
	});
	context.subscriptions.push({
		dispose() {
			webSocketServer.stop();
			webSocketServer = undefined;
		}
	});
	try {
		await httpServer.start(3000);
	} catch (error) {
		handleError(error);
		return;
	}

	await open();
	webSocketServer = createWebSocketServer(httpServer.server);

	const autoDispose = (fn: (...args: any[]) => vscode.Disposable) => (...args: any[]) =>
		context.subscriptions.push(fn(...args));
	const localPluginApi: LocalPluginApi = {
		webSocketServer,
		parser,
		diff,
		vscode: {
			Selection: vscode.Selection,
			window: {
				activeTextEditor: vscode.window.activeTextEditor,
				onDidChangeActiveTextEditor: autoDispose(vscode.window.onDidChangeActiveTextEditor),
				onDidChangeTextEditorSelection: autoDispose(vscode.window.onDidChangeTextEditorSelection)
			},
			workspace: {
				asRelativePath: vscode.workspace.asRelativePath,
				onDidChangeTextDocument: autoDispose(vscode.workspace.onDidChangeTextDocument)
			}
		}
	};
	const enablePlugin = (plugin: LocalPlugin) => plugin(localPluginApi);
	enablePlugin(core);
	if (vscode.workspace.getConfiguration().get('htmlPreview.highlight')) {
		enablePlugin(highlight);
	}

	enablePlugin(redirect);
}

const closePreview = async () => {
	if (!webSocketServer) {
		throw new Error('cannot close because server isn\'t open');
	}

	await webSocketServer.stop();
	webSocketServer = undefined;
};

export function activate(context: vscode.ExtensionContext) {
	const registerCommand = (commandName: string, command: () => void) =>
		context.subscriptions.push(vscode.commands.registerCommand(commandName, command));
	registerCommand('htmlPreview.openPreview', () => openPreview(context));
	registerCommand('htmlPreview.openWithHtmlPreview', () => openPreview(context));
	registerCommand('htmlPreview.closePreview', closePreview);
}
