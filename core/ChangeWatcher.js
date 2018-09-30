import WatchJS from 'melanke-watchjs';

export class ChangeWatcher {
	constructor(){
		this.isWatch = false;
		this.updateQueue = 0;
		this.skipUpdate = false;
	}

	/**
	 * ***OverrideCallSuper***
	 * Start watching changes
	 */
	startWatch(){
		this.isWatch = true;
		WatchJS.watch(this, (prop, action, difference, oldvalue)=>{
			WatchJS.noMore = true;
			this._onChange(this,prop);
			WatchJS.noMore = false;
			
		});
	}

	
	/**
	 * ***OverrideCallSuper***
	 * Delete allocated memory
	 */
	onDestroy(){
		console.log(this.constructor.name, 'unwatching');
		WatchJS.unwatch(this);
	}

	/**
	 * Called when any change is detected
	 * ***OverrideCallSuper****
	 * Handles change events
	 */
	_onChange(obj,prop){
		if (!this.isWatch || prop == 'isWatch' || prop == 'skipUpdate' || prop == 'updateQueue' || prop == 'injectVars')
			return false;
		WatchJS.noMore = true
		this.updateQueue++;
		WatchJS.noMore = false	
		window.requestAnimationFrame(()=>{
			WatchJS.noMore = true
			this.updateQueue > 0 ? this.updateQueue -- : null;
			WatchJS.noMore = false	

			if (this.updateQueue==0){
				if (this.skipUpdate){
					WatchJS.noMore = true
					this.skipUpdate = false;
					WatchJS.noMore = false	
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