import * as vscode from 'vscode';
import {createParser, diff} from 'virtual-dom';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import {
	createWebSocketServer,
	genDom,
	WebSocketServer,
	createHttpServer,
	HttpServer,
	open
} from 'html-preview-service';
import {core} from '../plugins/local-plugin-core/core';
import {redirect} from '../plugins/local-plugin-redirect/redirect';
import {highlight} from '../plugins/local-plugin-highlight/highlight';
import {LocalPluginApi, LocalPlugin} from '../plugins/localPluginApi';

const packagesRoot =
	process.env.NODE_ENV === 'production' ?
		path.join(__dirname, '../../') :
		path.join(__dirname, '../../../');

async function openPreview(context: vscode.ExtensionContext) {
	const indexJs = fs.readFileSync(path.join(packagesRoot, 'injected-code/dist/injectedCodeMain.js'));
	const indexJsMap = fs.readFileSync(
		path.join(packagesRoot, 'injected-code/dist/injectedCodeMain.js.map')
	);
	const httpServer = createHttpServer();
	const parser = createParser();
	httpServer.onRequest((req, res) => {
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
				let dom = genDom(parser.text);
				const bodyIndex = dom.lastIndexOf('</body');
				const $virtualDom = `<script id="virtual-dom">${JSON.stringify(
					parser.dom.children
				)}</script>`;
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
	context.subscriptions.push({
		dispose() {
			httpServer.stop();
		}
	});
	await httpServer.start(3000);
	await open('http://localhost:3000');
	const webSocketServer = createWebSocketServer();
	try {
		webSocketServer.start(3001);
	} catch (error) {
		// @debug
		console.error(error);
		vscode.window.showErrorMessage(error);
	}

	context.subscriptions.push({
		dispose() {
			webSocketServer.stop();
		}
	});

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

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('htmlPreview.openPreview', () => openPreview(context));
}
