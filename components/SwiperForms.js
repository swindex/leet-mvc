import { Objects } from "./../core/Objects";
import Swiper from 'swiper';
import { Forms } from "./Forms";
import 'swiper/dist/css/swiper.css';


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
		super(formTemplate, data, errors, {}, 'swiper-slide scroll')
		this.formTemplate = formTemplate;
		this.options = options;
				
		this.swiper = null;
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
					onclick="component.swiper.slidePrev()" name="back">Back</button>
				<button [if]="!component.swiper.isEnd" 
					onclick="component.swiper.slideNext()" class="item-right" name="next">Next</button>
				<button [if]="component.swiper.isEnd && component.options.submitButton" 
					onclick="component.onSubmitClicked()" class="item-right" name="submit">Submit</button>
			</div>
			
		</div>
		`

	}

	onSubmitClicked(){
		throw new Error('Override ME!');
	}

	/**
	 * Slide the swiper to the first invalid form
	 */
	slideToInvalid(){
		Objects.forEach(this.formTemplate, (v,n)=>{
			var errs = Objects.filter(this.errors[v.name],(e)=>{
				return !empty(e);
			})
			if (Object.keys(errs).length > 0){
				this.swiper.slideTo(n);
				return false;		
			}
		})
	}
	
	init(container){
		super.init(container);
		var sw = new Swiper($(container).find('#generatedform')[0],{
			threshold:50,
			noSwiping: true,
			iOSEdgeSwipeDetection: true,
			pagination: $.extend({},this.options.pagination ?
				{
					el: '.swiper-pagination'
				} : null),
		});
		this.swiper = $(container).find('#generatedform')[0].swiper;
		this.swiper.on('slideChange',(v)=>{
			this.binder.updateElements();
		})
		this.swiper.slideTo(0);
		//this.binder.updateElements();
	}
}
