import { BasePage } from "../BasePage/BasePage";
import * as template from './DialogPage.html';
import './DialogPage.scss';
import { tryCall } from "../../js/helpers";

export class DialogPage extends BasePage{
	constructor(page){
		super(page);
		/** @type {KeyValuePair} */
		this.buttons = {};
		this.title= null;
		this.prompt= null;
		this.content= null;
	}
	onInit(){
		super.onInit();
	}

	onButtonClicked(button_title){
		tryCall(this, this.buttons[button_title]);
	}
}
DialogPage.template = template;
DialogPage.className = 'page-DialogPage';
DialogPage.visibleParent = true;