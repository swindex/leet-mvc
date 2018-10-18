import { BaseComponent } from "../BaseComponent";
import Swiper from 'swiper';
import { NavController } from "./../../core/NavController";
import './SwiperTabs.scss';
import { BasePage } from "./../../pages/BasePage";
import { argumentsToArray } from "./../../core/helpers";
import { Objects } from "./../../core/Objects";

/**
 * @param {{navButtons?: true}} [options]
 */
export class SwiperTabs extends BaseComponent{
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
			<div class="swiper-container SwiperTabs" style="height:100%;" id="generatedpage">
				<div class="swiper-wrapper">
				</div>
			</div>	
		`;
		this.Nav=new NavController();
		
	}

	onTabChanged(page,index){

	}

	addPage(PageConstructor,args){
		if (!this.container && !this.tempContainer){
			this.tempContainer = document.createDocumentFragment();
			this.Nav.setContainer(this.tempContainer);
		}
		PageConstructor.className = 'swiper-slide'
		PageConstructor.visibleParent = true;
		var inst = this.Nav.push.apply(this, argumentsToArray(arguments));

		this.pages.push(inst);
		//cause swiper to reinit after adding a page
		this.swiper.update();
		return inst;
	}

	/**
	 * Call to destroy container and remove all pages
	 */
	destroy(){
		//remove all pages
		this.removeAllPages();
	}

	/**
	 * Remove all pages
	 */
	removeAllPages(){
		//remove all pages
		Objects.forEach(this.pages,page =>{
			this.Nav.remove(page);
		})
	}


	/**
	 * Remove a page from internal stack
	 * @param {*} pageInstance 
	 */
	removePage(pageInstance){
		this.Nav.remove(pageInstance);
	}

	init(container){
		super.init(container);
		this.container = container;
		this.Nav.setContainer($(container).find('.swiper-wrapper')[0]);
		if (this.tempContainer)
			$(container).find('.swiper-wrapper').append(this.tempContainer);
		


		var sw = new Swiper($(container).find('#generatedpage')[0],{
			threshold:50,
			noSwiping: true,
			iOSEdgeSwipeDetection: true,
		});
		this.swiper = $(container).find('#generatedpage')[0].swiper;
		this.swiper.on('slideChange',()=>{
			var v = this.swiper.activeIndex;
			this.binder.updateElements();
			this.onTabChanged(this.pages[v],v);
		})
		this.swiper.slideTo(0);
		//this.binder.updateElements();
	}
}