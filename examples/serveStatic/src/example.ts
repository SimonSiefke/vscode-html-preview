import {serveStatic} from './serveStatic';

import * as http from 'http';

const handler = serveStatic(__dirname, {
	injectedCode: '<h1>injected!!!</h1>'
});

http
	.createServer((req, res) => {
		return handler(req, res, () => {});
	})
	.listen(3000, () => {
		console.log('listening to port 3000');
	});
