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
		/** fragment with children */
		this.templateFragment = null;
		/** update children*/
		this.templateUpdate = function(){};
		Objects.bindMethods(this);
		/** reference to the parent page */
		this.parentPage = null;
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
		if (this.parentPage){
			if (!this.parentPage.components){
				this.parentPage.components = [];
			}
			this.parentPage.components.push(this);
		}
	}

	/**
	 * Overrides ChangeWatcher.update method
	 */
	update(){
		if (this.binder)
			this.binder.updateElements();
		this.onUpdate();	
	}

	/**
	 * ***Override***
	 **/
	onDestroy(){

	}
	/**
	 * ***Override***
	 **/
	onUpdate(){

	}

	/**
	 * ***DO NOT OVERRIDE*** 
	 */
	_onDestroy(){
		this.stopWatch();
		Objects.strip(this);
	}
}