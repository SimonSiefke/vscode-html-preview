const withDefaults = require('./shared.webpack.config')
const path = require('path')

const root = path.join(__dirname, '..')

module.exports = withDefaults({
  entry: {
    localMain: path.resolve(root, 'src/local/localMain.ts'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(root, 'src/local/tsconfig.json'),
          transpileOnly: true,
        },
      },
    ],
  },
})
