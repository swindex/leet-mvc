const webpackConfig = require('./spec/webpack.config.js');
//webpackConfig.entry = {};

module.exports = function(config) {
  config.set({
		browsers: ['Chrome'],
		files: [
			// all files ending in "_test"
			'./spec/tests/*-spec.ts',
			'./spec/tests/**/*-spec.ts',
			{ pattern: 'src/img/**/*.png', watched: false, included: false, served: true },
			{ pattern: 'src/img/**/*.svg', watched: false, included: false, served: true },
			// each file acts as entry point for the webpack configuration
		],
		webpack: webpackConfig,
		preprocessors: {
			// add webpack as preprocessor
			'./spec/tests/*-spec.ts': ['webpack','sourcemap'],
			'./spec/tests/**/*-spec.ts': ['webpack','sourcemap'],
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