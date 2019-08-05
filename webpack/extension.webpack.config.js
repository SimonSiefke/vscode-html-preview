const withDefaults = require('./shared.webpack.config');
const path = require('path');
const root = path.join(__dirname, '..');

module.exports = withDefaults({
	context: path.join(root, 'packages/extension'),
	entry: {
		extension: './src/extensionMain.ts'
	},
	output: {
		filename: 'extensionMain.js',
		path: path.join(root, 'dist/packages/extension/dist')
	}
});
