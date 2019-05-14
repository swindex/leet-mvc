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
					if (target[property] === value ||
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
					if (target === object &&  isFunction(object[property+"Change"])){
						object[isSkipUpdate] = true;
						object[property+"Change"](value);
						object[isSkipUpdate] = false;
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
			onDirtyChange(object ,()=>{
				onChangeCallback();
			});
			return object;
		}	
	},
	off: function( object ){
		if ( window['Proxy'] && window['Reflect']){
			//object.revoke();
			object[isDeleted] = true;
		}else{
			object[isOnTimer] = false;
		}
	}
}

function scheduleCallback(obj, callback){
	if (obj[isSkipUpdate] || obj[isDeleted])
		return;
	obj[isSkipUpdate] = true;

	setTimeout(function(){
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
					if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
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
			if (obj[isOnTimer])
				window.requestAnimationFrame(checkHash);
		},50);
	}
	window.requestAnimationFrame(checkHash);
}

function onDirtyChangeEvent(obj, callback, ignoreProperties){
	ignoreProperties = ignoreProperties || [];

	obj[isOnTimer] = true;	
	var pHash = hashObject(obj, ignoreProperties);
	var start = +new Date();
	return function(e){	
		if (e && e.detail && e.detail.object==obj)
			return;

		window.requestAnimationFrame(function(){	
			var hash = hashObject(obj, ignoreProperties);
			if (hash !== pHash){
				pHash = hash;
				tryCall(null,callback);
			}
		})
	};
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