import { Injector } from "./Injector";
import { isString } from "util";
import { argumentsToArray } from "./helpers";

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
 * @param {...string|number} [replaceValues] text items that replace {1},{2},{3} placeholders in the translated text.
 * @return {string}
 */
export function Translate(keyOrText, replaceValues){
	if (!Inject['LNG'])
		return keyOrText;

	var ret = Inject['LNG'][keyOrText] ? Inject['LNG'][keyOrText] : keyOrText;
	if (replaceValues && isString(ret)){
		var args = argumentsToArray(arguments);
		args[0] = ret;
		return ReplaceValues.apply(null,args);
		
	}
	return ret;
}