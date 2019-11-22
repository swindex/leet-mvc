import { isObject, isArray } from "util";
/**
 * Check if object is empty
 * @param {*} value 
 * @returns {boolean}
 */
export function empty(value){
	return typeof value === "undefined" || value === 0 || value === null || value === "" || value === false;// || (typeof value == 'object' && Object.getOwnPropertyNames(value).length === 0) ;
}

/**
 * Round numeric value to n decimals
 * @param {number} value 
 * @param {number} [n] = 0
 */
export function round(value, n) {
	n = n || 0;
	var scale = Math.pow(10, n);
	return Math.round(value * scale)/scale;
}

/**
 * Convert string formatted as locale number to number
 * @param {string} stringValue
 * @param {string} [locale]
 */
export function numberFromLocaleString(stringValue, locale){
	var parts = Number(1111.11).toLocaleString(locale).replace(/\d+/g,'').split('');
	if (stringValue === null)
		return null;
	if (parts.length==1) {
		parts.unshift('');
	}	
	return Number(String(stringValue).replace(new RegExp(parts[0].replace(/\s/g,' '),'g'), '').replace(parts[1],"."));
}

/**
 * Try calling a function under context.
 * Same as Function.call but with check if callback exists
 * @param {function(*)} callback 
 * @return {any}
 */
export function tryCall(context, callback){
	if (typeof callback !== 'function')
		return;
	return callback.apply(context, argumentsToArray(arguments,2));
}

/**
* Push function arguments into array starting from nStart
* @param {*} args - arguments
* @param {number} [nStart] - argument number to start from. 0 by default
* @return {any[]}
*/
export function argumentsToArray(args,nStart){
   nStart = nStart || 0;
   return Array.prototype.slice.call(args).slice(nStart);
}


/**
 * Override Function or a method 
 * @param {any} originalContext - context to call the original function from
 * @param {function} originalFunction - method or function to override
 * @param {function(function, ...any):any} overrideFunction - callback to execute instead of the original function/method
 * @returns function
 */
export function Override(originalContext, originalFunction, overrideFunction){
	return function(){
		var args = arguments;
		var argsWithNext = argumentsToArray(arguments);
		argsWithNext.unshift(function(){
			return originalFunction.apply(originalContext, arguments.length > 0 ? arguments : args );
		});
		return overrideFunction.apply( originalContext, argsWithNext );
	}
}

/**	
 * Extend Child Class With the Parent   	
 * ***usage***:   	
 *  - class ChildClasss extends BaseClass {} ***SAME AS*** var ChildClass = extend( BaseClass, function ChildClass(params){});  	
 *  - super(Page); ***SAME AS*** this.super(Page);  	
 * 	
 * @param {*} parentConstructor 	
 * @param {*} childConstructor 	
 */	
export function Extend( parentConstructor, childConstructor ){	
	childConstructor.prototype = Object.create( parentConstructor.prototype );	
	childConstructor.prototype.constructor = childConstructor;	
	childConstructor.prototype.super = function(){return parentConstructor.apply(this,arguments);};	
	return childConstructor;	
}

export function GUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function isObjLiteral(_obj) {
	var _test  = _obj;
	return (  typeof _obj !== 'object' || _obj === null ?
				false :  
				(
				  (function () {
					while (!false) {
					  if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
						break;
					  }      
					}
					return Object.getPrototypeOf(_obj) === _test;
				  })()
				)
			);
  }