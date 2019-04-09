import { Watcher } from './Watcher.js';
import { Objects } from './Objects.js';

export class ChangeWatcher {
	constructor(){
		this[Watcher.skip] = true;
		return Watcher.on(this,()=>{
			this.update();
		},['injectVars']);
	}

	startWatch(){
		this[Watcher.skip] = false;
	}

	/**
	 * ***DO NOT OVERRIDE***
	 * Last Call to be executed on the instance!
	 * Delete allocated memory.
	 */
	_onDestroy(){
		//console.log(this.constructor.name, 'unwatching');
		Watcher.off(this);

		//destroy all properties and methods, so they can no longer be referenced
		Objects.forEach(this._getMethods(), (m,i) => {
			delete this[i];
		})
		Objects.forEach(this._getProperties(), (p,i) => {
			delete this[i];
		})
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

	_getMethods(){
		var methods = {}
		Object.getOwnPropertyNames(this.constructor.prototype).forEach((key) =>{ 
			if(typeof this[key] === 'function')
				methods[key] = this[key];
		});
		return methods;
	}
	_getProperties(){
		var properties = {}
		
		Object.keys(this).forEach((key) =>{ 
			properties[key] = this[key];
		});
		return properties;

	}
}