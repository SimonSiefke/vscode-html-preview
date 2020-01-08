import {
	createConnection,
	IConnection,
	TextDocuments,
	ServerCapabilities,
	TextDocumentSyncKind
} from 'vscode-languageserver';
import {createConnectionProxy} from './connectionProxy';
import {createWebSocketServer} from 'html-preview-service';
import * as http from 'http';
import {genDom} from 'html-preview-service';
import * as fs from 'fs';
import * as path from 'path';
import {diff, createParser} from '@htmlpit/virtual-dom';

// Create a connection for the server
const connection: IConnection = createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// Create a text document manager.
// const documents: TextDocuments = new TextDocuments(TextDocumentSyncKind.Incremental);
const documents: TextDocuments = new TextDocuments(TextDocumentSyncKind.Full);

console.log('running');
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

setInterval(() => {
	console.log(documents.all().length);
}, 200);

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities
connection.onInitialize(() => {
	const capabilities: ServerCapabilities = {
		textDocumentSync: documents.syncKind
	};
	return {capabilities};
});

// connection.onDidOpenTextDocument(params => {
// 	console.log(documents.all().length);
// 	console.log('open');
// 	// A text document was opened in VS Code.
// 	// params.uri uniquely identifies the document. For documents stored on disk, this is a file URI.
// 	// params.text the initial full content of the document.
// });

// connection.onDidChangeTextDocument(event => {
// 	event.textDocument.uri;
// 	console.log(documents.all().length);

// 	// console.log(docu)
// 	console.log('change');
// 	// The content of a text document has change in VS Code.
// 	// params.uri uniquely identifies the document.
// 	// params.contentChanges describe the content changes to the document.
// });

// connection.onDidCloseTextDocument(params => {
// 	console.log(documents.all().length);

// 	console.log('close');
// 	// A text document was closed in VS Code.
// 	// params.uri uniquely identifies the document.
// });

// connection.onDidChangeTextDocument(event => {
// 	const document = documents.get(event.textDocument.uri);
// 	console.log(documents.all().length);
// 	console.log(document);
// 	console.log('did change text document');
// 	console.log(JSON.stringify(event.contentChanges));
// 	if (!document) {
// 		return;
// 	}

// 	if (document.languageId !== 'html') {
// 		return;
// 	}

// 	if (event.contentChanges.length === 0) {
// 		return;
// 	}

// 	if (!previousText) {
// 		previousText = document.getText();
// 		return;
// 	}

// 	const newText = document.getText();

// 	try {
// 		if (event.contentChanges.length === 1) {
// 			const change = event.contentChanges[0];
// 			console.log(change);
// 			const oldNodeMap = parser.nodeMap;
// 			const nextDom = parser.edit(newText, [change]);
// 			const newNodeMap = parser.nodeMap;
// 			const diffs = diff(previousDom, nextDom, {oldNodeMap, newNodeMap});
// 			console.log(nextDom.pretty());
// 			previousDom = nextDom;
// 			webSocketServer.broadcast(diffs, {});
// 			previousText = newText;
// 			console.log(diffs);
// 		} else {
// 			console.log(event.contentChanges);
// 			console.log('sorry no diffs');
// 			webSocketServer.broadcast(
// 				[
// 					{
// 						command: 'error',
// 						payload: 'too many changes'
// 					}
// 				],
// 				{}
// 			);
// 		}
// 	} catch (error) {
// 		console.error(error);
// 	}
// });

const previousText = '';
let previousDom;
const parser = createParser();
let webSocketServer;

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
// documents.onDidChangeContent(change => {
// 	previousText = change.document.getText();
// 	previousDom = parser.parse(previousText);
// });

// connection.ondidchan
// connection.onDidOpenTextDocument(event => {
// 	if (event.textDocument.languageId !== 'html') {
// 		throw new Error('not html');
// 	}

// 	previousText = event.textDocument.text;
// 	previousDom = parser.parse(previousText);

// 	console.log('open document');
// });

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
	console.log('html preview initialized');
});

const connectionProxy = createConnectionProxy(connection);

// Listen on the connection
connection.listen();
