import {
	Connection,
	ResponseError,
	ErrorCodes,
	CancellationToken,
	RequestType
} from 'vscode-languageserver';

const cancelValue = new ResponseError<any>(ErrorCodes.RequestCancelled, 'Request cancelled');

const enum ErrorMessages {
	onRequest = 'onRequest Error',
}

interface ConnectionProxy {
	/**
	 * Installs a request handler described by the given [RequestType](#RequestType).
	 *
	 * @param type The [RequestType](#RequestType) describing the request.
	 * @param handler The handler to install
	 */
	onRequest: <Params, Result>(
		requestType: RequestType<Params, Result, any, any>,
		handler: (params: Params) => Result | Promise<Result>
	) => void
}

const measure = false;

const runSafe: <Handler extends (...args: any) => any>(
	handler: Handler,
	errorMessage: string,
	handlerName?: string
) => (
	params: any,
	token: CancellationToken
) =>
| ReturnType<Handler>
| Promise<ReturnType<Handler>>
| ResponseError<any>
| Promise<ResponseError<any>> = (handler, errorMessage, handlerName = 'handler') => async (
	params,
	token
) => {
	try {
		const NS_PER_MS = 1e6;
		const NS_PER_SEC = 1e9;
		const start = process.hrtime();
		const result = await handler(params);
		const elapsedTime = process.hrtime(start);
		const elapsedTimeMs = (elapsedTime[0] * NS_PER_SEC + elapsedTime[1]) / NS_PER_MS;
		if (measure) {
			console.log(`${handlerName} took: ${elapsedTimeMs}ms`);
		}

		const maxAllowedTime = 1.35;
		if (true && elapsedTimeMs > maxAllowedTime && measure) {
			console.error(`${handlerName} took: ${elapsedTimeMs}ms`);
		}

		if (token.isCancellationRequested) {
			console.error('cancelled');
			return cancelValue;
		}

		return result;
	} catch (error) {
		console.error(errorMessage);
		console.error(error.stack);
		return undefined;
	}
};

export function createConnectionProxy(connection: Connection): ConnectionProxy {
	return {
		onRequest(requestType, handler) {
			connection.onRequest(
				requestType,
				runSafe(handler, ErrorMessages.onRequest, `onRequest: ${requestType.method}`)
			);
		}
	};
}
