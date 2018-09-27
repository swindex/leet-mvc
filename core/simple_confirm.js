//This module wraps some simple notifications
import { tryCall } from "./helpers";
import { Dialog } from "leet-mvc/pages/DialogPage/DialogPage";
import { Text } from "leet-mvc/core/text";
import { Objects } from "leet-mvc/core/Objects";

/**
 * Show "Confirm" dialog with custom buttons
 * @param {string} prompt 
 * @param {string} [title] 
 * @param {{[button_name:string]:function()}} buttons 
 */
export var ConfirmButtons=function(prompt,title,buttons){
	var p = Dialog(title);
	
	p.addLabel(null, Text.escapeHTML(prompt, true));
	Objects.forEach(buttons,(button, name)=>{
		p.addActionButton(name,button);
	})
}

/**
 * Show simple Confirm Box 
 * @param {string} prompt 
 * @param {function()} onConfirm 
 * @param {string} [title] 
 */
export var Confirm=function(prompt,onConfirm,title){
	var p = Dialog(title);
	
	p.addLabel(null, Text.escapeHTML(prompt, true));
	p.addActionButton('No',()=>{});
	p.addActionButton('Yes', onConfirm);
}

/**
 * Show simple Prompt Box 
 * @param {string} prompt 
 * @param {function(string|number)} onConfirm 
 * @param {string} [title] - dialog title
 * @param {true|string} [validateRule] - validate rule like 'required|min:10|max:50|number'
 */
export var Prompt = function(prompt,onConfirm, title, value, validateRule){
	var p = Dialog(title);
	p.addLabel(null, Text.escapeHTML(prompt, true));
	p.addInput('input', '', 'text', value, validateRule);
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
	p.addLabel(null, Text.escapeHTML(prompt, true));
	p.addActionButton('Ok', onConfirm);
}
