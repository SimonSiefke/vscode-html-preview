const WebSocket = require('ws');
const http = require('http');

http
	.createServer((req, res) => {
		if (req.url === '/') {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(`<html>
			hello world
			<script>
			const ws = new WebSocket('ws://localhost:3001');
			setInterval(() => {
				ws.send('pong')
			}, 1000);

			</script>
			</html>`);
		}

		res.end();
	})
	.listen(3000);

new WebSocket.Server({port: 3001}).on('connection', ws => {
	ws.on('message', message => {
		console.log('received: %s', message);
	});

	ws.send('something');
});

console.log('listening on http://localhost:3000');
