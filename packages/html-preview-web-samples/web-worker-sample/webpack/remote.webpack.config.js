const withDefaults = require('./shared.webpack.config')
const path = require('path')

const root = path.join(__dirname, '..')

module.exports = withDefaults({
  devtool: 'inline-source-map',
  entry: {
    remoteMain: path.resolve(root, 'src/remote/remoteMain.ts'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(root, 'src/remote/tsconfig.json'),
          transpileOnly: true,
        },
      },
    ],
  },
})
