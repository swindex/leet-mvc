import { BasePage } from "../BasePage";
import * as template from './DialogPage.html';
import './DialogPage.scss';
import { tryCall, isObjLiteral } from "../../core/helpers";
import { isString } from "util";
import { Forms } from "leet-mvc/components/Forms";
import { Injector } from "leet-mvc/core/Injector";
import { NavController } from "leet-mvc/core/NavController";
import { Objects } from "leet-mvc/core/Objects";

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
		//this.controls;
		// @ts-ignore
		//make them unwatchable
		this.controls=[];
		this.data = {};
		this.errors={};
	
	}

	onInit(){
		super.onInit();
	}

	onButtonClicked(button_title){
		if (tryCall(this, this.buttons[button_title], this) != false)
			this.destroy();
	}

	render(){
		this.content = new Forms(this.controls,this.data,this.errors);
	}

	addCheck(name, title, value, required, attrs) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type:'checkbox', title:title, validateRule: valRule, attributes:attrs});
		this.data[name] = value;
		this.render();
		return this;
			
	}

	addSelect(name, title, value, required, items, attrs) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type: "select", title: title, validateRule: valRule, items: items, attributes:attrs});
		this.data[name] = value;
		this.render();
		
		return this;	
	}
	
	addInput(name, title, type, value, required, attrs) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type: type, title:title, validateRule: valRule, attributes:attrs});
		this.data[name] = value;
		this.render();
		
		return this;	
	}

	addTextArea(name, title, value, required, attrs) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type: "textarea", title:title, validateRule: valRule, attributes:attrs});
		this.data[name] = value;
		this.render();
		
		return this;	
	}

	addText (name, title, value, required, attrs) {
		return this.addInput(name, title,"text", value, required, attrs);
	}

	addLabel (title, value, attrs) {
		this.controls.push({name:"label", type:'label', title:title,value:value ,attributes:attrs});
		this.render();
		
		return this;
	}

	addPassword (name, title, value, required, attrs) {
		return this.addInput(name, title,"password", value, required, attrs);
	}


	removeField(name){
		Objects.forEach(this.controls,(el,key)=>{
			if (el.name == name){
				this.controls.splice(key,1);
			}
		})

		if (this.data[name])
			delete this.data[name];

		this.render();
	}
	
	/**
	 * Add Action Button to the dialog
	 * @param {string} title
	 * @param {function(DialogPage)} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
	addActionButton(title, callback) {
		this.buttons[title] = callback;
		return this;
	}
}
DialogPage.template = template;
DialogPage.className = 'page-DialogPage';
DialogPage.visibleParent = true;