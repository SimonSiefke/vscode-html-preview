import typescript from 'rollup-plugin-typescript2';
import {terser} from 'rollup-plugin-terser';
// @ts-ignore
import pkg from './package.json';

export default {
	input: 'src/injectedCodeMain.ts',
	output: [
		{
			file: pkg.main,
			format: 'es',
			sourcemap: true
		}
	],
	external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],

	plugins: [
		typescript({
			typescript: require('typescript')
		}),
		terser()
	]
};
