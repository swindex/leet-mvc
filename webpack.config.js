const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const baseConfig = require("./webpack.base.config");
const merge = require("webpack-merge");
const path = require('path');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = (env) => {
  var mode = (env && env.build) ? env.build : 'development';
  var plugins = [];

  if (mode === "production") {
    plugins.push(new WebpackCleanupPlugin(['dist-test']));
  }

  plugins.push(new HtmlWebpackPlugin({ template: './test/index.html' }));

  var out = merge(
    baseConfig(env),
    {
      entry: ['./test/index.test.js'],
      devServer: {
        contentBase: path.join(__dirname, 'dist-test'),
      },
      output: {
        path: path.resolve(__dirname, 'dist-test')
      },
      plugins: plugins
    }
  );

  console.log(out);
  return out;
};
