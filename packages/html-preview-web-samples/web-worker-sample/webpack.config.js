const path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: {
    localMain: './src/local/localMain.ts',
    remoteMain: './src/remote/remoteMain.ts',
    workerMain: './src/worker/workerMain.ts',
  },
  output: {
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src/local')],
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'src/local/tsconfig.json'),
          transpileOnly: true,
        },
      },
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src/remote')],
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'src/remote/tsconfig.json'),
          transpileOnly: true,
        },
      },
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src/worker')],
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'src/worker/tsconfig.json'),
          transpileOnly: true,
        },
      },
    ],
  },
  devServer: {
    contentBase: __dirname,
    port: 3000,
  },
}
