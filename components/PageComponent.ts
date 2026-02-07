import { BaseComponent } from "./BaseComponent";
import Swiper from 'swiper';
import { NavController } from "./../core/NavController";
import { BasePage } from "./../pages/BasePage";
import { argumentsToArray } from "./../core/helpers";
import { Objects } from "../core/Objects";

/**
 * @param {{navButtons?: true}} [options]
 */
export class PageComponent extends BaseComponent{
	tempContainer: DocumentFragment | null = null;
	pages: BasePage[] = [];
	swiper: Swiper | null = null;
	Nav: NavController;

	constructor(){
		super();
		this.container = null;
		this.tempContainer = null;
		this.pages = [];
		this.swiper = null;
		this.template=`<div class="" style="height:100%;"></div>`;
		this.Nav=new NavController();
	}


	addPage(PageConstructor: any, ...args: any[]){
		if (!this.container && !this.tempContainer){
			this.tempContainer = document.createDocumentFragment();
			this.Nav.setContainer(this.tempContainer as any);
		}

		var inst = (this.Nav.push as any).apply(this, argumentsToArray(arguments));

		
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
	removePage(pageInstance: any){
		this.pages = Objects.filter(this.pages, (el: any) => el != pageInstance) as BasePage[];

		this.Nav.remove(pageInstance);
	}

	onInit(container: HTMLElement){
		super.onInit(container);
		this.container = container;
		this.Nav.setContainer(this.container);
	}
}