import { Watcher } from './Watcher.js';

export class ChangeWatcher {
	constructor(){
		return Watcher.on(this,()=>{
			this.update();
		},['injectVars']);
	}

	/**
	 * ***OverrideCallSuper***
	 * Delete allocated memory
	 */
	onDestroy(){
		console.log(this.constructor.name, 'unwatching');
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