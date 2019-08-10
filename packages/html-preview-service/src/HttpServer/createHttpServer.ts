import * as http from 'http';
import {AddressInfo} from 'net';

export interface HttpServer {
	/**
	 * The port of the server.
	 */
	readonly port: number | undefined
	/**
	 * Start the websocket server.
	 */
	readonly start: (port?: number) => void
	/**
	 * Stop the websocket server.
	 */
	readonly stop: () => void
	/**
	 * Listen for requests
	 */
	readonly onRequest: (listener: http.RequestListener) => void
}

export function createHttpServer(): HttpServer {
	let httpServer: http.Server;
	let requestListener: http.RequestListener;
	return {
		get port() {
			return (httpServer.address() as AddressInfo).port;
		},
		start(port = 3000) {
			httpServer = http.createServer(requestListener);
			httpServer.on('error', error => {
				throw error;
			});
			return new Promise(resolve => httpServer.listen(port, resolve));
		},
		onRequest: listener => {
			if (requestListener) {
				throw new Error('there is already a request listener');
			}

			requestListener = listener;
		},
		stop() {
			httpServer.close();
		}
	};
}
