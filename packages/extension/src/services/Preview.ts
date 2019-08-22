import * as vscode from 'vscode';
import {parse as parseUrl} from 'url';
import * as fs from 'fs';
import * as path from 'path';
import {config} from '../config';
import {
	HttpServer,
	WebSocketServer,
	createWebSocketServer,
	createHttpServer,
	openInBrowser,
	genDom,
	Parser
} from 'html-preview-service';
import {core} from '../plugins/local-plugin-core/core';
import {redirect} from '../plugins/local-plugin-redirect/redirect';
import {highlight} from '../plugins/local-plugin-highlight/highlight';
import * as http from 'http';
import {LocalPlugin} from '../plugins/localPluginApi';

export interface PreviewApi {
	vscode: {
		window: {
			onDidChangeActiveTextEditor: (listener: (event: vscode.TextEditor) => void) => void
			onDidChangeTextEditorSelection: (
				listener: (event: vscode.TextEditorSelectionChangeEvent) => void
			) => void
		}
		workspace: {
			onDidChangeTextDocument: (listener: (event: vscode.TextDocumentChangeEvent) => void) => void
			createFileSystemWatcher: (
				globPattern: vscode.GlobPattern,
				ignoreCreateEvents?: boolean,
				ignoreChangeEvents?: boolean,
				ignoreDeleteEvents?: boolean
			) => vscode.FileSystemWatcher
		}
	}
	parser: Parser
	webSocketServer: WebSocketServer | undefined
	httpServer: HttpServer | undefined
}

// TODO put these 4 lines into html preview service, it has nothing special todo with vscode
const packagesRoot = path.join(config.root, 'packages');
const htmlPreviewJs = fs.readFileSync(path.join(packagesRoot, 'injected-code/dist/html-preview.js'));
const htmlPreviewJsMap = fs.readFileSync(
	path.join(packagesRoot, 'injected-code/dist/html-preview.js.map')
);

const httpMiddlewareSendCss = (api: PreviewApi) => async (
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: any
) => {
	const url = parseUrl(req.url);
	if (!url.pathname.endsWith('.css')) {
		return next();
	}

	const matchingTextEditor = vscode.window.visibleTextEditors.find(
		textEditor => vscode.workspace.asRelativePath(textEditor.document.uri) === url.pathname.slice(1)
	);
	if (matchingTextEditor) {
		const css = matchingTextEditor.document.getText();
		res.writeHead(200, {'Content-Type': 'text/css'});
		res.write(css);
		res.end();
		return;
	}

	try {
		const diskPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, url.pathname);
		const uri = vscode.Uri.file(diskPath);
		const css = (await vscode.workspace.fs.readFile(uri)).toString();
		res.writeHead(200, {'Content-Type': 'text/css'});
		res.write(css);
	} catch (error) {
		res.statusCode = 404;
	} finally {
		res.end();
	}
};

const httpMiddlewareSendHtml = (api: PreviewApi) => async (
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: any
) => {
	const url = parseUrl(req.url);
	let relativePath: string | undefined;
	if (url.pathname.endsWith('.html')) {
		relativePath = url.pathname;
	} else if (url.pathname.endsWith('/')) {
		relativePath = url.pathname + 'index.html';
	}

	if (!relativePath) {
		return next();
	}

	const matchingTextEditor = vscode.window.visibleTextEditors.find(
		textEditor => vscode.workspace.asRelativePath(textEditor.document.uri) === relativePath.slice(1)
	);
	if (matchingTextEditor) {
		const text = matchingTextEditor.document.getText();
		let dom = genDom(text);
		const bodyIndex = dom.lastIndexOf('</body');
		const $script = '<script type="module" src="html-preview.js"></script>';

		if (bodyIndex !== -1) {
			dom = dom.slice(0, bodyIndex) + $script + dom.slice(bodyIndex);
		} else {
			dom += $script;
		}

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(dom);
		res.end();
		return;
	}

	// TODO add cache with parser and urls
	const diskPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, relativePath);
	const uri = vscode.Uri.file(diskPath);
	try {
		const file = (await vscode.workspace.fs.readFile(uri)).toString();
		res.writeHead(200, {'Content-Type': 'text/html'});
		let dom = genDom(file);
		const bodyIndex = dom.lastIndexOf('</body');
		const $script = '<script type="module" src="html-preview.js"></script>';
		if (bodyIndex !== -1) {
			dom = dom.slice(0, bodyIndex) + $script + dom.slice(bodyIndex);
		} else {
			dom += $script;
		}

		res.write(dom);
	} catch (error) {
		res.statusCode = 404;
	} finally {
		res.end();
	}
};

const httpMiddlewareSendInjectedCode = (api: PreviewApi) => (
	req: http.IncomingMessage,
	res: http.ServerResponse,
	next: any
) => {
	if (req.url === '/virtual-dom.json') {
		res.writeHead(200, {'Content-Type': 'text/json'});
		const virtualDom = JSON.stringify(api.parser.dom.children);
		res.write(virtualDom);
		return res.end();
	}

	if (req.url === '/html-preview.js') {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.write(htmlPreviewJs);
		return res.end();
	}

	if (req.url === '/html-preview.js.map') {
		res.writeHead(200);
		res.write(htmlPreviewJsMap);
		return res.end();
	}

	next();
};

const doOpenBrowser = async (api: PreviewApi): Promise<void> => {
	if (process.env.NODE_ENV === 'test') {
		return;
	}

	let relativePath: string;
	const {activeTextEditor} = vscode.window;
	if (activeTextEditor) {
		// api.vscode.window.showErrorMessage('html document must be open');
		// throw new Error('html document must be open');
		relativePath = vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri);
	} else {
		relativePath = 'index.html';
	}

	const url = path.join('http://localhost:3000', relativePath);
	try {
		await openInBrowser(url);
	} catch (error) {
		vscode.window.showErrorMessage('failed to open in browser');
		throw error;
	}
};

const doOpen = async (api: PreviewApi): Promise<void> => {
	api.httpServer = createHttpServer();
	api.httpServer.use(httpMiddlewareSendHtml(api));
	api.httpServer.use(httpMiddlewareSendInjectedCode(api));
	api.httpServer.use(httpMiddlewareSendCss(api));
	try {
		await api.httpServer.start({
			injectedCode: '<script type="module" src="html-preview.js"></script>',
			directory: vscode.workspace.workspaceFolders[0].uri.fsPath,
			port: 3000
		});
	} catch (error) {
		vscode.window.showErrorMessage('failed to open preview');
		throw error;
	}

	api.webSocketServer = createWebSocketServer(api.httpServer);

	// CSS live edit
	api.vscode.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId !== 'css') {
			return;
		}

		if (event.contentChanges.length === 0) {
			return;
		}

		api.webSocketServer.broadcast([
			{
				command: 'updateCss',
				payload: {}
			}
		]);
	});
	// this might be useful later when using sass
	// const fileSystemWatcher = api.vscode.workspace.createFileSystemWatcher(
	// 	new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], '**/*.*')
	// );
	// fileSystemWatcher.onDidChange(event => {
	// 	if (event.fsPath.endsWith('.html')) {
	// 		return;
	// 	}

	// 	if (event.fsPath.endsWith('.css')) {
	// 		api.webSocketServer.broadcast([
	// 			{
	// 				command: 'update-css',
	// 				payload: {}
	// 			}
	// 		]);
	// 	}
	// });
};

const doDispose = async (api: PreviewApi): Promise<void> => {
	api.webSocketServer.broadcast([
		{
			command: 'connectionClosed',
			payload: {}
		}
	]);
	await api.webSocketServer.stop();
	await api.httpServer.stop();
	api.httpServer = undefined;
	api.webSocketServer = undefined;
};

const plugins: LocalPlugin[] = [];
plugins.push(core);
if (process.env.NODE_ENV !== 'test') {
	plugins.push(redirect);
}

if (
	vscode.workspace.getConfiguration().get('htmlPreview.highlight') &&
	process.env.NODE_ENV !== 'test'
) {
	plugins.push(highlight);
}

export const Preview = (() => {
	let state: 'opening' | 'open' | 'closing' | 'closed' = 'closed';
	let closingPromise: Promise<void> | undefined;
	let openingPromise: Promise<void> | undefined;
	const api: PreviewApi = {
		parser: undefined,
		vscode: {
			window: {
				onDidChangeActiveTextEditor: vscode.window.onDidChangeActiveTextEditor,
				onDidChangeTextEditorSelection: vscode.window.onDidChangeTextEditorSelection
			},
			workspace: {
				onDidChangeTextDocument: vscode.workspace.onDidChangeTextDocument,
				createFileSystemWatcher: vscode.workspace.createFileSystemWatcher
			}
		},
		httpServer: undefined,
		webSocketServer: undefined
	};
	return {
		get state() {
			return state;
		},
		async open() {
			if (state === 'opening') {
				return;
			}

			if (state === 'closing') {
				await closingPromise;
			}

			if (state === 'open') {
				openingPromise = doOpenBrowser(api);
				await openingPromise;
				openingPromise = undefined;
				return;
			}

			state = 'opening';
			try {
				openingPromise = new Promise(async (resolve, reject) => {
					try {
						await doOpen(api);
						await doOpenBrowser(api);
						resolve();
					} catch (error) {
						reject(error);
					}
				});
				await openingPromise;
				openingPromise = undefined;
				for (const plugin of plugins) {
					plugin(api);
				}

				state = 'open';
			} catch (error) {
				state = 'closed';
			}
		},
		async dispose() {
			if (state === 'closed') {
				vscode.window.showErrorMessage('already closed');
			}

			if (state === 'closing') {
				return;
			}

			await doDispose(api);
			state = 'closing';
			await closingPromise;
			closingPromise = undefined;
			state = 'closed';
		}
	};
})();
