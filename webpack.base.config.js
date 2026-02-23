const TerserPlugin = require("terser-webpack-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');

module.exports = (env, options = {}) => {
  var production = env.production
  
  // Default static directory relative to consumer's project
  const defaultStaticConfig = {
    directory: path.resolve(process.cwd(), './src/static'),
    publicPath: '/static'
  };
  
  // Allow consumers to override
  const staticConfig = options.staticDirectory || defaultStaticConfig;

  var plugins = []

  plugins.push(new ProgressBarPlugin());
  
  // Add CopyWebpackPlugin (runs in both dev and production)
  // Note: v5 API uses array directly instead of patterns object
  plugins.push(new CopyWebpackPlugin([
    { from: staticConfig.directory, to: 'static', noErrorOnMissing: true }
  ]));

  var base = {
    mode: production ? "production":"development",
    devServer: {
      host: '0.0.0.0',
      historyApiFallback: true,
      compress: true,
      port: 9000,
      client: {
        overlay: false,
      },
      static: staticConfig
    },
    optimization: (production ? {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          compress: {
            drop_console: true, // Remove console.log statements
          },
          mangle: true, // Shorten variable names
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
          //exclude: /index\.html$/,  // Exclude index.html from html-loader
          use: [
            {
              loader: 'html-loader',
              options:{
                esModule:true,
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
              loader:"sass-loader",
              options: {
                api: 'modern'  // Use modern Dart Sass API instead of legacy
              }
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
