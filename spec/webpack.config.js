const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const merge = require("webpack-merge");
//const require("resolve-url-loader")

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



module.exports = {
    entry: ['./spec/index.js'],
    devServer: {
      inline: false,
      contentBase: path.join(__dirname, ''),
      compress: true,
      port: 9000,
      disableHostCheck: true
    },
    devtool: "inline-source-map",
    output: {
      path: path.resolve(__dirname, 'www'),
      filename: 'bundle.js',
      devtoolModuleFilenameTemplate: (info) => {
        const isGeneratedDuplicate = info.resourcePath.match(/\.vue$/) && info.allLoaders;
        if (isGeneratedDuplicate) {
          return `webpack-generated:///${info.resourcePath}?${info.hash}`;
        }
        return `webpack:///${path.normalize(info.resourcePath)}`;
      },
    },
    optimization: {
      usedExports: true,
      //sideEffects: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /@babel(?:\/|\\{1,2})runtime|core-js/,
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
          test: /\.(scss|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                minimize: true,
              }
            },
            /*{
              loader: 'external-downloader'
            },*/
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  autoprefixer({

                    browsers: ['Android >= 7', 'iOS >=9']
                  }),
                  cssnano({})
                ],
              }
            },

            {
              loader: 'sass-loader',
              options: {
                sourceMap: true ,
              }
            }
          ]
        },
        { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options: { name: '[name].[ext]', outputPath: 'fonts/' } },

      ]
    },
    plugins: [
      new MiniCssExtractPlugin()
    ]
  }
