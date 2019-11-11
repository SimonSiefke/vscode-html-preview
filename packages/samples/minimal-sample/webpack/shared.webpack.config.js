/** @typedef {import('webpack').Configuration} WebpackConfig **/

const merge = require('merge-options')

module.exports = function(/** @type WebpackConfig */ extConfig) {
  /** @type WebpackConfig */
  const defaultConfig = {
    devtool: 'source-map',
    mode: 'production',
    output: {
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  }
  return merge(defaultConfig, extConfig)
}
