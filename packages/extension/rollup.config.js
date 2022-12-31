const pluginTypescript = require('@rollup/plugin-typescript').default
// @ts-ignore
const pkg = require('./package.json')
const typescript = require('typescript')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const commonJs = require('@rollup/plugin-commonjs').default
const json = require('@rollup/plugin-json').default

module.exports = {
  input: 'src/extensionMain.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: [],
  plugins: [
    pluginTypescript({
      typescript,
    }),
    nodeResolve(),
    commonJs(),
    json(),
  ],
}
