const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
	target: 'web',
	entry: './src/main.ts',
	output: {
		pathinfo: false,
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	devtool: 'source-map',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src/')
		},
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
							experimentalWatchApi: true,
							compilerOptions: {
								module: 'esnext'
							}
						}
					}
				]
			}
		]
	},
	plugins: [],
	optimization: {
		// removeAvailableModules: false,
		// removeEmptyChunks: false,
		// splitChunks: false
	}
};
