import * as path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import sourcemaps from 'rollup-plugin-sourcemaps'
import commonjs from 'rollup-plugin-commonjs'

const root = __dirname

/**
 * @type {(options: {folder:'local'|'remote', additionalPlugins?: any[]}) => import('rollup').RollupOptions}
 */
const withDefaults = ({ folder, additionalPlugins = [] }) => ({
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
    ...additionalPlugins,
  ],
})

export default [
  withDefaults({
    folder: 'local',
    additionalPlugins: [
      commonjs({
        namedExports: {
          'node_modules/codemirror/lib/codemirror.js': ['fromTextArea'],
        },
      }),
    ],
  }),
  withDefaults({ folder: 'remote' }),
]
