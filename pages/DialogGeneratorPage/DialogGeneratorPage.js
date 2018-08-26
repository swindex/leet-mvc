import { DialogPage } from "../DialogPage/DialogPage";

export class DialogGeneratorPage extends DialogPage {
	
	constructor(Page, title) {
		super(Page);
		/** @type {{name:string,type:string,value:string, prompt:string, error?:string, validationRule?: string, attributes?:any}[]} */
		this.controls = [];
	}
	
	onInit(){
		super.onInit();
	}

	hide() {
		this.destroy();
		return;
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

	addHtml = function (html) {
		var el = document.createElement('div');
		el.className = "fieldgroup";
		el.innerHTML = html;
		this.message.appendChild(el);
		return this;
	}
	addElement = function (element) {
		this.message.appendChild(element);
		return this;
	}
	addHeaderElement = function (element) {
		this.header.appendChild(element);
		return this;
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
DialogGeneratorPage.selector = 'page-dialogGenerator';
DialogGeneratorPage.visibleParent = true;