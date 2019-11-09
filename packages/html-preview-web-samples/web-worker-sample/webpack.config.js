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
        loader: 'ts-loader',
      },
    ],
  },
  devServer: {
    contentBase: __dirname,
    port: 3000,
    open: true,
  },
}
