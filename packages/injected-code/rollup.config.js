import pluginTypescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
// @ts-ignore
import pkg from './package.json' assert {type:'json'}
import typescript from 'typescript'

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
		pluginTypescript({
			typescript
		}),
		terser({
			mangle: false // keep output readable for debugging, even in production
		})
	]
};
