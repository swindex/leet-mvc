import { Watcher } from './Watcher';

export class ChangeWatcher {
	constructor(){
		this.isWatch = false;
		this.updateQueue = 0;
		
		return Watcher.watch(this,(target,prop)=>{
			this._onChange(this,prop);
		});
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
		if (!this.isWatch || prop == 'updateQueue')
			return false;
		this.updateQueue++;
		window.requestAnimationFrame(()=>{
			this.updateQueue > 0 ? this.updateQueue -- : null;
			if (this.updateQueue==0){
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