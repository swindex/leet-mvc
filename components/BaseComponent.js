import { Binder, removeVDOMElement } from "../core/Binder";
import { ChangeWatcher } from "../core/ChangeWatcher";
import { Objects } from "../core/Objects";
import { tryCall } from "../core/helpers";

export class BaseComponent extends ChangeWatcher{
	constructor(){
		super()
		/** @type {Binder} */
		this.binder = null;
		/** @type {string} */
		this.template = null;
		this.events = null;
		/** fragment with children */
		this.templateFragment = null;
		/** update children*/
		this.templateUpdate = function(){};
		Objects.bindMethods(this);
		/** reference to the parent page */
		this.parentPage = null;

		/**@type {JQuery<HTMLElement>} */
		this.container = null;

		this.attributes = {};
		this.components = [];
	}

	/** 
	 *  ***DO NOT OVERRIDE*** 
	 * This function is called once after the container is bound to context
	 * @param {HTMLElement[]} container
	 */
	_onInit(container){
		this.container = $(container);
		super.startWatch();
		//register my self with the basePage components, so it knows what to destroy later
		if (this.parentPage){
			if (!this.parentPage.components){
				this.parentPage.components = [];
			}
			this.parentPage.components.push(this);
		}
		this.onInit(this.container);
	}
	
	/** 
	 *  ***Override*** 
	 * This functinon is called once after the container is bound to context
	 * @param {JQuery<HTMLElement>} container
	 */
	onInit(container){

	}

	/**
	 * Overrides ChangeWatcher.update method
	 */
	update(){
		if (this.onBeforeUpdate() === false)
			return;	
		if (this.binder)
			this.binder.updateElements();
		this.onUpdate();	
	}

	destroy(){
		if (this.onDestroy) {
			this.onDestroy();
		}

		if (this.components){
			for (let i in this.components){
				var comp = this.components[i];
				if (comp instanceof BaseComponent){
					tryCall(comp, comp.destroy);
					delete this.components[i];
				}
			}
		}

		if (this.binder) {
			this.binder.destroy();
		}
		this.stopWatch();
		Objects.strip(this);
	}

	/**
	 * ***Override***
	 **/
	onDestroy(){

	}

	/**
	 * ***Override***
	 * Called before UI is updated
	 * Return false to cancel update
	 * @return {void|boolean}
	 **/
	onBeforeUpdate(){

	}
	/**
	 * ***Override***
	 **/
	onUpdate(){

	}
}