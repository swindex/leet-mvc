import { isObject, isArray } from "util";
import { tryCall } from "./helpers";
import { Objects } from "./Objects";

let isProxy = Symbol("isProxy");
let isOnTimer = Symbol("isOnTimer");
/**
 * The watch function creates proxy from any object and watches its changes. Triggers only when own properties change or properties of its simple properties
 * 
 */
export var Watcher={
	watch: function(object, onChangeCallback){
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
					onChangeCallback(target,property);
					return Reflect.set(target, property, value);
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
		}else{
			onChange(object ,()=>{
				onChangeCallback(null,null);
			});
			return object;
		}	
	},
	unWatch: function( object ){
		if (window['Proxy'] && window['Reflect']){
			//can't really do anything here.
		}else{
			object[isOnTimer] = false;
		}
	}
}
function isObjLiteral(_obj) {
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

function onChange(obj, callback){
	obj[isOnTimer] = true;	
	var pHash = hashObject(obj);
	var checkHash = function(){	
		//throttle the request animation to 50ms
		setTimeout(function(){
			var hash = hashObject(obj);
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
function hashObject(obj){
	var ret = "";
	if (isObject(obj)){
		ret = ret +"{";
		Objects.forEach(obj,(el, i)=>{
			if (isObject(el)){
				if (isObjLiteral(el)){
					ret = ret+ i+":"+ hashObject(el)+",";
				}else if (isArray(el)){
					ret = ret+ i+":"+ hashObject(el)+",";
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