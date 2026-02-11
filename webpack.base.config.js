const TerserPlugin = require("terser-webpack-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const path = require('path');

module.exports = (env) => {
  var production = env.production

  var plugins = []

  plugins.push(new ProgressBarPlugin());

  var base = {
    mode: production ? "production":"development",
    devServer: {
      compress: true,
      port: 9000,
    },
    optimization: (production ? {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        },
      })],
    } : {}),
    devtool: !production ? "inline-source-map" : false,
    output: {
      path: path.resolve(__dirname, 'www'),
      filename: 'bundle.js',
      clean: true,
      //devtoolModuleFilenameTemplate: info => `webpack:/leet-mvc/${info.resourcePath.replace(/^\.\//, "")}`,
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
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
          oneOf: [
            {
              include: /node_modules[\/\\]leet-mvc/,
              use: [
                { loader: "babel-loader", options: { sourceMaps: true } },
                {
                  loader: "ts-loader",
                  options: {
                    transpileOnly: true,
                    configFile: path.resolve(__dirname, "../../tsconfig.json"),
                    compilerOptions: { declaration: false, sourceMap: true, inlineSources: true },
                  },
                },
              ],
            },
            {
              exclude: /node_modules/,
              use: [
                { loader: "babel-loader", options: { sourceMaps: true } },
                {
                  loader: "ts-loader",
                  options: { compilerOptions: { sourceMap: true, inlineSources: true } },
                },
              ],
            },
          ],
        },
        {
          test: /\.html$/,
          exclude: /index\.html$/,  // Exclude index.html from html-loader
          use: [
            {
              loader: 'html-loader',
              options:{
                esModule:true,
                // Disables attributes processing
                //sources: false,
              }
            },
          ],
        },
        {
          test: /\.(scss|css)$/i,
          use: [
            "style-loader",
            { 
              loader:"css-loader", 
              options: {
                modules:"global"
              }
            },
            {
              loader:"postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "autoprefixer",
                    ],
                  ],
                },
              },
            },
            {
              loader:"sass-loader"
            },
          ],
        },
        { 
          test: /\.(jpg|png|gif)$/, 
          type: 'asset/resource',
          generator: {
            filename: 'img/[name][ext]',
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]',
          },
        },
      ]
    },
    plugins: plugins
  };
  return base;
};
