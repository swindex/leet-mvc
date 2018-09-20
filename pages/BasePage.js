import { Binder } from '../core/Binder';
import { NavController } from '../core/NavController';
import { ChangeWatcher } from '../core/ChangeWatcher';


export class BasePage extends ChangeWatcher{
	/**
	 * @param {JQuery<HTMLElement>} page 
	 */
	constructor(page){
		super();
		this.page = page;
		/** @type {NavController} */
		this.Nav;
		/** @type {CSSStyleDeclaration} */
		this.style;
		
		// @ts-ignore
		this.style = {};
				
		this.binder = new Binder(this,this.page);
	}

	/**
	 * Command the nav controller to remove this page from the stack
	 */
	destroy(){
		this.Nav.remove(this);
	}

	/**
	 * ***OverrideCallSuper****
	 * Initialize binder
	 */
	onInit(binderEvent){
		this.binder.bindElements(binderEvent);
		//this.update();
		this.isWatch = true;
	}

	/**
	 * @override
	 */
	update(){
	 	this.binder.updateElements();
	 	this.onUpdated();
	}

	/**
	 * ***Override****
	 */
	onUpdated(){
		console.log(this.constructor.name, 'updated');
	}
	/**
	 * ***Override****
	 */
	onEnter(){

	}
	/**
	 * ***Override****
	 */
	onLeave(){

	}
	/**
	 * ***Override****
	 */
	onResize(){

	}
	/**
	 * ***OverrideCallSuper****
	 * Called when NavController is about to delete the page
	 * @override
	 */
	onDestroy(){
		super.onDestroy();
	}
	
}
BasePage.visibleParent = null;
BasePage.selector = null;
BasePage.template = null;
BasePage.className = null;