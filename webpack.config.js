const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const extractSass = new ExtractTextPlugin({
    filename: "generated.css",
    //disable: process.env.NODE_ENV === "development"
});
const webpack = require('webpack'); //to access built-in plugins

const path = require('path');

//--env.build = production

module.exports = env => {
	env = env || {};

	
	//if (env.build != "production")
	//	copyWebpackConfig.push( { from: 'src/index.debug.html', to: 'index.html' } );

	var plugins = [
		new ProgressBarPlugin(),
		//new BundleAnalyzerPlugin(),
		new MomentLocalesPlugin({
            localesToKeep: ['fr','es'],
        }),
		extractSass,
	];

	plugins.push( new HtmlWebpackPlugin({template: './test/index.html'}));

	//if production, use additional plugins
	if (env.build === "production"){
		plugins.push(new WebpackCleanupPlugin(['dist-test']));
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
				},
				parallel: 4,
				modules:false
			}
		));
	}



	return {
		entry: ['./test/index.test.js'],
		devServer: {
			contentBase: path.join(__dirname, 'dist-test'),
			compress: true,
			port: 9000,
			disableHostCheck: true
		 },
		devtool: env.build != "production" ? "inline-source-map": false,
		output: {
			path: path.resolve(__dirname, 'dist-test'),
			filename: env.build != "production" ? 'bundle.js' : 'bundle.js?c=[chunkhash]',
			devtoolModuleFilenameTemplate: ".[resource-path]?[loaders]",
		},
		module: {
			rules: [
				{
					test: /polyfill\.js$/,
					loader:'script-loader'
				},
				{
					test: /\.js$/,
					//exclude: /(jquery|loadash)/,
					loader: 'babel-loader'
				},
				{
					test: /\.html$/,
					oneOf:[
						{
							resourceQuery: /lazy/, // foo.html?lazy
							loader: 'file-loader',
							options:{name:'[name]-[hash].[ext]', outputPath: 'templates/'}
						},
						{
							//no query :  foo.html
							loader: 'raw-loader',
						}
					],
				},
				{ test: /\.(jpg|png|gif)$/, loader: "file-loader", options:{name:'[name].[ext]', outputPath: 'img/'} },
				{
					test: /\.(scss|css)$/,
					use: extractSass.extract({
						use:[
							{
								loader:"css-loader",
								options: {
									minimize: env.build != "production" ? true: false,
									importLoaders: 3,
									sourceMap: env.build != "production" ? true: false
								}
							},
							{
								loader: 'external-loader'
							},
							{
								loader: 'postcss-loader',
								options: {
									ident: 'postcss',
									plugins: [
										autoprefixer({

											browsers:['Android >= 4', 'iOS >=4']
										}),
										cssnano({})
									],
								}
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: env.build != "production" ? true: false
								}
							},							
							
						]
					})
				},
				{ test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options:{name:'[name].[ext]', outputPath: 'fonts/'} },

			]
		},
		plugins: plugins
	}
}
exports.raw = true;