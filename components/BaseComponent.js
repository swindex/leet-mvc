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
		this.templateHTML = null;
		this.templateFragment = null;
	}

	/** 
	 * 
	 * This functinon is called once BEFORE the container is bound to context
	 * @param {HTMLElement} container
	 */
	onInit(container){
		super.startWatch();
	}
	/** 
	 * This functinon is called once after the container is bound to context
	 * @param {HTMLElement} container
	 */
	init(container){
		//register my self with the basePage components, so it knows what to destroy later
		if (!this.binder.context.components){
			this.binder.context.components = [];
		}
		this.binder.context.components.push(this);
	}

	update(){
		if (this.binder)
			this.binder.updateElements();
	}

	//To be called by the base page
	_onDestroy(){
		super._onDestroy();
		this.binder = null;
		this.html = null;
		this.events = null;
		this.templateHTML = null;
		this.templateFragment = null;	
	}
}