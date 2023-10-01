module.exports = {
	"presets": [
		[
			"@babel/preset-env",
			{
				"modules": false ,
				"useBuiltIns": 'entry',
                "corejs": 2,
				"targets": {
					"browsers": ["Android >= 4", "iOS >=4", "Chrome >= 30" ,"IE >= 11"]
				}
			}
		],
    [
      "@babel/preset-typescript"
    ]
	], 
	"plugins": [
    "@babel/plugin-proposal-class-properties",
		"transform-es2015-template-literals",
		"@babel/plugin-syntax-dynamic-import"
	]
}