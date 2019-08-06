import * as WebSocket from 'ws';

interface WebSocketServer {
	/**
	 * The port of the server.
	 */
	readonly port: number | undefined
	/**
	 * Send a message to all connected clients.
	 */
	readonly broadcast: (message: any, {skip}: {skip?: WebSocket}) => void
	/**
	 * Start the websocket server.
	 */
	readonly start: (port?: number) => void
	/**
	 * Stop the websocket server.
	 */
	readonly stop: () => void
}

const nextId = (() => {
	let id = 0;
	return () => id++;
})();

const pendingResults = {};

export function createWebSocketServer(): WebSocketServer {
	let webSocketServer: WebSocket.Server;
	/**
	 * @type {{[key:string]:any}}
	 */
	return {
		get port() {
			return webSocketServer.options.port;
		},
		broadcast(messages: {command: string; payload: any}[], {skip}: any = {}) {
			const id = nextId();
			pendingResults[id] = {
				start: process.hrtime()
			};
			const stringifiedMessage = JSON.stringify({messages, id});
			for (const client of webSocketServer.clients) {
				if (skip !== client && client.readyState === WebSocket.OPEN) {
					client.send(stringifiedMessage);
				}
			}
		},
		start(port = 3000) {
			webSocketServer = new WebSocket.Server({port});
			webSocketServer.on('connection', websocket => {
				websocket.onmessage = ({data}) => {
					const {id} = JSON.parse(data.toString());
					const {start} = pendingResults[id];
					const end = Math.round(process.hrtime(start)[1] / 1000000);
					if (end > 15) {
						// this.broadcast([
						// 	{command: 'error', payload: ` - performance violation: handler took ${end}ms`}
						// ]);
					}

					console.log(end);
					// console.log(end / 1000000);
					// console.log(id);
				};
			});
		},
		stop() {
			webSocketServer.close();
		}
	};
}
