import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

import { BaseComponent } from "leet-mvc/components/BaseComponent";



export class SwiperComponent extends BaseComponent{
	/**
	 * @param {{navigation?: true,submitButton?:string,pagination?:true}} [options]
	 */
	constructor(options){
		super();
		
		/** @type {Swiper} */
		this.swiper = null;
		this.index = 0;
		this.options = $.extend({},{
			navigation: true,
			submitButton: "Submit",
			pagination: true,
		},options);

		this.html = `
		<div class="swiper-container">
			<div class="swiper-wrapper">
				<div class="swiper-wrapper" [directive]="this.templateFragment">
				</div>
			</div>
			<div class="swiper-pagination"></div>
			<div [if]="this.options.navigation" class="swiper-navigation">
				<button [if]="!this.swiper.isBeginning" onclick="if (this.onBackClicked()!== false ) this.swiper.slidePrev()"
					name="back">Back</button>
				<button [if]="!this.swiper.isEnd" onclick="if (this.onNextClicked()!== false ) this.swiper.slideNext()"
					class="item-right" name="next">Next</button>
				<button [if]="this._isShowSubmitButton()" onclick="this.onSubmitClicked()" class="item-right"
					name="submit">{{ Translate(this.options.submitButton) }}</button>
			</div>
		</div>
		`
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
	 * @param {number} index 
	 */
	onSlideChange(index){

	}

	onInit(container){
		setTimeout(()=>{
			this.swiper = new Swiper(this.container[0],{
				threshold: 50,
				//initialSlide:this.index,
				noSwiping: true,
				iOSEdgeSwipeDetection: true,
				pagination: $.extend({},this.options.pagination ?
					{
						el: '.swiper-pagination'
					} : null),
			});

			this.swiper.on('slideChange',()=>{
				this.index = this.swiper.activeIndex;

				//Notify listener that the page has changed
				this.onSlideChange(this.index);
			})
			this.swiper.slideTo(0);
		});
	}
}
