import { isObject, isArray } from "util";
import { tryCall } from "./helpers";
import { Objects } from "./Objects";

let isProxy = Symbol("isProxy");
let isOnTimer = Symbol("isOnTimer");
export var isSkipUpdate = Symbol("isSkipUpdate");
/**
 * The watch function creates proxy from any object and watches its changes. Triggers only when own properties change or properties of its simple properties
 * 
 */
export var Watcher={
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

					const desc = Object.getOwnPropertyDescriptor(target, property)
					const value = Reflect.get(target, property, receiver)
					
					if (value && isObject(value) && value[isProxy])
						return value;
					
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
				set(target, property, value) {
					if (property !== isSkipUpdate && !object[isSkipUpdate] && ignoreProperties.indexOf(property)<=0 )
						scheduleCallback(object, onChangeCallback);
					return Reflect.set(target, property, value);
				},
				defineProperty(target, property, descriptor) {
					if (property !== isSkipUpdate && !object[isSkipUpdate] && ignoreProperties.indexOf(property)<=0 )
						scheduleCallback(object, onChangeCallback);
					return Reflect.defineProperty(target, property, descriptor);
				},
				deleteProperty(target, property) {
					if (property !== isSkipUpdate && !object[isSkipUpdate] && ignoreProperties.indexOf(property)<=0 )
						scheduleCallback(object, onChangeCallback);
					return Reflect.deleteProperty(target, property);
				}
			};
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
			//can't really do anything here.
		}else{
			object[isOnTimer] = false;
		}
	}
}

function scheduleCallback(obj, callback){
	if (obj[isSkipUpdate])
		return;
	obj[isSkipUpdate] = true;

	window.requestAnimationFrame(function(){
		tryCall(null,callback);
		obj[isSkipUpdate] = false;
	});
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
/**
 * 
 * @param {object} obj 
 */
function hashObject(obj, ignoreProperties){
	ignoreProperties = ignoreProperties || [];
	var ret = "";
	if (isObject(obj)){
		ret = ret +"{";
		Objects.forEach(obj,(el, i)=>{
			if (ignoreProperties.indexOf(i)>=0)
				return;
			if (isObject(el)){
				if (isObjLiteral(el)){
					ret = ret+ i+":"+ hashObject(el, ignoreProperties)+",";
				}else if (isArray(el)){
					ret = ret+ i+":"+ hashObject(el, ignoreProperties)+",";
				}
			}else{
				ret = ret+ i +":"+ el+",";
			}
		});
		ret = ret +"}";
		return ret;
	}else{
		return obj;
	}
} 