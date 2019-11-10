import * as path from 'path';
import * as send from 'send';
import * as http from 'http';
import * as es from 'event-stream';
import {parse} from 'url';

let isHtml = false;

function file(filepath: string) {
	if (!filepath.endsWith('.html')) {
		isHtml = false;
		return;
	}

	isHtml = true;
}

export const inject = (injectedCode:string)=>(file:string)=>{
	const bodyIndex = file.lastIndexOf('</body>')
	if(bodyIndex===-1){
		return file + injectedCode
	}
	return file.slice(0, bodyIndex) + injectedCode + file.slice(bodyIndex)
}

const injectCode = (injectedCode: string, stream: any, res: http.ServerResponse) => {
	if (!isHtml) {
		return;
	}

	// @ts-ignore
	const length = injectedCode.length + res.getHeader('Content-Length');
	res.setHeader('Content-Length', length);
	const originalPipe = stream.pipe;
	stream.pipe = function (resp) {
		originalPipe.call(stream, es.replace('</body>', injectedCode + '</body>')).pipe(resp);
	};
};

export function serveStatic({directory, injectedCode}: {injectedCode: string; directory: string}) {
	return (req: http.IncomingMessage, res: http.ServerResponse) => {
		if (req.method !== 'GET' && req.method !== 'HEAD') {
			res.statusCode = 405;
			res.setHeader('Allow', 'GET, HEAD');
			res.setHeader('Content-Length', '0');
			res.end();
			return;
		}

		const url = parse(req.url!);
		const stream = send(req, url.pathname!, {
			root: path.resolve(directory),
			cacheControl: false,
			etag: false,
			lastModified: false
		});

		stream
			.on('file', file)
			.on('stream', stream => injectCode(injectedCode, stream, res))
			.pipe(res);
	};
}
