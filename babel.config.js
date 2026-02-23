module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"modules": false ,
				"useBuiltIns": 'usage',
                "corejs": 3,
				"targets": {
					"browsers": ["Android >= 4", "iOS >=4", "Chrome >= 30" ,"IE >= 11"]
				}
			}
		],
	], 
	"plugins": [
    "@babel/plugin-proposal-class-properties",
		"@babel/plugin-syntax-dynamic-import"
	]
}
