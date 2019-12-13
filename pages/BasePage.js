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

		this.name = null;

		this.isDeleting = null;
		this.isCreating = null;
		this.isHiding = null;
		this.isShowing = null;
		this.isVisible = null;
		this.isDeleted = null;
		this.isHidden = null;
		this.isRoot = null,

		this.selector = this.constructor.selector;
		this.className = this.constructor.className;
		this.visibleParent = this.constructor.visibleParent;

		this.classNames = [];

		//Be lazy. This allows us to directly pass page methods without having to worry about "this"
		Objects.bindMethods(this);
	}

	

	/**
	 * Force Page update
	 */
	update(){
		if (!this.binder)
			return;

		this.onBeforeUpdated();	
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

		if (this.Nav && this.onBeforeDestroy() === false){
			return;
		}
		
		//if nav exists, then tell nav to delete the page. Nav will then call this method again
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
 		//this.template = BasePage.template.replace('/*child-template*/', this.template);

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
	 * Called before page is updated either manually, or by watcher
	 */
	onBeforeUpdated(){
		//console.log(this.constructor.name, 'updated');
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
	 * ***Override***
	 * @param {{width:number, height:number}} windowSize
	 */
	onResize(windowSize){

	}
	/**
	 * ***OverrideCallSuper***
	 * @param {{width:number, height:number}} windowSize
	 */
	resize(windowSize){
		this.onResize(windowSize);
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
	 * Called before page is deleted. Return false to prefent page deletion. 
	 * @return {any|false}
	 * @override
	 */
	onBeforeDestroy(){
		return true;
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

	/**
	 * Extend the base template with child template
	 * @param {string} super_template 
	 * @param {string} child_template 
	 */
	extendTemplate(super_template, child_template){
		return super_template.replace('/*child-template*/', child_template );
	}

	/**
	 * ***Readonly*** property that returns the template string
	 *   You can extend base template by returning this.extendTemplate(super.template,'child template string');
	 */
	get template (){
		return `<div page [class]="this.className" [style]="this.style" [attribute]="{root: this.isRoot, hidden:this.isHidden,visible:this.isVisible,showing:this.isShowing,hiding:this.isHiding,creating:this.isCreating,deleting:this.isDeleting}">/*child-template*/</div>`;
	}
}
BasePage.visibleParent = null;
BasePage.selector = null;
BasePage.className = null;