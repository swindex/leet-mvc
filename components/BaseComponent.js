import { Binder } from "../core/Binder";
import { ChangeWatcher } from "../core/ChangeWatcher";

export class BaseComponent extends ChangeWatcher{
	constructor(){
		super()
		/** @type {Binder} */
		this.binder = null;
		/** @type {string} */
		this.html = null;
		this.events = null;
	}

	/** 
	 * This functinon is called once after the contained is loaded
	 * @param {HTMLElement} container
	 */
	init(container){
		this.isWatch = true;
	}

	update(){
		if (this.binder)
			this.binder.updateElements();
	}
}