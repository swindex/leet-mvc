// @ts-nocheck
import { Objects } from "./../core/Objects";
import Swiper from 'swiper';
import { Forms } from "./Forms";
import 'swiper/dist/css/swiper.css';
import { tryCall } from "./../core/helpers";



export class SwiperForms extends Forms{
	/**
	 * 
	 * @param {FieldTemplate[]} formTemplate 
	 * @param {*} data
	 * @param {*} [errors]
 	 * @param {*} [attrs]
	 * @param {{navButtons?: true,submitButton?:boolean,pagination?:true, navigation?:boolean, nestedData?:boolean}} [options]
	 */
	constructor(formTemplate, data, errors, attrs={} ,options){
		super(formTemplate, data, errors, attrs, {formClass:'swiper-slide scroll',nestedData:options.nestedData});
		this.formTemplate = formTemplate;
		//this.options = options;
		
		/** @type {Swiper} */
		this.swiper = null;
		this.index = 0;
		this.options = Object.assign({},{
			navButtons: false,
			submitButton: false,
			pagination: true,
			navigation: true,
			events: null
		},options);

		/*this html comes from the Forms class*/
		var formsHTML = this.template;
	}
	get template() {
		return `<div class="swiper-container" id="generatedform">
			<div class="swiper-wrapper">
				`+formsHTML+`
			</div>
	
			<!-- Add Pagination -->
			<div class="swiper-pagination"></div>
			<!-- Add Nav Buttons -->
			<div [if]="this.options.navigation" class="swiper-navigation">
				<button [if]="!this.swiper.isBeginning" 
					onclick="if (this.onBackClicked()!== false ) this.swiper.slidePrev()" name="back">Back</button>
				<button [if]="!this.swiper.isEnd" 
					onclick="if (this.onNextClicked()!== false ) this.swiper.slideNext()" class="item-right" name="next">Next</button>
				<button [if]="this._isShowSubmitButton()" 
					onclick="this.onSubmitClicked()" class="item-right" name="submit">Submit</button>
			</div>
		</div>`;
	}

	_isShowSubmitButton(){
		return this.swiper.isEnd && this.options.submitButton;
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
	onSubmitClicked(){
		throw new Error('Override ME!');
	}
	/**
	 * ***Override***
	 * @param {number} index 
	 */
	onSlideChange(index){

	}

	/**
	 * Slide the swiper to the first invalid form
	 */
	slideToInvalid( speed, runCallbacks){
		//console.log("Start Walk")
		var found = false;
		for( var i in this.formTemplate){
			this.validator.walkElements(this.formTemplate[i], (el, path)=>{
				//console.log(path);
				if (!found && !empty(this.errors[el.name])){
					this.swiper.slideTo(i, speed, runCallbacks);
					found = true;
					return false;		
				}
			});
			if (found){
				return;
			}
		}
	}


	
	onInit(container){
		super.onInit(container);
		setTimeout(()=>{
			this.swiper = new Swiper(container,{
				threshold:50,
				//initialSlide:this.index,
				noSwiping: true,
				iOSEdgeSwipeDetection: true,
				pagination: Object.assign({},this.options.pagination ?
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
