import { Binder } from "../core/Binder";
import { ChangeWatcher } from "../core/ChangeWatcher";
import { Objects } from "../core/Objects";

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
		Objects.bindMethods(this);
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

	/**
	 * Overrides ChangeWatcher.update method
	 */
	update(){
		if (this.binder)
			this.binder.updateElements();
	}

	/**
	 * ***Override***
	 **/
	onDestroy(){

	}

	/**
	 * ***DO NOT OVERRIDE*** 
	 */
	_onDestroy(){
		this.stopWatch();
		Objects.strip(this);
	}
}