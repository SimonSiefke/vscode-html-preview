try {
	require('http').get('http://localhost:7575');
} catch (error) {
	console.log('no reload possible');
}
