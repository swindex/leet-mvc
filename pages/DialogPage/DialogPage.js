import { BasePage } from "../BasePage";
// @ts-ignore
import * as template from './DialogPage.html';
import './DialogPage.scss';
import { tryCall } from "../../core/helpers";
import { isString } from "util";
import { Forms } from "../../components/Forms";
import { Injector } from "../../core/Injector";
import { NavController } from "../../core/NavController";
import { Objects } from "../../core/Objects";

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
		/** @type {Forms} */
		this.content= null;
		this.dialog_content_max_height = "100%";
		this.controls=[];
		this.data = {};
		this.errors={};
	}

	onResize(){
		super.onResize();
		var h = (this.page.height() - 150);
		this.dialog_content_max_height = h+"px";
	}

	onButtonClicked(button_title){
		if (tryCall(this, this.buttons[button_title], this) != false)
			this.destroy();
	}

	render(){
		if (this.content && this.content.destroy) {
			//if destrou method exists, thennn destroy to remove meomory
			this.content.destroy()
		}
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
		this.controls.push({name:"label", type:'label', title:title, value:value, attributes:attrs});
		this.render();
		
		return this;
	}
	addLink (title, value, attrs) {
		this.controls.push({name:"link", type:'link', title:title, value:value, attributes:attrs});
		this.render();
		
		return this;
	}

	addPassword (name, title, value, required, attrs) {
		return this.addInput(name, title,"password", value, required, attrs);
	}


	removeField(name){
		this.controls = Objects.filter(this.controls, el => el.name != name );

		if (this.data[name])
			delete this.data[name];

		this.render();
	}
	
	addHtml (value) {
		this.controls.push({name:"label", type:'html',value:value});
		this.render();
		
		return this;
	}

	
	addSplit (items) {
		this.controls.push({name:"split", type:'split', title:null, value:null, items: items});
		this.render();
		
		return this;
	}

	/**
	 * Validate the content form
	 */
	validate(){
		if (this.content instanceof Forms)
			return this.content.validator.validate();
	}

	/**
	 * Add Action Button to the dialog
	 * @param {string} title
	 * @param {function(DialogPage)} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
	addActionButton(title, callback) {
		callback = callback || null;
		this.buttons[title] = callback;
		return this;
	}
}
DialogPage.template = template;
DialogPage.className = 'page-DialogPage';
DialogPage.visibleParent = true;