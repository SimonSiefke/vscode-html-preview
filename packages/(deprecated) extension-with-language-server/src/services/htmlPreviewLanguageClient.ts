import * as vsl from 'vscode-languageclient';
import * as vscode from 'vscode';

const clientOptions: vsl.LanguageClientOptions = {
	documentSelector: [
		{
			language: 'html',
			scheme: 'file'
		}
	]
};

export async function createHtmlPreviewLanguageClient(
	context: vscode.ExtensionContext
): Promise<vsl.LanguageClient> {
	const serverModule = context.asAbsolutePath(
		'../html-preview-language-server/dist/htmlPreviewLanguageServerMain.js'
	);
	// If the extension is launch in debug mode the debug server options are use
	// Otherwise the run options are used
	const serverOptions: vsl.ServerOptions = {
		run: {module: serverModule, transport: vsl.TransportKind.ipc},
		debug: {
			module: serverModule,
			transport: vsl.TransportKind.ipc,
			options: {execArgv: ['--nolazy', '--inspect=6009']}
		}
	};

	// // // // // // // // \\ \\ \\ \\ \\ \\ \\
	// // // // //                \\ \\ \\ \\ \\
	// // // //                      \\ \\ \\ \\
	// // //        Begin Debug         \\ \\ \\
	// //                                  \\ \\
	//                                        \\
	if (false) {
		const streamLogs = true;
		if (streamLogs) {
			// eslint-disable-next-line global-require

			const WebSocket = require('ws');
			let socket: import('ws') | undefined;

			context.subscriptions.push(
				vscode.commands.registerCommand('htmlLanguageClient.startStreaming', () => {
					// Establish websocket connection
					socket = new WebSocket('ws://localhost:7000');
				})
			);

			// The log to send
			let log = '';
			const websocketOutputChannel: vscode.OutputChannel = {
				name: 'websocket',
				// Only append the logs but send them later
				append(value: string) {
					log += value;
				},
				appendLine(value: string) {
					try {
						JSON.parse(value);
					} catch (error) {
						if (typeof value !== 'object') {
							console.log(value);
						}
					}

					log += value;
					// Don't send logs until WebSocket initialization
					if (socket && socket.readyState === WebSocket.OPEN) {
						socket.send(log);
					}

					log = '';
				},
				clear() {},
				show() {},
				hide() {},
				dispose() {}
			};
			clientOptions.outputChannel = websocketOutputChannel;
		} else {
			const consoleChannel: vscode.OutputChannel = {
				name: 'websocket',
				append() {},
				appendLine(value: string) {
					try {
						JSON.parse(value);
					} catch (error) {
						if (typeof value !== 'object') {
							console.log(value);
						}
					}
				},
				clear() {},
				show() {},
				hide() {},
				dispose() {}
			};
			clientOptions.outputChannel = consoleChannel;
			// clientOptions.outputChannel = vscode.window.createOutputChannel(
			//   'htmlLanguageClient'
			// )
		}
	}
	//                                        \\
	// //                                  \\ \\
	// // //          End Debug         \\ \\ \\
	// // // //                      \\ \\ \\ \\
	// // // // //                \\ \\ \\ \\ \\
	// // // // // // // // \\ \\ \\ \\ \\ \\ \\

	const client = new vsl.LanguageClient(
		'htmlPreviewLanguageClient',
		'HTML Preview Language Client',
		serverOptions,
		clientOptions
	);
	context.subscriptions.push(client.start());
	await client.onReady();
	return client;
}
