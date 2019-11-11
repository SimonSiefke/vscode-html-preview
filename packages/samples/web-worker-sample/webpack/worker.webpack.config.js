const withDefaults = require('./shared.webpack.config')
const path = require('path')

const root = path.join(__dirname, '..')

module.exports = withDefaults({
  entry: {
    workerMain: path.resolve(root, 'src/worker/workerMain.ts'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(root, 'src/worker/tsconfig.json'),
          transpileOnly: true,
        },
      },
    ],
  },
})
