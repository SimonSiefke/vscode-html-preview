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

export function createWebSocketServer(): WebSocketServer {
	let webSocketServer: WebSocket.Server;
	/**
	 * @type {{[key:string]:any}}
	 */
	// const lastCommands = {};
	return {
		get port() {
			return webSocketServer.options.port;
		},
		broadcast(message: {command: string; payload: any}[], {skip}: any = {}) {
			// For (const {command, payload} of message) {
			// lastCommands[command] = payload;
			// }

			const stringifiedMessage = JSON.stringify(message);
			for (const client of webSocketServer.clients) {
				if (skip !== client && client.readyState === WebSocket.OPEN) {
					client.send(stringifiedMessage);
				}
			}
		},
		start(port = 3000) {
			webSocketServer = new WebSocket.Server({port});
			webSocketServer.on('connection', websocket => {
				// Const stringifiedMessage = JSON.stringify(
				// 	Object.entries(lastCommands).map(([key, value]) => ({
				// 		command: key,
				// 		payload: value
				// 	}))
				// );
				// if (stringifiedMessage) {
				// 	websocket.send(stringifiedMessage);
				// }
				// Websocket.on('message', message => {
				// EventEmitter.emit('message', message, websocket);
				// });
			});
		},
		stop() {
			webSocketServer.close();
		}
	};
}
