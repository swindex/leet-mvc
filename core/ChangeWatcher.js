import { isObject, isArray, isFunction, isSymbol, isDate } from "util";

import { Watcher, isSkipUpdate } from './Watcher.js';

export class ChangeWatcher {
  constructor(){
    this[Watcher.skip] = true;

    return Watcher.on(this,
      (target, property, value)=>{
        if (target===this){
          if (isFunction(this[property+"Change_2"])) {
            this[isSkipUpdate] = true;
            this[property+"Change_2"](value);
            this[isSkipUpdate] = false;
          }
          if (isFunction(this[property+"Change"])) {
            this[isSkipUpdate] = true;
            this[property+"Change"](value);
            this[isSkipUpdate] = false;
          }
        }
      },
      ()=>{
        this.update();
      },
      ['injectVars']);
  }

  startWatch(){
    this[Watcher.skip] = false;
  }

  stopWatch(){
    Watcher.off(this);
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