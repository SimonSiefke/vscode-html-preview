import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as path from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = __dirname

/**
 * @type {(options: {folder:'local'|'remote'|'worker'}) => import('rollup').RollupOptions}
 */
const withDefaults = ({ folder }) => ({
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
      extensions: ['.js', '.ts'],
    }),
    resolve({
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
  ],
})

export default [
  withDefaults({ folder: 'local' }),
  withDefaults({ folder: 'remote' }),
  withDefaults({ folder: 'worker' }),
]
