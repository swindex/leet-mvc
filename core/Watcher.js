import { isObject, isArray, isFunction, isSymbol } from "util";
import { tryCall } from "./helpers";
import { isDate } from "moment";

let isProxy = Symbol("isProxy");
let isDeleted = Symbol("isDeleted");
let isOnTimer = Symbol("isOnTimer");

//window['Proxy'] = null; //comment out to test dirty checking

export var isSkipUpdate = Symbol("isSkipUpdate");
/**
 * The watch function creates proxy from any object and watches its changes. Triggers only when own properties change or properties of its simple properties
 * 
 */
export var Watcher={
	skip: isSkipUpdate,
	deleted: isDeleted,
	/**
	 * @param {object} object
	 * @param {function()} onChangeCallback
	 * @param {string[]} [ignoreProperties]
	 */
	on: function(object, onChangeCallback, ignoreProperties){
		ignoreProperties = ignoreProperties || [];
		object[isDeleted] = false;
		if (window['Proxy'] && window['Reflect']){
			const handler = {
				get(target, property, receiver) {
					if (property == isProxy)
						return true;

					const value = Reflect.get(target, property, receiver)

					//return as-is if its a primitive	
					if (! isObject(value))
						return value;
					if (value && isObject(value) && value[isProxy])
						return value;
					

					//return non-modifiable objects as-is
					const desc = Object.getOwnPropertyDescriptor(target, property)
					if (desc && !desc.writable && !desc.configurable) return value

					//return objects, instantiated with `new` as-is
					if (! isArray(value) && isObject(value) && !isObjLiteral(value))
						return value;
					
					try {
						return new Proxy(target[property], handler);
					} catch (error) {
						return value
					}
				},
				set(target, property, value) {
					//do nothing if value is already the same
					if (value === isSkipUpdate ||
						target[property] === value ||
						isSymbol(property) ||
						property === isSkipUpdate ||
						object[isDeleted] ||
						ignoreProperties.indexOf(property) >= 0  ){

						return Reflect.set(target, property, value);
					}
					if (!object[isSkipUpdate]){
						scheduleCallback(object, onChangeCallback);
					}
					//if target is the object we are watching, and property has method Changed, then call that method
					if (target === object){
						if (isFunction(object[property+"Change_2"])) {
							object[isSkipUpdate] = true;
							object[property+"Change_2"](value);
							object[isSkipUpdate] = false;
						}
						if (isFunction(object[property+"Change"])) {
							object[isSkipUpdate] = true;
							object[property+"Change"](value);
							object[isSkipUpdate] = false;
						}
					}
					return Reflect.set(target, property, value);
				},
				defineProperty(target, property, descriptor) {
					if (property !== isSkipUpdate && !object[isSkipUpdate] && !object[isDeleted] && ignoreProperties.indexOf(property)<=0 )
						scheduleCallback(object, onChangeCallback);
					return Reflect.defineProperty(target, property, descriptor);
				},
				deleteProperty(target, property) {
					if (property !== isSkipUpdate && !object[isSkipUpdate] && !object[isDeleted] && ignoreProperties.indexOf(property)<=0 )
						scheduleCallback(object, onChangeCallback);
					return Reflect.deleteProperty(target, property);
				}
			};
			
			return new Proxy(object, handler);
		}else{
			onObjectDirtyChange(object ,
				(target, property, value)=>{ //property changed callback
					if (target === object){
						if (isFunction(object[property+"Change_2"])) {
							object[isSkipUpdate] = true;
							object[property+"Change_2"](value);
							object[isSkipUpdate] = false;
						}
						if (isFunction(object[property+"Change"])) {
							object[isSkipUpdate] = true;
							object[property+"Change"](value);
							object[isSkipUpdate] = false;
						}
					}
					scheduleCallback(object, onChangeCallback);
				}, ignoreProperties
			);
			return object;
		}	
	},
	off: function( object ){
		object[isDeleted] = true;
	}
}

function scheduleCallback(obj, callback){
	if (obj[isSkipUpdate] || obj[isDeleted])
		return;
	obj[isSkipUpdate] = true;

	setTimeout(function scheduledUpdate(){
		tryCall(null,callback);
		//Notify.call(obj);
		obj[isSkipUpdate] = false;
	},0);
}

function isObjLiteral(_obj) {
	var _test  = _obj;
	return (
		typeof _obj !== 'object' || _obj === null ?
			false :  
			(
				(function () {
					while (!false) {
						_test = Object.getPrototypeOf(_test)
						if ( _test === null || Object.getPrototypeOf(_test) === null ) {
							break;
						}        
					}
					return Object.getPrototypeOf(_obj) === _test;
				})()
			)
	);
}

/**
 * Dirty-Listen to object changes 
 * Callback is fired for every changed property
 * @param {object} object 
 * @param {function(object, string, any):void} callback 
 * @param {string[]} [ignoreProperties]
 */
export function onObjectDirtyChange(object, callback, ignoreProperties){
	ignoreProperties = ignoreProperties || [];

	var refObject = {}; //reference cpy of the object we are watching
	var checkHash = function(){	
		//throttle the request animation to 50ms
		setTimeout(function(){
			var checked = objectCloneCompare(refObject, object, callback, ignoreProperties);
			
			if (!object[isDeleted]){
				refObject = checked;
				window.requestAnimationFrame(checkHash);
			}
		},50);
	}
	window.requestAnimationFrame(checkHash);
}

/**
 * Compares old object and new object. 
 * Does not clone classes or functions. they are compared by reference only.
 * Callback is fired for every changed property.
 * Returns the cloned copy of the new object for subsequent change checking
 * @param {object} oldObj 
 * @param {object} newObj 
 * @param {function(object, string, any):void} changeCallback 
 * @param {string[]} [ignoreProperties]
 * @return {object}
 */
export function objectCloneCompare(oldObj, newObj, changeCallback, ignoreProperties){
	ignoreProperties = ignoreProperties || [];
	var oldKeys = getObjKeys(oldObj);
	var newKeys = getObjKeys(newObj);
	var newChecked = [];
	var ret = isArray(newObj) ? [] : {};

	for (var i in oldKeys){
		var k = oldKeys[i];
		if (newObj[k] !== undefined) {
			//new object has the old key
			if (ignoreProperties.indexOf(k) < 0) {
				//if key is not in the igniore array

				if (isDate(oldObj[k]) && isDate(newObj[k])) {
					if (oldObj[k].getTime() !== newObj[k].getTime()) {
						changeCallback(newObj, k, newObj[k]);
						oldObj[k] = new Date(newObj[k]);
					}
				} else
				if (isObject(oldObj[k]) && isObject(newObj[k])) {
					if (isArray(newObj[k]) || isObjLiteral(newObj[k])) {
						if (oldObj[k].length !== newObj[k].length ) {
							changeCallback(newObj, k, newObj[k]);
						}
						ret[k] = objectCloneCompare(oldObj[k], newObj[k], changeCallback, ignoreProperties)
					} else {
						//new object is not an array and is a complex object
						if (oldObj[k] !== newObj[k]){
							//check them by reference
							changeCallback(newObj, k, newObj[k]);
						}
						//do not scan complex children
						ret[k] = newObj[k]
					} 
				} else
				if (isObject(oldObj[k]) !== isObject(newObj[k])) {
					//old isObject is not the same as new isObject
					changeCallback(newObj, k, newObj[k]);
				} else {
					//in the end compare values the normal way
					if (oldObj[k] !== newObj[k]){
						changeCallback(newObj, k, newObj[k]);
					}
					ret[k] = newObj[k];
				}
			}
			if (ret[k]==undefined) {
				ret[k] = newObj[k];	
			}
			//delete newKey
			newChecked.push(k);
		} else {
			//key does not exist in the new object
			if (oldObj[k] !== undefined) {
				changeCallback(newObj, k, undefined);
			} else{
				//both old and new objects properties are undefined
				newChecked.push(k);
			}
		}
	}
	//iterate over keys that are NOT in the old object
	for (var i in newKeys){
		var k = newKeys[i];
		if (newObj[k] === undefined || newChecked.indexOf(k) >= 0 || ignoreProperties.indexOf(k) >= 0 ) {
			continue;
		}
		
		changeCallback(newObj, k, newObj[k]);
		ret[k] = {}
		if (!isArray(newObj) && !isObjLiteral(newObj)) {
			ret[k] = newObj[k];
		} else {
			ret[k] = objectCloneCompare({}, newObj[k], changeCallback, ignoreProperties)
		}
	}
	if (!isObject(newObj)) {
		return newObj;
	}

	return ret;
} 


function getObjKeys(obj){
	if (isObject(obj)) {
		if (isArray(obj)){
			return Array.apply(null, Array(obj.length)).map(function(v, i){return i});
		} else {
			return Object.keys(obj);
		}
	}
	return [];
}