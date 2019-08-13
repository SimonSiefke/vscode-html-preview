import * as WebSocket from 'ws';

export interface WebSocketServer {
	/**
	 * Send a list of commands to all connected clients.
	 */
	readonly broadcast: (commands: object[], {skip}?: {skip?: WebSocket}) => void

	readonly onMessage: (fn: (message: object) => void) => void
	/**
	 * Stop the websocket server. Also stops the underlying http server.
	 */
	readonly stop: () => Promise<void>
}

const nextId = (() => {
	let id = 0;
	return () => id++;
})();

const pendingResults = {};

export function createWebSocketServer(httpServer: import('http').Server): WebSocketServer {
	const webSocketServer = new WebSocket.Server({server: httpServer});
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
	const onMessageListeners: Array<(message: any) => void> = [];
	return {
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
		onMessage: fn => {
			onMessageListeners.push(fn);
		},
		stop() {
			return new Promise((resolve, reject) => {
				webSocketServer.close(error => {
					if (error) {
						reject(error);
					}

					resolve();
				});
			});
		}
	};
}
