const fs = require('fs');
const path = require('path');
const data = fs
	.readFileSync(path.join(__dirname, '../packages/extension/dist/extensionMain.js'), 'utf-8')
	.replace('const AutoReload = require("./autoreload");', 'const AutoReload = {activate(){}}');

const request = require('http').request({
	method: 'POST',
	hostname: 'localhost',
	port: 7575,
	headers: {
		// 'Content-Type': 'application/',
		'Content-Length': data.length
	}
});

request.on('error', error => {
	console.log('could not reload extension');
	console.error(error);
});
request.write(data);
request.end();
console.log('reloaded extension');
