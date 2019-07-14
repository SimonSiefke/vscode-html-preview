import WebSocket from 'ws';

/** @typedef{import('./createWebSocketServer.types').WebSocketServer} WebSocketServer */

/**
 * @return {WebSocketServer} websocket server
 */
export function createWebSocketServer() {
	/**
	 * @type {WebSocket.Server}
	 */
	let webSocketServer;
	/**
	 * @type {{[key:string]:any}}
	 */
	const lastCommands = {};
	return {
		get port() {
			return webSocketServer.options.port;
		},
		/**
		 *
		 * @param {{command:string,payload:any}[]} message - the message to broadcast
		 * @param {*} param1
		 */
		broadcast(message, {skip} = {}) {
			for (const {command, payload} of message) {
				lastCommands[command] = payload;
			}

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
				const stringifiedMessage = JSON.stringify(
					Object.entries(lastCommands).map(([key, value]) => ({
						command: key,
						payload: value
					}))
				);
				if (stringifiedMessage) {
					websocket.send(stringifiedMessage);
				}

				// Websocket.on('message', message => {
				// EventEmitter.emit('message', message, websocket);
				// });
			});
		},
		stop() {
			// EventEmitter.removeAllListeners();
			webSocketServer.close();
		}
	};
}
