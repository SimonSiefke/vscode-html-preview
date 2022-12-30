import typescript from '@rollup/plugin-typescript'
// @ts-ignore
import pkg from './package.json' assert { type: 'json' }

export default {
  input: 'src/injectedCodeMain.ts',
  output: [
    {
      file: pkg.main,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],

  plugins: [
    typescript({
      typescript: (await import('typescript')).default,
    }),
  ],
}
