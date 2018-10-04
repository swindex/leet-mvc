import { Watcher } from './Watcher.js';

export class ChangeWatcher {
	constructor(){
		this.isWatch = true;
		this.updateQueue = 0;
		this.skipUpdate = false;

		return Watcher.watch(this,(obj,prop)=>{
			this._onChange(obj,prop);
		})

	}

	/**
	 * ***OverrideCallSuper***
	 * Delete allocated memory
	 */
	onDestroy(){
		console.log(this.constructor.name, 'unwatching');
		Watcher.unWatch(this);
	}

	/**
	 * Called when any change is detected
	 * ***OverrideCallSuper****
	 * Handles change events
	 */
	_onChange(obj,prop){
		if (!this.isWatch || prop == 'isWatch' || prop == 'skipUpdate' || prop == 'updateQueue' || prop == 'injectVars')
			return false;
		this.updateQueue++;
		window.requestAnimationFrame(()=>{
			this.updateQueue > 0 ? this.updateQueue -- : null;

			if (this.updateQueue==0){
				if (this.skipUpdate){
					this.skipUpdate = false;
				}
				else	
					this.update();
			}
		})	
		return true;	
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