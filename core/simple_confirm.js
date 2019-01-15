//This module wraps some simple notifications
import { tryCall } from "./helpers";
import { Dialog } from "../pages/DialogPage/DialogPage";
import { Text } from "./text";
import { Objects } from "./Objects";

/**
 * Show "Confirm" dialog with custom buttons
 * @param {string} prompt 
 * @param {string} [title] 
 * @param {{[button_name:string]:function()}} buttons 
 */
export var ConfirmButtons=function(prompt,title,buttons){
	var p = Dialog(title);
	p.addHtml('<div class="message">'+Text.escapeHTML(prompt, true)+"</div>");
	Objects.forEach(buttons,(button, name)=>{
		p.addActionButton(name,button);
	})
	p.onBackNavigate = () => false
}

/**
 * Show simple Confirm Box 
 * @param {string} prompt 
 * @param {function()} onConfirm 
 * @param {string} [title] 
 */
export var Confirm=function(prompt,onConfirm,title){
	var p = Dialog(title);
	
	p.addHtml('<div class="message">'+Text.escapeHTML(prompt, true)+"</div>");
	p.addActionButton('No',()=>{});
	p.addActionButton('Yes', onConfirm);
}

/**
 * Show simple Prompt Box 
 * @param {string} prompt 
 * @param {function(string|number)} onConfirm 
 * @param {string} [title] - dialog title
 * @param {string} [value] - dialog initial value
 * @param {true|string} [validateRule] - validate rule like 'required|min:10|max:50|number'
 * @param {string} [type] - input type. Default - "text"
 */
export var Prompt = function(prompt, onConfirm, title, value, validateRule, type){
	type = type || 'text';
	var p = Dialog(title);
	p.addLabel(null, Text.escapeHTML(prompt, true));
	p.addInput('input', '', type, value, validateRule);
	p.addActionButton('Cancel',()=>{});
	p.addActionButton('Ok', ()=>{
		if (p.content.validator.validate()){
			tryCall(null, onConfirm, p.data.input);
		}else{
			return false;
		}
	});
}

/**
 * Show simple Alert box
 * @param {string} prompt 
 * @param {function()} [onConfirm]
 * @param {string} [title] 
 */
export var Alert=function(prompt,onConfirm,title){
	var p = Dialog(title);
	p.addHtml('<div class="message">'+Text.escapeHTML(prompt, true)+"</div>");
	p.addActionButton('Ok', onConfirm);
	//back navigation also means confirm!
	p.onBackNavigate = onConfirm
		
}
