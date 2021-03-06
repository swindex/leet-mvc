import { BaseComponent } from "../BaseComponent";
import Swiper from 'swiper';
import { NavController } from "./../../core/NavController";
import { BasePage } from "./../../pages/BasePage";
import { argumentsToArray, Override } from "./../../core/helpers";
import { DeBouncer } from "./../../core/DeBouncer";
import './SwiperTabs.scss';
import 'swiper/swiper.scss';
import { Objects } from "./../../core/Objects";
import { DOM } from "../../core/DOM";

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
		this.template=`
			<div class="swiper-container SwiperTabs" style="height:100%;" id="generatedpage">
				<div class="swiper-wrapper">
				</div>
			</div>	
		`;
		this.Nav=new NavController();
		this.debounceUpdate = DeBouncer.frameLast();

	}

	/**
	 * ***Override*** called when page is changed 
	 * @param {BasePage} page - page opject
	 * @param {number} index - page index
	 */
	onTabChanged(page,index){

	}

	/**
	 * Change the displayed tab
	 * @param {number} index 
	 * @param {number} [speed] - default 
	 * @param {boolean} [triggerEvents] - default true
	 */
	changeTab(index, speed, triggerEvents){
		this.swiper.slideTo(index, speed, triggerEvents);
	}


	addPage(PageConstructor, args){
		if (!this.container && !this.tempContainer){
			this.tempContainer = document.createDocumentFragment();
			this.Nav.setContainer(this.tempContainer);
		}

		/** @type {BasePage} */
		var inst = this.Nav.push.apply(this, argumentsToArray(arguments));

		inst.className = 'swiper-slide'
		inst.page.classList.add('swiper-slide');
		
		inst.visibleParent = true;
		

		//Override the page's onEnter method because onEnter must be called by this swiper only and not by the Nav controler
		inst.onEnter = Override(inst,inst.onEnter, function(next){
			/*console.log("OnEnter Overridden!")*/
			inst.onEnter.super = next;
		})

		
		this.pages.push(inst);
		//cause swiper to reinit after adding all pages in this animation frame
		this.debounceUpdate(()=>{
			this.swiper.update();
			this.swiper.realIndex
			//notify tabchange with the tab that is active
			if (this.swiper.realIndex >= 0){
				var v = this.swiper.realIndex;
				if (this.pages[v]) {
					if (!this.pages[v].onEnter.super)
						this.pages[v].onEnter();
					this.pages[v].onEnter.super();
					this.onTabChanged(this.pages[v],v);
				}
			}
		});
		return inst;
	}

	/**
	 * Call to destroy container and remove all pages
	 */
	onDestroy(){
		this.swiper.destroy(true,true);
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
		this.pages = [];
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
		this.Nav.setContainer(DOM(container).find('.swiper-wrapper').first());
		if (this.tempContainer)
			DOM(container).find('.swiper-wrapper').append(this.tempContainer);
		
		this.swiper = new Swiper(container,{
			threshold:50,
			noSwiping: true,
			iOSEdgeSwipeDetection: true,
		});

		this.swiper.on('slideChange',()=>{
			var v = this.swiper.activeIndex;
			this.binder.updateElements();
			//call the overridden onEnter call
			this.pages[v].onEnter.super();
			//Notify listener that the page has changed
			this.onTabChanged(this.pages[v],v);
		})
		this.swiper.slideTo(0);
	}
}