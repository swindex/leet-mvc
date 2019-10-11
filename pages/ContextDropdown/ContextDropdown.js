import { OptionsDialogPage } from "leet-mvc/pages/OptionsDialogPage/OptionsDialogPage";
import './ContextDropdown.scss'
import { GUID } from "leet-mvc/core/helpers";
export class ContextDropdown extends OptionsDialogPage {
	/**
	 * 
	 * @param {HTMLElement} element 
	 */
	constructor(){
		super();

		this.buttons = null;
		this.style.bottom ="0px";
		this.style.width = "100%";
		
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