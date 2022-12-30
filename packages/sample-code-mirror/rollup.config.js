import * as path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { terser } from '@rollup/plugin-terser'
import sourcemaps from 'rollup-plugin-sourcemaps'
import commonjs from '@rollup/plugin-commonjs'

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
    typescript({
      typescript: require('typescript'),
      tsconfig: path.join(root, `src/${folder}/tsconfig.json`),
    }),
    terser({
      mangle: false,
    }),
    resolve(),
    // @ts-ignore
    sourcemaps(),
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
