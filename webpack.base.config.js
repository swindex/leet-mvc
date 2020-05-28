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



module.exports = (env, overrideConfig) => {
  var mode = (env && env.build) ? env.build : 'development';

  var plugins = [
    new ProgressBarPlugin(),
    //new BundleAnalyzerPlugin(),
    new MomentLocalesPlugin({
      localesToKeep: [/*'fr', 'es'*/],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].bundle.[contenthash].css",
      ignoreOrder: false
    })
  ];

  //if production, use additional plugins
  if (mode === "production") {
    plugins.push(new WebpackCleanupPlugin(['www']));
  }

  var base = {
    mode: mode,
    devServer: {
      contentBase: path.join(__dirname, ''),
      compress: true,
      port: 9000,
      disableHostCheck: true
    },
    devtool: mode != "production" ? "inline-source-map" : false,
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
      minimizer: [new UglifyJsPlugin({
        parallel: 4,
        uglifyOptions: {
          mangle: true,
          compress: true,
          keep_classnames: true, //needed for automatic page classname and selector identification
          keep_fnames: true//needed for automatic page classname and selector identification
        }
      }), new OptimizeCSSAssetsPlugin({})],
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
                minimize: mode != "production" ? true : false,
              }
            },
            {
              loader: 'external-downloader'
            },
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
                sourceMap: mode != "production" ? true : false,
              }
            }
          ]
        },
        { test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options: { name: '[name].[ext]', outputPath: 'fonts/' } },

      ]
    },
    plugins: plugins
  };
  return merge(base, overrideConfig);
};
exports.raw = true;