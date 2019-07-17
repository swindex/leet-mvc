const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const autoprefixer = require('autoprefixer');

const extractSass = new ExtractTextPlugin({
    filename: "generated.css",
    //disable: process.env.NODE_ENV === "development"
});
const webpack = require('webpack'); //to access built-in plugins

const path = require('path');

//--env.build = production

module.exports = {
	stats: 'none',
		entry: ['./spec/index.js'],
		devtool: "inline-source-map",
		output: {
			path: path.resolve(__dirname, './www/'),
			filename: '[name].js',
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
					test: /(\.scss)|(\.css)$/,
					use: extractSass.extract({
						fallback:'style-loader',
						use:[
							{
								loader:"css-loader",
								options: {
									minimize: true,
									importLoaders: 3,
									sourceMap: true
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
		plugins: [
			/*new CopyWebpackPlugin([
				{ from: 'src/img', to: 'img' },
			]),*/
			new HtmlWebpackPlugin({template: './spec/index.html'}),
	
			extractSass,
	
			/*new webpack.ContextReplacementPlugin(
				// The (\\|\/) piece accounts for path separators in *nix and Windows
				/(ionic-angular)|(angular(\\|\/)core(\\|\/)@angular)/,
				path.resolve(__dirname, './../src/'), // location of your src
				{} // a map of your routes
			  )*/
		]
}
