import { Watcher } from './Watcher.js';

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
	 * ***OverrideCallSuper***
	 * Delete allocated memory
	 */
	onDestroy(){
		//console.log(this.constructor.name, 'unwatching');
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