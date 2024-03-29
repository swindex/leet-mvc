import { isArray, isDate, isObject } from "./helpers";


let isProxy = Symbol("isProxy");
let isWatched = Symbol("isWatched");

let propertyChangeCallbacks = Symbol("propertyChangeCallbacks");
let objectChangeCallbacks = Symbol("objectChangeCallbacks");
//window['Proxy'] = null; //comment out to test dirty checking on chrome

var updatesHalted = false;

export var isSkipUpdate = Symbol("isSkipUpdate");
/**
 * The watch function creates proxy from any object and watches its changes. Triggers only when own properties change or properties of its simple properties
 * 
 */
export var Watcher={
  noChange(callback){
    updatesHalted = true;
    callback();
    updatesHalted = false;
  },

  /**
   * Watch for object changes. 
	 * @param {object} object - object to watch for changes
	 * @param {function(object, string, any):void} [onPropertyChangeCallback] - called for each changed property
   * @param {function():void} [onObjectChangeCallback] - timeout 0 de-bounced callback. called on the next frame after all onPropertyChangeCallbacks are executed
   * @param {string[]} [ignoreProperties]
	 */
  on(object, onPropertyChangeCallback, onObjectChangeCallback, ignoreProperties ){
    
    object[isWatched] = true;

    if (!object[propertyChangeCallbacks]){
      object[propertyChangeCallbacks] = [];
    }
    object[propertyChangeCallbacks].push(onPropertyChangeCallback);
   
    if (onObjectChangeCallback){
      if (!object[objectChangeCallbacks]){
        object[objectChangeCallbacks] = [];
      }
      object[objectChangeCallbacks].push(onObjectChangeCallback);
    }

    function propertyChangeHandler(target, property, value ){
      if (//value === isSkipUpdate ||
        updatesHalted == true ||
        target[property] === value ||
        typeof property == "symbol" ||
        //property === isSkipUpdate ||
        !object[isWatched]){

        return; 
      }
      let isSkip = object[isSkipUpdate];
      //skip any subsequent updates triggered by all onChange Callbacks
      object[isSkipUpdate] = true;
      object[propertyChangeCallbacks].forEach(function(onPropertyChangeCallback){
        try {
          onPropertyChangeCallback(target, property, value);
        } catch (ex){
          console.warn(ex);
        }
      });
      object[isSkipUpdate] = isSkip;

      if (target !== object && target[propertyChangeCallbacks] && target[isWatched]){
        let isSkip2 = target[isSkipUpdate];
        target[isSkipUpdate] = true;
        target[propertyChangeCallbacks].forEach(function(onPropertyChangeCallback){
          try {
            onPropertyChangeCallback(target, property, value);
          } catch (ex){
            console.warn(ex);
          }
        });
        target[isSkipUpdate] = isSkip2;
      }
      scheduleTargetCallback(target);
      scheduleCallback();
    }
    function scheduleCallback(){
      if (object[isSkipUpdate] || !object[isWatched]){
        return;
      }

      object[isSkipUpdate] = true;
    
      setTimeout(function scheduledUpdate(){
        if (!object[isWatched]) {
          return;
        }
    
        //prevent changes in object from calling other updates while onUpdateCallback is executing
        object[isSkipUpdate] = true;
        object[objectChangeCallbacks].forEach(function(onUpdateCallback){
          try {
            onUpdateCallback();
          } catch (ex){
            console.warn(ex);
          }
        });
        object[isSkipUpdate] = false;
      },0);
    }

    function scheduleTargetCallback(target){
      if (target == object){
        return;
      }

      if (target[isSkipUpdate] || !target[isWatched] || !target[objectChangeCallbacks]){
        return;
      }

      target[isSkipUpdate] = true;
    
      setTimeout(function scheduledUpdate(){
        if (!target[isWatched]) {
          return;
        }
    
        //prevent changes in object from calling other updates while onUpdateCallback is executing
        target[isSkipUpdate] = true;
        
        if (target[objectChangeCallbacks]){

          target[objectChangeCallbacks].forEach(function(onUpdateCallback){
            try {
              onUpdateCallback();
            } catch (ex){
              console.warn(ex);
            }
          });
        }
        target[isSkipUpdate] = false;
      },0);
    }
    return getWatchedObject(object, propertyChangeHandler, ignoreProperties);
  },
  off: function( object, handler ){
    if (!handler) {
      delete object[isWatched];
      delete object[propertyChangeCallbacks];
      delete object[objectChangeCallbacks];
    } else {
      for (let i in object[propertyChangeCallbacks]) {
        if (object[propertyChangeCallbacks][i])
          object[propertyChangeCallbacks].splice(i,1);
      }
      for (let i in object[objectChangeCallbacks]) {
        if (object[objectChangeCallbacks][i])
          object[objectChangeCallbacks].splice(i,1);
      }
    }
  }
};

function getWatchedObject(object, onPropertyChange, ignoreProperties){
  ignoreProperties = ignoreProperties || [];
  if (window['Proxy'] && window['Reflect']){
    const handler = {
      get(target, property, receiver) {
        if (property == isProxy)
          return true;

        const value = Reflect.get(target, property, receiver);

        //return as-is if its a primitive	
        if (! isObject(value))
          return value;
        if (value && isObject(value) && value[isProxy])
          return value;
        

        //return non-modifiable objects as-is
        const desc = Object.getOwnPropertyDescriptor(target, property);
        if (desc && !desc.writable && !desc.configurable) return value;

        //return objects, instantiated with `new` as-is
        if (! isArray(value) && isObject(value) && !isObjLiteral(value))
          return value;
        
        try {
          return new Proxy(target[property], handler);
        } catch (error) {
          return value;
        }
      },
      set(target, property, value) {
        if (ignoreProperties.indexOf(property) < 0)
          onPropertyChange(target, property, value );
     
        return Reflect.set(target, property, value);
      },
      defineProperty(target, property, descriptor) {
        if (ignoreProperties.indexOf(property) < 0)
          onPropertyChange(target, property, descriptor );
        return Reflect.defineProperty(target, property, descriptor);
      },
      deleteProperty(target, property) {
        if (ignoreProperties.indexOf(property) < 0)
          onPropertyChange(target, property, undefined );
        return Reflect.deleteProperty(target, property);
      }
    };
    
    return new Proxy(object, handler);
  }else{
    onObjectDirtyChange(object ,
      (target, property, value)=>{ //property changed callback
        onPropertyChange(target, property, value );
      }, ignoreProperties
    );
    return object;
  }
}

function isObjLiteral(_obj) {
  var _test  = _obj;
  return (
    typeof _obj !== 'object' || _obj === null ?
      false :  
      (
        (function () {
          while (!false) {
            _test = Object.getPrototypeOf(_test);
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
 * @param {function(object, string, any):void} onPropertyChangeCallback 
 * @param {string[]} [ignoreProperties]
 */
export function onObjectDirtyChange(object, onPropertyChangeCallback, ignoreProperties){
  ignoreProperties = ignoreProperties || [];

  var refObject = {}; //reference cpy of the object we are watching
  var checkHash = function(){	
    //throttle the request animation to 50ms
    setTimeout(function(){
      var checked = objectCloneCompare(refObject, object, onPropertyChangeCallback, ignoreProperties);
			
      if (object[isWatched]){
        refObject = checked;
        window.requestAnimationFrame(checkHash);
      }
    },50);
  };
  window.requestAnimationFrame(checkHash);
}

/**
 * Compares old object and new object. 
 * Does not clone classes or functions. they are compared by reference only.
 * Callback is fired for every changed property.
 * Returns the cloned copy of the new object for subsequent change checking
 * @param {object} oldObj 
 * @param {object} newObj 
 * @param {function(object, string, any):void} onPropertyChangeCallback 
 * @param {string[]} [ignoreProperties]
 * @return {object}
 */
export function objectCloneCompare(oldObj, newObj, onPropertyChangeCallback, ignoreProperties){
  ignoreProperties = ignoreProperties || [];
  var oldKeys = getObjKeys(oldObj);
  var newKeys = getObjKeys(newObj);
  var newChecked = [];
  var ret = isArray(newObj) ? [] : {};

  for (let i in oldKeys){
    let k = oldKeys[i];
    if (newObj[k] !== undefined) {
      //new object has the old key
      if (ignoreProperties.indexOf(k) < 0) {
        //if key is not in the igniore array

        if (isDate(oldObj[k]) && isDate(newObj[k])) {
          if (oldObj[k].getTime() !== newObj[k].getTime()) {
            onPropertyChangeCallback(newObj, k, newObj[k]);
            oldObj[k] = new Date(newObj[k]);
          }
        } else
        if (isObject(oldObj[k]) && isObject(newObj[k])) {
          if (isArray(newObj[k]) || isObjLiteral(newObj[k])) {
            if (oldObj[k].length !== newObj[k].length ) {
              onPropertyChangeCallback(newObj, k, newObj[k]);
            }
            ret[k] = objectCloneCompare(oldObj[k], newObj[k], onPropertyChangeCallback, ignoreProperties);
          } else {
            //new object is not an array and is a complex object
            if (oldObj[k] !== newObj[k]){
              //check them by reference
              onPropertyChangeCallback(newObj, k, newObj[k]);
            }
            //do not scan complex children
            ret[k] = newObj[k];
          } 
        } else
        if (isObject(oldObj[k]) !== isObject(newObj[k])) {
          //old isObject is not the same as new isObject
          onPropertyChangeCallback(newObj, k, newObj[k]);
        } else {
          //in the end compare values the normal way
          if (oldObj[k] !== newObj[k]){
            onPropertyChangeCallback(newObj, k, newObj[k]);
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
        onPropertyChangeCallback(newObj, k, undefined);
      } else{
        //both old and new objects properties are undefined
        newChecked.push(k);
      }
    }
  }
  //iterate over keys that are NOT in the old object
  for (let i in newKeys){
    let k = newKeys[i];
    if (newObj[k] === undefined || newChecked.indexOf(k) >= 0 || ignoreProperties.indexOf(k) >= 0 ) {
      continue;
    }
		
    onPropertyChangeCallback(newObj, k, newObj[k]);
    ret[k] = {};
    if (!isArray(newObj) && !isObjLiteral(newObj)) {
      ret[k] = newObj[k];
    } else {
      ret[k] = objectCloneCompare({}, newObj[k], onPropertyChangeCallback, ignoreProperties);
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
      return Array.apply(null, Array(obj.length)).map(function(v, i){return i;});
    } else {
      return Object.keys(obj);
    }
  }
  return [];
}