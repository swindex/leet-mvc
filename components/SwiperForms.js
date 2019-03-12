import { Objects } from "./../core/Objects";
import Swiper from 'swiper';
import { Forms } from "./Forms";
import 'swiper/dist/css/swiper.css';
import { tryCall } from "./../core/helpers";

/**
 * 
 * @param {FieldTemplate[]} formTemplate 
 * @param {*} [dataName]
 * @param {*} [errorsName]
 * @param {{navButtons?: true,submitButton?:boolean,pagination?:true, navigation?:boolean}} [options]
 * @return {{html: string, swiper: Swiper, validator: FormValidator,methods:{init:function(),slideToInvalid: function()}}}
 */
export class SwiperForms extends Forms{

	constructor(formTemplate, data, errors,options){
		super(formTemplate, data, errors, {}, {formClass:'swiper-slide scroll'});
		this.formTemplate = formTemplate;
		this.options = options;
		
		/** @type {Swiper} */
		this.swiper = null;
		this.index = 0;
		this.options = $.extend({
			navButtons: false,
			submitButton: false,
			pagination: true,
			navigation: true,
			events: null
		},options);

		/*this html comes from the Forms class*/
		var formsHTML = this.html;

		this.html = `
		<div class="swiper-container" id="generatedform">
			<div class="swiper-wrapper">
				`+formsHTML+`
			</div>
	
			<!-- Add Pagination -->
			<div class="swiper-pagination"></div>
			<!-- Add Nav Buttons -->
			<div [if]="component.options.navigation" class="swiper-navigation">
				<button [if]="!component.swiper.isBeginning" 
					onclick="if (component.onBackClicked()!== false ) component.swiper.slidePrev()" name="back">Back</button>
				<button [if]="!component.swiper.isEnd" 
					onclick="if (component.onNextClicked()!== false ) component.swiper.slideNext()" class="item-right" name="next">Next</button>
				<button [if]="component.swiper.isEnd && component.options.submitButton" 
					onclick="component.onSubmitClicked()" class="item-right" name="submit">Submit</button>
			</div>
			
		</div>
		`
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


	
	init(container){
		super.init(container);
		var sw = new Swiper($(container).find('#generatedform')[0],{
			threshold:50,
			initialSlide:this.index,
			noSwiping: true,
			iOSEdgeSwipeDetection: true,
			pagination: $.extend({},this.options.pagination ?
				{
					el: '.swiper-pagination'
				} : null),
		});
		this.swiper = $(container).find('#generatedform')[0].swiper;
		this.swiper.on('slideChange',(v)=>{
			this.index = this.swiper.realIndex;
			this.binder.updateElements();
			tryCall(this,this.onSlideChange,this.index);
		})
		//this.swiper.slideTo(0);
		//this.binder.updateElements();
	}
}
