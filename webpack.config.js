const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const baseConfig = require("./webpack.base.config");
const { merge } = require("webpack-merge");
const path = require('path');

module.exports = (env) => {
  var plugins = [];

  plugins.push(new HtmlWebpackPlugin({ template: './test/index.html' }));

  var out = merge(
    baseConfig(env),
    {
      entry: ['./test/index.test.js'],
      output: {
        path: path.resolve(__dirname, 'dist-test')
      },
      plugins: plugins
    },
    
  );

  console.log(out);
  return out;
};
