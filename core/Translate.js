import { Injector } from "leet-mvc/core/Injector";

const Inject = Injector;

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

/**
 * 
 * @param {string} keyOrText 
 * @return {string}
 */
export function Translate(keyOrText){
	if (!Inject['LNG'])
		return keyOrText;

	return Inject['LNG'][keyOrText] ? Inject['LNG'][keyOrText] : keyOrText;
}