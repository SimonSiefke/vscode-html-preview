import * as http from 'http';
import {AddressInfo} from 'net';

export interface HttpServer {
	/**
	 * The port of the server.
	 */
	readonly port: number | undefined
	/**
	 * Start the server.
	 */
	readonly start: (port?: number) => Promise<void>
	/**
	 * Listen for requests
	 */
	readonly onRequest: (listener: http.RequestListener) => void

	readonly server: import('http').Server
}

export function createHttpServer(): HttpServer {
	let httpServer: http.Server;
	let requestListener: http.RequestListener;
	return {
		get server() {
			return httpServer;
		},
		get port() {
			return (httpServer.address() as AddressInfo).port;
		},
		start(port = 3000) {
			return new Promise((resolve, reject) => {
				httpServer = http.createServer(requestListener);
				httpServer.once('error', reject);
				httpServer.listen(port, resolve);
			});
		},
		onRequest: listener => {
			if (requestListener) {
				throw new Error('there is already a request listener');
			}

			requestListener = listener;
		}
	};
}
