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
 * Try calling a function under context.
 * Same as Function.call but with check if callback exists
 * @param {function(*)} callback 
 * @return {boolean}
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
*/
export function argumentsToArray(args,nStart){
   nStart = nStart || 0;
   return Array.prototype.slice.call(args).slice(nStart);
}


/**
 * Override Function or a method 
 * @param {any} context - contect to call the original function from
 * @param {function} method - method or function to override
 * @param {function(...any)} callback - the new implementation. callback to original function is injected info the method's super property
 */
export function Override(context, method, callback){
	var f = function(){
		var args = arguments;
		f.super = function(){
			if (arguments.length>0)
				method.apply(context,arguments);
			else
				method.apply(context,args)
		};
		callback.apply(context, args);
	}
	f.super = function(){};
	return f;
}

/*Function.prototype['Override'] = function(func){
	var superFunction = this;
	return function(){
		this.super = superFunction;
		return func.apply(this,arguments);
	};
};*/
/**
 * This function creates proxy from any object and watches its changes. Triggers only when own properties change or properties of its simple properties
 * @param {*} object 
 * @param {function} onChangeCallback 
 */
export function  onChange(object, onChangeCallback){
	//var builtin = ['Object','Array','Date'];
	const handler = {
		get(target, property, receiver) {
			const desc = Object.getOwnPropertyDescriptor(target, property)
			const value = Reflect.get(target, property, receiver)
			
			//return non-modifiable objects as-is
			if (desc && !desc.writable && !desc.configurable) return value

			//return objects, instantiated with `new` as-is
			if (! isArray(value) && isObject(value) && !isObjLiteral(value))
				return value;
			
			//return as-is if its a primitive	
			if (! isObject(value))
				return value;

			try {
				return new Proxy(target[property], handler);
			} catch (error) {
				return value
			}
		},
		defineProperty(target, property, descriptor) {
			onChangeCallback(target,property);
			return Reflect.defineProperty(target, property, descriptor);
		},
		deleteProperty(target, property) {
			onChangeCallback(target,property);
			return Reflect.deleteProperty(target, property);
		}
	};
	return new Proxy(object, handler);
};

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

export function GUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}