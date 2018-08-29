import { Binder } from '../core/Binder';
import { NavController } from '../core/NavController';
import { onChange } from '../core/helpers';

export class ChangeWatcher {
	constructor(){
		this.watch = false;
		this.updateQueue = 0;
		return onChange(this,(obj,prop)=>{this.onChange(obj,prop)});
	}
	onChange(obj,prop){

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
				
		//this.style.
		this.binder = new Binder(this,this.page);
	}

	destroy(){
		this.Nav.remove(this);
	}

	onInit(binderEvent){
		this.binder.bindElements(binderEvent);
		//this.update();
		this.watch = true;
	}

	update(){
		this.binder.updateElements();
		this.onUpdated();
	}

	onChange(obj,prop){
		if (!this.watch || prop == 'updateQueue')
			return;
		this.updateQueue++;
		window.requestAnimationFrame(()=>{
			this.updateQueue > 0 ? this.updateQueue -- : null;
			if (this.updateQueue==0){
				this.update();
			}
		})		
	}
	onUpdated(){
		
	}

	onEnter(){

	}
	onLeave(){

	}

	onResize(){

	}
	onDestroy(){

	}
	
}
BasePage.visibleParent = null;
BasePage.selector = null;
BasePage.template = null;
BasePage.className = null;