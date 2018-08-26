//Webpack 3.xx config for a cordova app
//Stack:
//JavaScript ES6 - > ES2015
//Literal Templates
//Babel
//Polyfill
//SCSS
//CSS
//Autoprefixer
//Copy Assets
//UglifyJS
//HTML Template
//HTML Loader into the JS bundle
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');

const extractSass = new ExtractTextPlugin({
    filename: "generated.css",
});
const webpack = require('webpack');

const path = require('path');

//--env.build = production

module.exports = env => {
	env = env || {};

	var plugins = [
		new CopyWebpackPlugin([
			{ from: 'src/img', to: 'img' },
		]),
		new HtmlWebpackPlugin({template: './src/index.html'}),

		extractSass,
	];

	//if production, use additional plugins
	if (env.build === "production"){
		plugins.push(new WebpackCleanupPlugin(['www']));
		plugins.push(new webpack.optimize.UglifyJsPlugin(
			{
				compress: {
					unused: true,
					dead_code: true,
					warnings: false,
					keep_fnames: true //DO NOT mangle function names: used for page tracking. also do not pass -p into the webpack
				},
				mangle: {
					keep_fnames: true //DO NOT mangle function names: used for page tracking. also do not pass -p into the webpack
				}
			}
		));
	}



	return {
		entry: ['./src/index.js'],
		devtool: env.build != "production" ? "source-map": false,
		output: {
			path: path.resolve(__dirname, 'www'),
			filename: 'bundle.js',
			devtoolModuleFilenameTemplate: "../[resource-path]?[loaders]",
		},
		module: {
			rules: [
				{
					test: /polyfill\.js$/,
					loader:'script-loader'
				},
				{
					test: /\.js$/,
					//exclude: /(jquery)/,
					loader: 'babel-loader'
				},
				{
					test: /\.html$/,
					exclude: /index\.html$/,
					use: 'raw-loader'
				},
				{ test: /\.(jpg|png|gif)$/, loader: "file-loader", options:{name:'[name].[ext]', outputPath: 'img/'} },
				{ test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options:{name:'[name].[ext]', outputPath: 'fonts/'} },
				{
					test: /(\.scss|\.css)$/,
					use: extractSass.extract({
						fallback:'style-loader',
						use:[
							{
								loader:"css-loader",
								options: {
									minimize: true,
									importLoaders: 3,
									sourceMap: env.build != "production" ? true: false
								}
							},
							{
								loader: 'postcss-loader',
								options: {
									plugins: [
										autoprefixer({
											browsers:['Android >= 4', 'iOS >=4']
										})
									],
								}
							},
							{
								loader: 'sass-loader',
							},
							
						]
					})
				}
			]
		},
		plugins: plugins
	}
}
