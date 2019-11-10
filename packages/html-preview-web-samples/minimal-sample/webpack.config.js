const path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: {
    localMain: './src/local/localMain.ts',
    remoteMain: './src/remote/remoteMain.ts',
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
        include: [path.join(__dirname, 'src/local')],
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, 'src/local/tsconfig.json'),
        },
      },
      {
        test: /\.ts$/,
        include: [path.join(__dirname, 'src/remote')],
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, 'src/remote/tsconfig.json'),
        },
      },
    ],
  },
  devServer: {
    contentBase: __dirname,
    port: 3000,
  },
}
