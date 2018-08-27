//This module wraps some simple notifications

import { tryCall } from "./helpers";

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
 * Show simple Alert box
 * @param {string} prompt 
 * @param {function()} [onConfirm]
 * @param {string} [title] 
 */
export var Alert=function(prompt,onConfirm,title){
	/*if (!navigator.notification){
		tryCall(this,onConfirm);
		return;
	}*/

	navigator.notification.alert(prompt,function(){
		tryCall(this,onConfirm);
	},title);
}