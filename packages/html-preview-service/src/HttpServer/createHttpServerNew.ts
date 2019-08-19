import * as http from 'http';
import {AddressInfo} from 'net';
import {serveStatic} from './serveStatic';

type Middleware = (req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => void;

export interface HttpServer {
	/**
	 * The port of the server.
	 */
	readonly port: number | undefined
	/**
	 * Start the server.
	 */
	readonly start: ({
		port,
		injectedCode,
		directory
	}: {
	port: number
	injectedCode: string
	directory: string
	}) => Promise<void>

	readonly server: import('http').Server

	readonly stop: () => Promise<void>
	readonly use: (middleware: Middleware) => void
}

export function createHttpServerNew(): HttpServer {
	let httpServer: http.Server;
	const middlewares: Middleware[] = [];
	return {
		get server() {
			if (!httpServer) {
				throw new Error('http server is not ready yet');
			}

			return httpServer;
		},
		get port() {
			return (httpServer.address() as AddressInfo).port;
		},
		use(middleware) {
			middlewares.push(middleware);
		},
		start({port, directory, injectedCode}) {
			middlewares.push(serveStatic({directory, injectedCode}));
			return new Promise((resolve, reject) => {
				const requestListener = (req: http.IncomingMessage, res: http.ServerResponse) => {
					console.log(req.url);
					// TODO dynamic
					middlewares[0](req, res, () =>
						middlewares[1](req, res, () => {
							middlewares[2](req, res, () => {
								throw new Error('no handler');
							});
						})
					);
				};

				httpServer = http.createServer(requestListener);
				httpServer.once('error', reject);
				httpServer.listen(port, resolve);
			});
		},
		stop() {
			return new Promise((resolve, reject) => {
				httpServer.close(error => {
					if (error) {
						reject(error);
					}

					resolve();
				});
			});
		}
	};
}
