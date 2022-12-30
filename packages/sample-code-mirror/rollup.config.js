import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import * as path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { babel } from '@rollup/plugin-babel'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = __dirname

/**
 * @type {(options: {folder:'local'|'remote', commonjsPlugin?: any}) => import('rollup').RollupOptions}
 */
const withDefaults = ({ folder, commonjsPlugin = commonjs() }) => ({
  input: path.join(root, `src/${folder}/${folder}Main.ts`),
  output: [
    {
      file: path.join(root, `dist/${folder}Main.js`),
      format: 'iife',
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts'],
      babelHelpers: 'bundled',
      exclude: ['node_modules'],
    }),
    terser({
      mangle: false,
    }),
    resolve(),
    commonjsPlugin,
  ],
})

export default [
  withDefaults({
    folder: 'local',
    commonjsPlugin: commonjs({
      namedExports: {
        'node_modules/codemirror/lib/codemirror.js': ['fromTextArea'],
      },
    }),
  }),
  withDefaults({ folder: 'remote' }),
]
