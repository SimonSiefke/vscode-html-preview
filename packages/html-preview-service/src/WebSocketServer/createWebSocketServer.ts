import * as WebSocket from 'ws';

interface WebSocketServer {
	/**
	 * The port of the server.
	 */
	readonly port: number | undefined
	/**
	 * Send a list of commands to all connected clients.
	 */
	readonly broadcast: (commands: RemoteCommand[], {skip}?: {skip?: WebSocket}) => void
	/**
	 * Start the websocket server.
	 */
	readonly start: (port?: number) => void
	/**
	 * Stop the websocket server.
	 */
	readonly stop: () => void

	readonly onMessage: (fn: (message: LocalCommandWebsocketMessage) => void) => void
}

const nextId = (() => {
	let id = 0;
	return () => id++;
})();

const pendingResults = {};

export function createWebSocketServer(): WebSocketServer {
	let webSocketServer: WebSocket.Server;
	const onMessageListeners: Array<(message: any) => void> = [];
	return {
		get port() {
			return webSocketServer.options.port;
		},
		broadcast(messages, options = {}) {
			const id = nextId();
			pendingResults[id] = {
				start: process.hrtime()
			};
			const stringifiedMessage = JSON.stringify({messages, id, type: 'request'});
			for (const client of webSocketServer.clients) {
				if (options.skip !== client && client.readyState === WebSocket.OPEN) {
					client.send(stringifiedMessage);
				}
			}
		},
		start(port = 3000) {
			webSocketServer = new WebSocket.Server({port});
			webSocketServer.on('connection', websocket => {
				websocket.on('message', data => {
					const message = JSON.parse(data.toString());
					onMessageListeners.forEach(fn => fn(message));
					// const {id} = JSON.parse(data.toString());
					// const {start} = pendingResults[id];
					// const end = Math.round(process.hrtime(start)[1] / 1000000);
					// if (end > 15) {
					// this.broadcast([
					// 	{command: 'error', payload: ` - performance violation: handler took ${end}ms`}
					// ]);
					// }

					// console.log(end);
					// console.log(end / 1000000);
					// console.log(id);
				});
			});
		},
		onMessage: fn => {
			onMessageListeners.push(fn);
		},
		stop() {
			webSocketServer.close();
		}
	};
}
