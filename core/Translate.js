/**
 * This function replaces {1},{2},{3}, in LangConstText with corresponding replaceValues
 * @param {string} LangConstText 
 * @param {...string|number} [replaceValues]
 */
export var ReplaceValues = function(LangConstText, replaceValues){
	var args = arguments;
	if (args.length==1)
		return LangConstText;
	return LangConstText.replace(/\{(\d+)\}/g, function(match, contents, offset, input_string){
		return args[contents];
	})
}