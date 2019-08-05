const withDefaults = require('./shared.webpack.config');
const path = require('path');
const root = path.join(__dirname, '..');

module.exports = withDefaults({
	context: path.join(root, 'packages/injected-code'),
	target: 'web', // injected code runs in the browser
	entry: {
		'injected-code': './src/injectedCodeMain.ts'
	},
	output: {
		filename: 'injectedCodeMain.js',
		path: path.join(root, 'dist/packages/injected-code/dist'),
		libraryTarget: 'var' // build for browser
	}
});
