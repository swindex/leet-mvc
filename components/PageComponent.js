import { BaseComponent } from "./BaseComponent";
import Swiper from 'swiper';
import { NavController } from "./../core/NavController";
import { BasePage } from "./../pages/BasePage";
import { argumentsToArray } from "./../core/helpers";

/**
 * @param {{navButtons?: true}} [options]
 */
export class PageComponent extends BaseComponent{
	constructor(){
		super();
		/** @type {HTMLElement} */
		this.container = null;
		/** @type {DocumentFragment} */
		this.tempContainer = null;

		/** @type {BasePage[]} */
		this.pages = [];
		/** @type {Swiper} */
		this.swiper = null;
		this.html=`
			<div class="" style="height:100%;">
			</div>	
		`;
		this.Nav=new NavController();
	}


	addPage(PageConstructor, args){
		if (!this.container && !this.tempContainer){
			this.tempContainer = document.createDocumentFragment();
			this.Nav.setContainer(this.tempContainer);
		}

		var inst = this.Nav.push.apply(this, argumentsToArray(arguments));

		
		inst.visibleParent = true;
	
		return inst;
	}

	/**
	 * Call to destroy container and remove all pages
	 */
	onDestroy(){
		//remove all pages
		this.Nav.destroy();
		this.removeAllPages();
	}

	/**
	 * Remove all pages
	 */
	removeAllPages(){
		//remove all pages
		this.Nav.removeAll();
	}

	/**
	 * Remove a page from internal stack
	 * @param {*} pageInstance 
	 */
	removePage(pageInstance){
		this.pages = Objects.filter(this.pages, el => el != pageInstance);

		this.Nav.remove(pageInstance);
	}

	onInit(container){
		super.onInit(container);
		this.container = container;
		this.Nav.setContainer(this.container[0]);
	}
}