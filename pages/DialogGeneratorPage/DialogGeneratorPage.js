import { DialogPage } from "../DialogPage/DialogPage";
import { Forms } from "leet-mvc/components/Forms";
import { isString } from "util";

export class DialogGeneratorPage extends DialogPage {
	
	constructor(Page, title) {
		super(Page);
		this.title = title;
		/** @type {FieldTemplate[]} */
		this.controls;
		// @ts-ignore
		this.controls=[];
		this.data = {};
	}
	
	onInit(){
		super.onInit();
	}

	hide() {
		this.destroy();
		return;
	}

	render(){
		this.content = new Forms(this.controls,this.data,{});
	}

	addCheck(name, title, value, required) {
		var valRule = (isString(required) ? required : (required ? "required" : null));
		this.controls.push({name: name, type:'checkbox', title:title, validateRule: valRule});
		this.data[name] = value;
		this.render();
		/*this.update()*/ //removed in favor of watcher;
		return this;
			
	}

	
	addInput(prompt, type, value, hint, required) {
		this.controls.push({prompt:prompt, name: name, type:type, value: value});
		/*this.update()*/ //removed in favor of watcher;
		return this;
	}
	addText (prompt, value, hint, required) {
		return this.addInput(prompt, "text", value, hint, required);
	}
	addPassword (prompt, value, hint, required) {
		return this.addInput(prompt, "password", value, hint, required);
	}

	/*addHtml(html) {
		var el = document.createElement('div');
		el.className = "fieldgroup";
		el.innerHTML = html;
		this.message.appendChild(el);
		return this;
	}
	addElement(element) {
		this.message.appendChild(element);
		return this;
	}
	addHeaderElement(element) {
		this.header.appendChild(element);
		return this;
	}*/

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
DialogGeneratorPage.selector = 'page-dialogGenerator';
DialogGeneratorPage.visibleParent = true;