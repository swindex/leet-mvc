/**
 * Extend with: 
 * //babel.config.js
 * module.exports = {
 *   extends: require.resolve("leet-mvc/babel.config.js")
 * };
 */
module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"modules": false,
				"corejs": 3,
				"targets": {
					"browsers": ["Android >= 8", "iOS >=11"]
				}
			}
		],
	],
	"plugins": [
		["polyfill-corejs3", { "method": "usage-global", "version": "3.50.0" }],
		"@babel/plugin-transform-class-properties"
	]
}
