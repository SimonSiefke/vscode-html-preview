const path = require('path')

/**
 * @type {import('webpack').Configuration}
 */
const monacoConfig = {
  entry: {
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
    'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
    'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  externals: { '@microsoft/typescript-etw': 'FakeModule' },
}

/**
 * @type {import('webpack').Configuration}
 */
const localConfig = {
  entry: {
    localMain: './src/local/localMain.ts',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'localMain.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './dist/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  externals: { '@microsoft/typescript-etw': 'FakeModule' },
}

/**
 * @type {import('webpack').Configuration}
 */
const remoteConfig = {
  entry: {
    remoteMain: './src/remote/remoteMain.ts',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'remoteMain.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './dist/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: { '@microsoft/typescript-etw': 'FakeModule' },
}

module.exports = [monacoConfig, localConfig, remoteConfig]
