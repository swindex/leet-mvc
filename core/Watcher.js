import { isObject, isArray } from "util";
import WatchJS from 'melanke-watchjs';

let isProxy = Symbol("isProxy");
/**
 * The watch function creates proxy from any object and watches its changes. Triggers only when own properties change or properties of its simple properties
 * 
 */
export var Watcher={
	WatchJS_halt:function(){
		if (false && window['Proxy'] && window['Reflect']){
			//can't really do anything here.
		}else{
			//WatchJS.suspend();
		}
	},
	watch: function(object, onChangeCallback){
		if (false && window['Proxy'] && window['Reflect']){
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
			//console.warn("Using Watch JS");
			//console.warn(Reflect, Proxy);
			
			//window.requestAnimationFrame(()=>{
				WatchJS.watch(object, (prop, action, difference, oldvalue)=>{
					//WatchJS.noMore = true;
					onChangeCallback(object,prop);
				});
			//});
			return object;
		}	
	},
	unWatch: function( object ){
		if (false && window['Proxy'] && window['Reflect']){
			//can't really do anything here.
		}else{
			WatchJS.unwatch(object);
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