module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"modules": false ,
				"useBuiltIns": 'entry',
                "corejs": 2,
				"targets": {
					"browsers": ["Android >= 4", "iOS >=4", "IE >= 11"]
				}
			}
		]
	], 
	"plugins": [
		"transform-imports",
		"transform-es2015-template-literals",
		"@babel/plugin-syntax-dynamic-import"
	]
}