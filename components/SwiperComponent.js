import Swiper from 'swiper/bundle';
import 'swiper/swiper-bundle.css';

import { BaseComponent } from "./BaseComponent";



export class SwiperComponent extends BaseComponent{
	/**
	 * @param {{navigation?: true,submitButton?:string,pagination?:true, slidesPerView?: number|'auto' }} [options]
	 */
	constructor(options){
		super();
		
		/** @type {Swiper} */
		this.swiper = null;
		this.index= null;
		this.options = Object.assign({},{
			navigation: true,
			submitButton: "Submit",
			pagination: true,
			slidesPerView: 1,
		},options);

		this.template = `
		<div class="swiper-container">
			<div class="swiper-wrapper">
				<div class="swiper-wrapper" [directive]="this.templateFragment">
				</div>
			</div>
      <div [if]="this.options.navigation" class="swiper-navigation">
        <div>
				<button class="btn btn-primary" [if]="!this.swiper.isBeginning" onclick="if (this.onBackClicked()!== false ) this.swiper.slidePrev()"
					name="back">Back</button>
				<button class="btn btn-primary item-right" [if]="!this.swiper.isEnd" onclick="if (this.onNextClicked()!== false ) this.swiper.slideNext()"
					name="next">Next</button>
				<button class="btn btn-primary item-right" [if]="this._isShowSubmitButton()" onclick="this.onSubmitClicked()"
          name="submit">{{ Translate(this.options.submitButton) }}</button>
        </div>  
			</div>
			<div class="swiper-pagination"></div>
		</div>
		`
	}

	indexChange(value){
		if (!this.swiper) return;
		this.slideTo(value, false);
	}

	slideTo(index, callEvents){
		this.swiper.slideTo(index, 300, callEvents);
	}

	_isShowSubmitButton(){
		return this.isSghowSubmitButton() && this.swiper.isEnd;
	}

	/**
	 * ***Override***
	 * Called on button click.
	 * @return {boolean} return false to hide the submit button
	 */
	isSghowSubmitButton(){
		return true;
	}

	/**
	 * ***Override***
	 * Called on button click.
	 * @return {void|false} return false to cancel slide action
	 */
	onBackClicked(){

	}
	/**
	 * ***Override***
	 * Called on button click.
	 * @return {void|false} return false to cancel slide action
	 */
	onNextClicked(){

	}

	/**
	 * ***Override***
	 * Called on submit button click.
	 */
	onSubmitClicked(){
		
	}

	/**
	 * ***Override***
	 * Called on slide change
	 * Return false to cancel slide change
	 * @param {number} index 
	 * @param {number} oldIndex 
	 * @return {void|false} 
	 */
	onSlideChange(index, oldIndex){

	}

	onInit(container){
		setTimeout(()=>{
			this.swiper = new Swiper(this.container,{
				threshold: 50,
				//initialSlide:this.index,
				noSwiping: true,
				iOSEdgeSwipeDetection: true,
				slidesPerView: this.options.slidesPerView,
				/*breakpoints:{
					640:{
						slidesPerView: 1
					}
				},*/
				centerInsufficientSlides:true,
				pagination: Object.assign({},this.options.pagination ?
					{
						el: '.swiper-pagination'
					} : null),
			});

			this.swiper.on('slideChange',()=>{
				var old = this.index;
				var newIndex = this.swiper.activeIndex;

				if (old == newIndex) {
					return;
				}

				//Notify listener that the page has changed
				var ret = this.onSlideChange(newIndex, old);
				if (ret ===false) {
					//this.index = old;
					this.slideTo(this.index, false);
				} else {
					this.index = newIndex;
				}
			})
			
			this.index = 0;
			this.slideTo(this.index);
		});
	}
}
