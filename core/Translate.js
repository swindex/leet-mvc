import { Injector } from "./Injector";
import { isString } from "./helpers";
import { argumentsToArray } from "./helpers";
import { Objects } from "./Objects";

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
  });
};

/**
 * 
 * @param {string|string[]} keyOrText - key string, or [key, subkey] array of strings
 * @param {...string|number} [replaceValues] text items that replace {1},{2},{3} placeholders in the translated text.
 * @return {string}
 */
export function Translate(keyOrText, replaceValues){
  
  if (!Inject['LNG'])
    return keyOrText !== null ? keyOrText.toString() : "";

  if (Array.isArray(keyOrText)) {
    var val = Objects.getPropertyByPath(Inject['LNG'], keyOrText);
    if (val === undefined) {
      var newk = keyOrText.slice();
      newk[keyOrText.length-1] = "" // get default key
      val = Objects.getPropertyByPath(Inject['LNG'], newk);
      if (val === undefined) {
        val = keyOrText[keyOrText.length-1]
      }
    }
    var ret = val;
  } else { 
    var ret = Inject['LNG'][keyOrText] ? Inject['LNG'][keyOrText] : keyOrText;
  }
  if (replaceValues && isString(ret)){
    var args = argumentsToArray(arguments);
    args[0] = ret;
    return ReplaceValues.apply(null,args);
		
  }
  return ret;
}