import { Binder } from '../core/Binder';
import { NavController } from '../core/NavController';
import { ChangeWatcher } from '../core/ChangeWatcher';
import { tryCall } from '../core/helpers';
import { BaseComponent } from '../components/BaseComponent';



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
		this.components = null;
		this.binder = new Binder(this,this.page);

		this.isDeleting = false;
		this.isCreating = false;
		this.isHiding = false;
		this.isShowing = false;
		this.isVisible = false;
	}

	/**
	 * Force Page update
	 */
	update(){
		this.binder.updateElements();
		this.onUpdated();
	}

	_onVisible(){
		if (!this.isLoaded && (this.isLoaded=true)){
			this.onLoaded();
		}
		this.onVisible();
	}

	/**
	 * Command the nav controller to remove this page from the stack
	 */
	destroy(){
		this.Nav.remove(this);
	}

	//Implementation of Lifecycle callbacks that are called by NavController
	/**
	 * ***OverrideCallSuper***
	 * Initialize binder
	 */
	onInit(binderEvent){
		this.binder.bindElements(binderEvent);
		super.startWatch();
	}

	/**
	 * ***Override***
	 * Called after page is created but before it is rendered
	 */
	init(){
		
	}
	/**
	 * ***Override***
	 * * Called after the page is created and fully rendered
	 */
	onLoaded(){

	}

	/**
	 * ***Override****
	 * Called after page is updated either manually, or by watcher
	 */
	onUpdated(){
		//console.log(this.constructor.name, 'updated');
	}

	/**
	 * ***Override****
	 * * Called every time the page becomes active but before transitions
	 */
	onEnter(){

	}

	/**
	 * ***Override***
	 * Called every time the transitions have ended and the page is fully visible.
	 */
	onVisible(){

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
	 * ***OverrideCallsuper****
	 * Called when NavController is about to delete the page
	 * @override
	 */
	_onDestroy(){
		super._onDestroy();
		//
		if (this.components){
			for (var i in this.components){
				var comp = this.components[i];
				if (comp instanceof BaseComponent){
					tryCall(comp, comp._onDestroy);
					tryCall(comp, comp.onDestroy);
					this.components[i] = null;
				}
			}
		}
		this.onDestroy();
	}

	/**
	 * ***Override***
	 * Called when NavController is about to delete the page
	 * @override
	 */
	onDestroy(){
		
	}
	
	/**
	 * ***Override***
	 * Called just before navigating back from the page.
	 * return false to cancel the back page navigation
	 * @returns {boolean}
	 */
	onBackNavigate(){
		return true;
	}
}
BasePage.visibleParent = null;
BasePage.selector = null;
BasePage.template = null;
BasePage.className = null;

