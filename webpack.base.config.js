const TerserPlugin = require("terser-webpack-plugin");
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const path = require('path');

//--env.build = production

/*
//Use the following path overrides for debuging.
"sourceMapPathOverrides": {
	"webpack:///src/*": "${workspaceFolder}/src/*",
	"webpack:///./src/*": "${workspaceFolder}/src/*",
	"webpack-generated:///src/*": "${workspaceFolder}/src/*",
	"webpack:///node_modules/*": "${workspaceFolder}/node_modules/*",
}
*/



module.exports = (env) => {
  var mode = (env && env.build) ? env.build : 'development';

  var plugins = []

  plugins.push(new ProgressBarPlugin());
  plugins.push(new MomentLocalesPlugin({localesToKeep: [/*'fr', 'es'*/]}))
  //plugins.push(new HtmlWebpackPlugin({ template: './src/index.html' }));

  //if production, use additional plugins
  if (mode === "production") {
    //plugins.push(new WebpackCleanupPlugin(['www']));
  }

  var base = {
    mode: mode,
    devServer: {
      contentBase: path.join(__dirname, ''),
      compress: true,
      port: 9000,
      disableHostCheck: true
    },
    optimization: (mode=="production" ? {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        },
      })],
    } : {}),
    devtool: mode != "production" ? "inline-source-map" : false,
    output: {
      path: path.resolve(__dirname, 'www'),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /@babel(?:\/|\\{1,2})runtime|core-js/,
          loader: 'babel-loader',
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'raw-loader',
            },
          ],
        },
        { test: /\.(jpg|png|gif)$/, loader: "file-loader", options: { name: '[name].[ext]', outputPath: 'img/' } },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options: { name: '[name].[ext]', outputPath: 'fonts/' } },

      ]
    },
    plugins: plugins
  };
  return base;
};
exports.raw = true;