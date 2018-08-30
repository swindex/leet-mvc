import "../scss/dialog.scss";
import { FormGenerator } from "../core/form_generator";

import { Injector } from "../js/Injector";
import { InjectTemplate } from "../js/Inject";
var Inject = Injector.implement(InjectTemplate)
/**
 * Create a dialog page 
 * @param {string} title - title to display on the dialog
 * @param {string} [className] - (popup) class name to be added to dialog.
 * @return {FormGenerator}
 */
export function Dialog(title, className) {
	return Inject.Nav.push(DialogPageGenerator,title, className);
}

/**
 * @type {Page}
 * @param {JQuery<HTMLElement>} Page 
 * @param {string} title - title to display on the dialog
 */
function DialogPageGenerator(Page, title) {
	var $ = scope(Page);

	/**@type {JQuery<HTMLElement>} */
	var header = null;
	/**@type {JQuery<HTMLElement>} */
	var message = null;
	/**@type {JQuery<HTMLElement>} */
	var footer = null;

	//make this class inherit all members of FormGenerator
	FormGenerator.apply(this);

	this.onInit = function() {
		
		header = $('.dialogheader');
		footer = $('.dialogfooter');
		message = $('.dialogmessage');

		this.setContainerElement(message);
		header.text(title)
		return this;
	}
	this.hide = function () {
		this.Nav.back();
		return;
	}
	
	/**
	 * Add Action Button to the dialog
	 * @param {string} title
	 * @param {function(GenFormData)} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
	this.addActionButton = function (title, callback) {
		var button = document.createElement('button');
		button.innerHTML = title;
		button.className = "dialogfooter_button"

		if (typeof callback === "function") {
			var self = this;
			button.onclick = function () {
				if (callback(self.getData()) !== false)
					self.hide();
				else
					self.update();	
			}
		}

		footer.append(button);
		return this;
	}
}		
DialogPageGenerator.selector = 'page-dialog';
DialogPageGenerator.template = `
	<div class="dialog popup backdrop visible" id="dialogHTML">
		<div class="dialogmargin">
			<div class="dialogwrapper">
				<div class="dialogheader">Reject Order</div>
				<div class="dialogmessage"></div>
				<div class="dialogfooter"></div>
			</div>
		</div>
	</div>
`;
DialogPageGenerator.visibleParent = true;