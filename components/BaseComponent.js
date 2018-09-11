import { Binder } from "../core/Binder";

export class BaseComponent{
	constructor(){
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

	}

	update(){
		if (this.binder)
			this.binder.updateElements();
	}
}