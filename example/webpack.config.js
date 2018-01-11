const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const webpackConfig = {
  plugins: []
};

webpackConfig.entry = path.resolve('./index.js');

webpackConfig.output = {
  filename: 'bundle.js',
  path: path.resolve('./dist')
};

webpackConfig.plugins.push(new HTMLPlugin);

webpackConfig.plugins.push(new CleanPlugin(webpackConfig.output.path));

module.exports = webpackConfig;