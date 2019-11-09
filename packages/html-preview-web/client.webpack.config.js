module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/local/localMain.ts',
  output: {
    filename: 'localMain.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
}
