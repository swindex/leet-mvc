import { BasePage } from "../BasePage";
import * as template from './DialogPage.html';
import './DialogPage.scss';
import { tryCall } from "../../core/helpers";
import { isString } from "util";
import { Forms } from "leet-mvc/components/Forms";
import { Injector } from "leet-mvc/core/Injector";
import { NavController } from "leet-mvc/core/NavController";

/**
 * Create an instance of the dialog page
 * @param {string} title 
 */
export function Dialog(title){
	/** @type {NavController} */
	var nav = Injector.Nav;
	var d = nav.push(DialogPage);
	d.title = title;
	return d;
}

export class DialogPage extends BasePage{
	constructor(page, title){
		super(page);
		/** @type {KeyValuePair} */
		this.buttons = {};
		this.title= title;
		this.prompt= null;
		this.content= null;

		/** @type {FieldTemplate[]} */
		this.controls;
		// @ts-ignore
		this.controls=[];
		this.data = {};
	}

	onInit(){
		super.onInit();
	}

	onButtonClicked(button_title){
		if (tryCall(this, this.buttons[button_title]) != false)
			this.destroy();
	}

	render(){
		this.content = new Forms(this.controls,this.data,{});
	}

	addCheck(name, title, value, required) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type:'checkbox', title:title, validateRule: valRule});
		this.data[name] = value;
		this.render();
		return this;
			
	}

	addSelect(name, title, value, required, items) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type: "select", title: title, validateRule: valRule, items: items});
		this.data[name] = value;
		this.render();
		
		return this;	
	}
	
	addInput(name, title, type, value, required) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type: type, title:title, validateRule: valRule});
		this.data[name] = value;
		this.render();
		
		return this;	
	}
	addText (name, title, value, required) {
		return this.addInput(name, title,"text", value, required);
	}

	addPassword (name, title, value, required) {
		return this.addInput(name, title,"password", value, required);
	}
	
	/**
	 * Add Action Button to the dialog
	 * @param {string} title
	 * @param {function(GenFormData)} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
	addActionButton(title, callback) {
		this.buttons[title] = callback;
		return this;
	}
}
DialogPage.template = template;
DialogPage.className = 'page-DialogPage';
DialogPage.visibleParent = true;