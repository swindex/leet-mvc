import { Binder } from '../core/Binder';
import { NavController } from '../core/NavController';
import { ChangeWatcher } from '../core/ChangeWatcher';
import { tryCall } from '../core/helpers';
import { BaseComponent } from '../components/BaseComponent';
import { Objects } from '../core/Objects';

export class BasePage extends ChangeWatcher{
	constructor(){
		super();
		/** {@type {JQuery<HTMLElement>}*/
		this.page = null;
		/** @type {NavController} */
		this.Nav;
		/** @type {CSSStyleDeclaration} */
		this.style;
		
		// @ts-ignore
		this.style = {};
		this.components = null;
		this.binder = new Binder(this);

		this.isDeleting = false;
		this.isCreating = false;
		this.isHiding = false;
		this.isShowing = false;
		this.isVisible = false;
		this.isDeleted = false;

		this.className = null;
		this.visibleParent = null;

		//Be lazy. This allows us to directly pass page methods without having to worry about "this"
		Objects.bindMethods(this);
	}

	

	/**
	 * Force Page update
	 */
	update(){
		if (!this.binder)
			return;
		this.binder.updateElements();
		this.onUpdated();
	}

	_onVisible(){
		this.onVisible();
	}

	/**
	 * Command the nav controller to remove this page from the stack
	 */
	destroy(){
		if (this.isDeleted) {
			return;
		}
		//if nav exists, then tell nav to delete the page
		if (this.Nav){
			//tell Nav to remove the page from the stack
			this.Nav.remove(this);
		} else {
			//Nav does not exist any more: delete the page
			//notify whoever implements, that page is to be destroyed.
			this.onDestroy();		
					
			//Call destroy on all child components
			if (this.components){
				for (let i in this.components){
					var comp = this.components[i];
					if (comp instanceof BaseComponent){
						tryCall(comp, comp.destroy);
						delete this.components[i];
					}
				}
			}
			//destroy binder
			if (this.binder){
				this.binder.destroy();
			}
			//Destroy the rest of listeners, properties and methods
			this.stopWatch();
			Objects.strip(this);
			this.isDeleted = true;
		}
	}

	//Implementation of Lifecycle callbacks that are called by NavController
	/**
	 * ***OverrideCallSuper***
	 * Initialize binder
	 */
	_init(binderEvent){
 		this.template = BasePage.template.replace('/*child-template*/', this.template);

		this.binder.bindElements(binderEvent, this.template);
		this.page = $(this.binder.vdom.elem);
		super.startWatch();
	}

	/**
	 * ***Override***
	 * Called after page is created and inserted into the document but before it is rendered
	 * @param {JQuery<HTMLElement>} page 
	 */
	onInit(page){
		
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
	 * ***OverrideCallSuper***
	 */
	resize(){
		this.onResize();
	}

	/**
	 * ***Override***
	 * Called when NavController removes it self from the page and page is about to be deleted
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
BasePage.className = null;
BasePage.template = `<div page [class]="this.className" [style]="this.style">/*child-template*/</div>`;