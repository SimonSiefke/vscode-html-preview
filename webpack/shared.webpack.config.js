/* eslint-disable func-names */

/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const _ = require('lodash');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = function withDefaults(/** @type WebpackConfig & {context:string} */ extConfig) {
	/** @type WebpackConfig */
	const defaultConfig = {
		// mode: 'production', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
		target: 'node', // extensions run in a node context
		node: {
			__dirname: false // leave the __dirname-behaviour intact
		},
		resolve: {
			mainFields: ['module', 'main'],
			extensions: ['.ts', '.js'] // support ts-files and js-files
		},
		optimization: {
			// minimize: false
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					exclude: /node_modules/,
					use: [
						{
							// configure TypeScript loader:
							// enable sources maps for end-to-end source maps
							loader: 'ts-loader',
							options: {
								compilerOptions: {
									sourceMap: true
								}
							}
						}
					]
				}
			]
		},
		externals: {
			vscode: 'commonjs vscode', // ignored because it doesn't exist
			bufferutil: 'commonjs bufferutil', // optional dependency of ws
			'utf-8-validate': 'commonjs utf-8-validate' // optional dependency of ws
		},
		output: {
			// all output goes into `dist`.
			// packaging depends on that and this must always be like it
			filename: '[name].js',
			path: path.join(extConfig.context, 'dist'),
			libraryTarget: 'commonjs'
		},
		// yes, really source maps
		devtool: 'source-map',
		plugins: [new CircularDependencyPlugin()]
	};

	return _.merge(defaultConfig, extConfig);
};
