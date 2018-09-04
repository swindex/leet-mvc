import { Binder } from '../core/Binder';
import { NavController } from '../core/NavController';
import WatchJS from 'melanke-watchjs';

export class ChangeWatcher {
	constructor(){
		this.isWatch = false;
		this.updateQueue = 0;
		//return onChange(this,(obj,prop)=>{this.onChange(obj,prop)});
		//make sure watch turns on AFTER averything is initialized. because we are NOT watching new properties
		window.requestAnimationFrame(()=>{
			WatchJS.watch(this, (prop, action, difference, oldvalue)=>{
		
				//alert("prop: "+prop+"\n action: "+action+"\n difference: "+JSON.stringify(difference)+"\n old: "+JSON.stringify(oldvalue)+"\n ... and the context: "+JSON.stringify(this));    
				this.onChange(this,prop);
			}, 0, false);
		});
	}
	/**
	 * ***OverrideCallSuper***
	 * Delete allocated memory
	*/
	onDestroy(){
		console.log(this.constructor.name, 'unwatching');
		WatchJS.unwatch(this);
	}

	/**
	 * ***OverrideCallSuper***
	 * Called when change occured Returns true is update is possible
	 * 
	 */
	onChange(obj,prop){
		if (!this.isWatch || prop == 'updateQueue')
			return false;
		return true;	
	}
}

export class BasePage extends ChangeWatcher{
	/**
	 * 
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

	update(){
		this.binder.updateElements();
		this.onUpdated();
	}
	/**
	 * ***OverrideCallSuper****
	 * Initialize binder
	 */
	onChange(obj,prop){
		if (!super.onChange(obj,prop))
			return false;
		this.updateQueue++;
		window.requestAnimationFrame(()=>{
			this.updateQueue > 0 ? this.updateQueue -- : null;
			if (this.updateQueue==0){
				this.update();
			}
		})	
		return true;	
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
	 */
	onDestroy(){
		super.onDestroy();
	}
	
}
BasePage.visibleParent = null;
BasePage.selector = null;
BasePage.template = null;
BasePage.className = null;