import { withDefaults } from './shared.rollup.config'
import commonjs from 'rollup-plugin-commonjs'

export default withDefaults({
  folder: 'local',
  additionalPlugins: [
    commonjs({
      namedExports: {
        'node_modules/codemirror/lib/codemirror.js': ['fromTextArea'],
      },
    }),
  ],
})
