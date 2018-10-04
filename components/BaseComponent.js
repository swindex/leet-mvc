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
	 * This functinon is called once BEFORE the container is bound to context
	 * @param {HTMLElement} container
	 */
	onInit(container){
		//super.startWatch();
	}
	/** 
	 * This functinon is called once after the container is bound to context
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