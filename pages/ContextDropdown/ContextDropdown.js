import { OptionsDialogPage } from "leet-mvc/pages/OptionsDialogPage/OptionsDialogPage";
import './ContextDropdown.scss'
import { GUID } from "leet-mvc/core/helpers";
export class ContextDropdown extends OptionsDialogPage {
	/**
	 * 
	 * @param {HTMLElement} element 
	 */
	constructor(element){
		super();

		if (!element.parentElement){
			this.destroy();
			return;
		}
		this.buttons = null;
		this.style.top = $(element).offset().top + $(element).outerHeight()+"px";
		this.style.left = $(element).offset().left+"px";
		this.style.width = $(element).width()+"px";
		
	}

	onResize(){

	}

	onInit(){
		//create a guid for this event and add onclick handler to body
		this.guid = GUID();
		$('body').on('click.'+this.guid,(evt)=>{
			this.destroy();
		});
	}

	onDestroy(){
		$('body').off('click.'+this.guid);
	}
}

ContextDropdown.className = OptionsDialogPage.className + " " + "page-ContextDropdown" 