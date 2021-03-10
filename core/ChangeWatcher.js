import { Watcher, isSkipUpdate } from './Watcher.js';

const propChangeHanler = Symbol('propChangeHanler');
const objectChangeHanler = Symbol('objectChangeHanler');
export class ChangeWatcher {
  constructor(){
    this[isSkipUpdate] = true;


    //var updateRequested = false;
    this[propChangeHanler] = (target,property,value)=>{
      if (target===this){
        if (typeof this[property+"Change_2"] == "function") {
          this[property+"Change_2"](value);
        }
        if (typeof this[property+"Change"] == "function") {
          if (typeof value == "symbol") {
            return;
          }
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