//This module wraps some simple notifications

import { tryCall } from "./helpers";
import { FormValidator } from "leet-mvc/core/form_validator";
import { Dialog } from "leet-mvc/pages/DialogPage/DialogPage";

/**
 * Show "Confirm" dialog with custom buttons
 * @param {string} prompt 
 * @param {string} [title] 
 * @param {{[button_name:string]:function()}} buttons 
 */
export var ConfirmButtons=function(prompt,title,buttons){
	var buts = Object.keys(buttons);
	navigator.notification.confirm(prompt,function(btn){
		tryCall(this,buttons[buts[btn-1]]);
	},title,buts);
}

/**
 * Show simple Confirm Box 
 * @param {string} prompt 
 * @param {function()} onConfirm 
 * @param {string} [title] 
 */
export var Confirm=function(prompt,onConfirm,title){
	var buts = ['Yes', 'No'];
	navigator.notification.confirm(prompt,function(btn){
		if (btn==1){
			tryCall(this,onConfirm);
		}
	},title,buts);
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
	p.addLabel(null, prompt);
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
	navigator.notification.alert(prompt,function(){
		tryCall(this,onConfirm);
	},title);
}