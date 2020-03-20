const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const extractSass = new MiniCssExtractPlugin({
	filename: "[name].bundle.[contenthash].css",
	ignoreOrder: false
});
const webpack = require('webpack'); //to access built-in plugins

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

module.exports = env => {
	var mode = (env && env.build) ? env.build : 'development';

	
	//if (env.build != "production")
	//	copyWebpackConfig.push( { from: 'src/index.debug.html', to: 'index.html' } );

	var plugins = [
		new ProgressBarPlugin(),
		new BundleAnalyzerPlugin(),
		new MomentLocalesPlugin({
            localesToKeep: ['fr','es'],
        }),
		extractSass,
	];

	plugins.push( new HtmlWebpackPlugin({template: './test/index.html'}));

	//if production, use additional plugins
	if (env.build === "production"){
		plugins.push(new WebpackCleanupPlugin(['dist-test']));
		/*plugins.push(new UglifyJsPlugin(
			{
				uglifyOptions:{
					keep_fnames: true, //DO NOT mangle function names: used for page tracking. also do not pass -p into the webpack
					keep_classnames: true
				}
			}
		));*/
	}



	return {
		mode:mode,
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
			minimizer: [new UglifyJsPlugin(), new OptimizeCSSAssetsPlugin({})],
		},
		module: {
			rules: [
				{
					test: /polyfill\.js$/,
					loader:'script-loader'
				},
				{
					test: /\.js$/,
					exclude: /@babel(?:\/|\\{1,2})runtime|core-js/,
					loader: 'babel-loader',
				},
				/*{
					test: /\.vue$/,
					loader: ['vue-loader']
				},*/
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
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						{
							loader: 'css-loader',
							options: {
							  importLoaders: 1,
							  minimize: mode != "production" ? true: false,
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

										browsers:['Android >= 7', 'iOS >=9']
									}),
									cssnano({})
								],
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: mode != "production" ? true: false
							}
						},							
					]
				},
				{ test: /\.(woff|woff2|eot|ttf|svg)$/, loader: 'file-loader', options:{name:'[name].[ext]', outputPath: 'fonts/'} },

			]
		},
		plugins: plugins
	}
}
exports.raw = true;