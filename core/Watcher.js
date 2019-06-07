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
					if ((target === object || target.constructor === object.constructor)){
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
			
			/*Notify.add(onDirtyChangeEvent(object ,()=>{
				onChangeCallback();
			}));*/

			return new Proxy(object, handler);
		}else{
			onObjectDirtyChange(object ,()=>{
				onChangeCallback();
			}, ignoreProperties);
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
	//return isObject(_obj) && _obj.toString() === "[object Object]";
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
 * 
 * @param {object} obj 
 * @param {function()} callback 
 * @param {string[]} [ignoreProperties]
 */
function onDirtyChange(obj, callback, ignoreProperties){
	ignoreProperties = ignoreProperties || [];

	obj[isOnTimer] = true;	
	var pHash = hashObject(obj, ignoreProperties);
	var checkHash = function(){	
		//throttle the request animation to 50ms
		setTimeout(function(){
			var hash = hashObject(obj, ignoreProperties);
			if (hash !== pHash){
				pHash = hash;
				tryCall(null,callback);
			}
			if (!obj[isDeleted])
				window.requestAnimationFrame(checkHash);
		},50);
	}
	window.requestAnimationFrame(checkHash);
}

/**
 * 
 * @param {object} object 
 * @param {function()} callback 
 * @param {string[]} [ignoreProperties]
 */
function onObjectDirtyChange(object, callback, ignoreProperties){
	ignoreProperties = ignoreProperties || [];

	var pHash = {};//hashObject(obj, ignoreProperties);
	var checkHash = function(){	
		//throttle the request animation to 50ms
		setTimeout(function(){
			var somethingChanged = false;
			var checked = copyCompare(pHash, object, ignoreProperties,
				(target, property, value)=>{ //property chnaged callback
					somethingChanged = true;
					if ((target === object || target.constructor === object.constructor)){
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
				}
			);
			
			if (!object[isDeleted]){
				if (somethingChanged) {
					pHash = checked;
					tryCall(null,callback);	
				}
				window.requestAnimationFrame(checkHash);
			}
		},50);
	}
	window.requestAnimationFrame(checkHash);
}

/**
 * 
 * @param {object} obj 
 */
export function hashObject(obj, ignoreProperties){
	ignoreProperties = ignoreProperties || [];
	var ret = "";
	if (isObject(obj)){
		ret = ret +"{";
		for(var i in obj){
			if (!obj.hasOwnProperty(i))
				continue;
			var el = obj[i];
			if (ignoreProperties.indexOf(i)>=0)
				return;
			if (isObject(el)){
				if (isObjLiteral(el)){
					ret = ret+ i+":"+ hashObject(el, ignoreProperties)+",";
				}else if (isArray(el)){
					ret = ret+ i+":"+ hashObject(el, ignoreProperties)+",";
				}else if (isDate(el)){	
					ret = ret+ i+":"+ el.getTime() + ",";
				}
			}else{
				ret = ret+ i +":"+ el+",";
			}
		};
		ret = ret +"}";
		return ret;
	}else{
		return obj;
	}
} 


/**
 * 
 * @param {object} oldObj 
 * @param {object} newObj 
 * @param {string[]} ignoreProperties 
 * @param {function(object, string, any):void} changeCallback 
 */
export function copyCompare(oldObj, newObj, ignoreProperties, changeCallback){
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
						changeCallback(oldObj, k, newObj[k]);
						oldObj[k] = new Date(newObj[k]);
					}
				} else
				if (isObject(oldObj[k]) && isObject(newObj[k])) {
					if (isArray(newObj[k]) || isObjLiteral(newObj[k])) {
						ret[k] = copyCompare(oldObj[k], newObj[k], ignoreProperties, changeCallback)
					} else {
						//new object is not an array and is a complex object
						//do not scan complex children
						ret[k] = newObj[k]
					} 
				} else
				if (isObject(oldObj[k]) && !isObject(newObj[k])) {
					//old is object, new is NOT object 
					changeCallback(oldObj, k, newObj[k]);
				} else
				if (!isObject(oldObj[k]) && isObject(newObj[k])) {
					//old is NOT object, new is object
					changeCallback(oldObj, k, newObj[k]);
				} else
				if (!isObject(oldObj[k]) && !isObject(newObj[k]) && !isFunction(newObj[k])) {
					//old is NOT object, new is NOT object
					if (oldObj[k] !== newObj[k]){
						changeCallback(oldObj, k, newObj[k]);
					}
				} else
				if (isFunction(newObj[k])) {
					if (oldObj[k] !== newObj[k]){
						changeCallback(oldObj, k, newObj[k]);
					}
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
				changeCallback(oldObj, k, undefined);
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
		
		changeCallback(oldObj, k, newObj[k]);
		ret[k] = {}
		if (!isArray(newObj) && !isObjLiteral(newObj)) {
			ret[k] = newObj[k];
		} else {
			ret[k] = copyCompare({}, newObj[k], ignoreProperties, changeCallback)
		}
	}
	if (!isObject(newObj))
		return newObj;

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