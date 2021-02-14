const webpackConfig = require('./spec/webpack.config.js');
//webpackConfig.entry = {};

module.exports = function(config) {
  config.set({
		browsers: ['Chrome'],
		files: [
			// all files ending in "_test"
			'./spec/tests/*-spec.js',
			'./spec/tests/**/*-spec.js',
			{ pattern: 'src/img/**/*.png', watched: false, included: false, served: true },
			{ pattern: 'src/img/**/*.svg', watched: false, included: false, served: true },
			// each file acts as entry point for the webpack configuration
		],
		webpack: webpackConfig,
		preprocessors: {
			// add webpack as preprocessor
			'./spec/tests/*-spec.js': ['webpack','sourcemap'],
			//'./spec/tests/**/*-spec.js': ['webpack']
		},

		proxies: {
			'/img/': '/base/img/'
		},

        frameworks: ['jasmine'],
        

		reporters: ['spec'],//config.coverage ? ['kjhtml', 'dots', 'coverage-istanbul'] : ['kjhtml', 'dots'],
		specReporter: {
			maxLogLines: 5,         // limit number of lines logged per test
			suppressErrorSummary: true,  // do not print error summary
			suppressFailed: false,  // do not print information about failed tests
			suppressPassed: false,  // do not print information about passed tests
			suppressSkipped: true,  // do not print information about skipped tests
			showSpecTiming: false // print the time elapsed for each spec
		},
		//logLevel:config.LOG_ERROR,

		webpackMiddleware: {
			noInfo: true
		}
    });
};