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
	await openInBrowser('http://localhost:3000', browser);
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
				const $virtualDom = `<script id="virtual-dom">${JSON.stringify(
					parser.dom.children
				)}</script>`;
				const $script = '<script type="module" src="html-preview.js"></script>';
				const $inner = '\n' + $virtualDom + '\n' + $script;
				if (bodyIndex !== -1) {
					dom = dom.slice(0, bodyIndex) + $inner + dom.slice(bodyIndex);
				} else {
					dom += $inner;
				}

				res.write(dom);
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
					const diskPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, req.url);
					const uri = vscode.Uri.file(diskPath);
					const file = await vscode.workspace.fs.readFile(uri);
					const mimeType = mime.getType(req.url);
					res.writeHead(200, {'Content-Type': mimeType});
					res.write(file);
					res.end();
				} catch (error) {
					console.log('error', error);
					res.statusCode = 404;
					res.end();
				}
			}
		} catch (error) {
			console.error(error);
			vscode.window.showErrorMessage(error);
		}
	});
	context.subscriptions.push({
		dispose() {
			webSocketServer.stop();
			webSocketServer = undefined;
		}
	});
	await httpServer.start(3000);
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
	context.subscriptions.push(
		vscode.commands.registerCommand('htmlPreview.openPreview', () => openPreview(context))
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('htmlPreview.openWithHtmlPreview', () => openPreview(context))
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('htmlPreview.closePreview', closePreview)
	);
}
