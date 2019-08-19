import * as path from 'path';
import * as send from 'send';
import * as http from 'http';
import * as fs from 'fs';
import * as es from 'event-stream';
import {parse} from 'url';

let bodyIndex: number;
let isHtml = false;

function file(filepath: string) {
	if (!filepath.endsWith('.html')) {
		isHtml = false;
		return;
	}

	isHtml = true;

	const contents = fs.readFileSync(filepath, 'utf-8');
	bodyIndex = contents.lastIndexOf('</body>');
	if (bodyIndex === -1) {
		bodyIndex = contents.length;
	}
}

const injectCode = (injectedCode: string, stream: any, res: http.ServerResponse) => {
	if (!isHtml) {
		return;
	}

	// @ts-ignore
	const len = injectedCode.length + res.getHeader('Content-Length');
	res.setHeader('Content-Length', len);
	const originalPipe = stream.pipe;
	stream.pipe = function (resp) {
		originalPipe.call(stream, es.replace('</body>', injectedCode + '</body>')).pipe(resp);
	};
};

export function serveStatic(directory: string, {injectedCode}: {injectedCode: string}) {
	return (req: http.IncomingMessage, res: http.ServerResponse, next) => {
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			res.statusCode = 405;
			res.setHeader('Allow', 'GET, HEAD');
			res.setHeader('Content-Length', '0');
			res.end();
			return;
		}

		const url = parse(req.url);
		const stream = send(req, url.pathname!, {
			root: path.resolve(directory),
			cacheControl: false,
			etag: false,
			lastModified: false
		});

		stream
			.on('stream', stream => injectCode(injectedCode, stream, res))
			.on('file', file)
			.pipe(res);
	};
}
