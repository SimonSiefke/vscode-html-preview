import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import {
	createConnection,
	IConnection,
	TextDocuments,
	ServerCapabilities,
	TextDocumentSyncKind,
	TextDocument,
	TextDocumentContentChangeEvent,
	Event,
	TextDocumentChangeEvent
} from 'vscode-languageserver';
import {genDom} from 'html-preview-service';
import {createParser, diff} from 'virtual-dom';
import {createWebSocketServer} from 'html-preview-service';
import {createConnectionProxy} from './connectionProxy';

// Create a connection for the server
const connection: IConnection = createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

const documents = (() => {
	interface UpdateableDocument extends TextDocument {
		update(event: TextDocumentContentChangeEvent, version: number): void
	}
	const _documents: {[key: string]: TextDocument} = {};
	type OnDidOpenTextDocument = (event: TextDocumentChangeEvent) => void;
	let _onDidOpenTextDocument: OnDidOpenTextDocument = () => {};
	type OnDidChangeTextDocument = (
		event: TextDocumentChangeEvent & {contentChanges: TextDocumentContentChangeEvent[]}
	) => void;
	let _onDidChangeTextDocument: OnDidChangeTextDocument = () => {};
	type OnDidCloseTextDocument = (event: TextDocumentChangeEvent) => void;
	let _onDidCloseTextDocument: OnDidCloseTextDocument = () => {};
	const isUpdateableDocument = (value: TextDocument): value is UpdateableDocument => {
		return typeof (value as UpdateableDocument).update === 'function';
	};

	connection.onDidOpenTextDocument(event => {
		const {uri, languageId, version, text} = event.textDocument;
		const document = TextDocument.create(uri, languageId, version, text);
		_documents[uri] = document;
		_onDidOpenTextDocument({document});
	});
	connection.onDidChangeTextDocument(event => {
		console.log('change');
		const td = event.textDocument;
		const changes = event.contentChanges;
		const last: TextDocumentContentChangeEvent | undefined =
			changes.length > 0 ? changes[changes.length - 1] : undefined;
		if (last) {
			const document = _documents[td.uri];
			if (document && isUpdateableDocument(document)) {
				if (td.version === null || td.version === void 0) {
					throw new Error(
						`Recevied document change event for ${td.uri} without valid version identifier`
					);
				}

				document.update(last, td.version);
				_onDidChangeTextDocument({document, contentChanges: event.contentChanges});
			}
		}
		// console.log('update ');
		// // if (event.contentChanges.length === 0) {
		// // 	return;
		// // }

		// const document = _documents[event.textDocument.uri]!;
		// if (!event.textDocument.version) {
		// 	throw new Error('no version');
		// }

		// const last = event.contentChanges[event.contentChanges.length - 1];

		// if (!document || !isUpdateableDocument(document)) {
		// 	return;
		// }

		// console.log('before update');
		// console.log(document.getText());
		// console.log('version', document.version);
		// console.log(document.uri);
		// console.log(JSON.stringify(last, null, 2));
		// document.update(last, event.textDocument.version);
		// console.log('updated');
		// console.log(document.getText());
		// console.log('version', document.version);
		// _onDidChangeTextDocument({document, contentChanges: event.contentChanges});
	});
	connection.onDidCloseTextDocument(event => {
		const document = _documents[event.textDocument.uri]!;
		delete _documents[event.textDocument.uri];
		_onDidCloseTextDocument({document});
	});
	return {
		get(uri: string): TextDocument | undefined {
			return _documents[uri];
		},
		onDidOpenTextDocument(fn: OnDidOpenTextDocument) {
			_onDidOpenTextDocument = fn;
		},
		onDidChangeTextDocument(fn: OnDidChangeTextDocument) {
			_onDidChangeTextDocument = fn;
		},
		onDidCloseTextDocument(fn: OnDidCloseTextDocument) {
			_onDidCloseTextDocument = fn;
		}
	};
})();

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities
connection.onInitialize(() => {
	const capabilities: ServerCapabilities = {
		textDocumentSync: TextDocumentSyncKind.Full
	};
	return {capabilities};
});

let previousText = '';
let previousDom;
const parser = createParser();
let webSocketServer;

connection.onInitialized(async () => {
	webSocketServer = createWebSocketServer();
	const indexJs = fs.readFileSync(
		path.join(__dirname, '../../injected-code/dist/injectedCodeMain.js')
	);
	const httpServer = http.createServer((req, res) => {
		try {
			if (req.url === '/') {
				res.writeHead(200, {'Content-Type': 'text/html'});
				let dom = genDom(previousText);
				const bodyIndex = dom.lastIndexOf('</body');
				previousDom = parser.parse(previousText);
				const $comment = '<!-- Code injected by html-preview -->';
				const $virtualDom = `<script id="virtual-dom">${JSON.stringify(previousDom)}</script>`;
				const $script = '<script defer src="index.js"></script>';
				const $inner = '\n' + $comment + '\n' + $virtualDom + '\n' + $script;
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
});

documents.onDidOpenTextDocument(event => {
	previousText = event.document.getText();
	previousDom = parser.parse(previousText);
});

documents.onDidChangeTextDocument(event => {
	const {document} = event;
	if (!previousText) {
		previousText = document.getText();
		return;
	}

	const newText = document.getText();

	try {
		if (event.contentChanges.length === 1) {
			const change = event.contentChanges[0];
			const edit = {
				rangeOffset: document.offsetAt({character: 4, line: 0}),
				text: change.text,
				rangeLength: change.rangeLength as number
			};
			const oldNodeMap = parser.nodeMap;
			const nextDom = parser.edit(newText, [edit]);
			const newNodeMap = parser.nodeMap;
			const diffs = diff(previousDom, nextDom, {oldNodeMap, newNodeMap});
			previousDom = nextDom;
			previousText = newText;
			webSocketServer.broadcast(diffs, {});
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

const connectionProxy = createConnectionProxy(connection);

// Listen on the connection
connection.listen();
