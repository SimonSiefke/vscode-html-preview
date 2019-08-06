require('http')
	.get('http://localhost:7575')
	.on('error', () => {
		console.log('could not reload extension');
	})
	.end();
