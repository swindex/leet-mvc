import { isObject, isArray, isFunction, isSymbol, isDate } from "util";

import { Watcher, isSkipUpdate } from './Watcher.js';

const propChangeHanler = Symbol('propChangeHanler');
const objectChangeHanler = Symbol('objectChangeHanler');
export class ChangeWatcher {
  constructor(){
    this[isSkipUpdate] = true;


    //var updateRequested = false;
    this[propChangeHanler] = (target,property,value)=>{
      if (target===this){
        if (isFunction(this[property+"Change_2"])) {
          this[property+"Change_2"](value);
        }
        if (isFunction(this[property+"Change"])) {
          this[property+"Change"](value);
        }
      }
    };

    this[objectChangeHanler] = ()=>{
      this.update();
    };

    var object = Watcher.on(this, this[propChangeHanler],this[objectChangeHanler], ['injectVars']);

    //object = Watcher.onObjectChange(object, this[objectChangeHanler], ['injectVars']);

    return object;
  }

  startWatch(){
    this[isSkipUpdate] = false;
  }

  stopWatch(){
    Watcher.off(this, this[propChangeHanler]);
    Watcher.off(this, this[objectChangeHanler]);
  }

  /**
	 * Called when the binder can finally be updated
	 * Children must override this method
	 * ***Override*** 
	 * @abstract
	 */
  update(){
    throw new Error("Must Override");
  }
}