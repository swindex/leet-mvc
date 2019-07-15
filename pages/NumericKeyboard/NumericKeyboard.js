import './NumericKeyboardPage.scss';
// @ts-ignore
import * as template from './NumericKeyboardPage.html';
import { BasePage } from './../BasePage'; 
import { Injector } from "./../../core/Injector";

export var NumericKeyboard = {
	isEnabled: false,
	_page:null,
	options : {
		layout:0,
		selectOnFocus : false,
		selectForeColor : 'white',
		selectBackColor : '#039be5',
		theme : '',
	},
	enable(){
		if (NumericKeyboard.isEnabled)
			return;

		$(document).off('focus.virtual_keyboard_c');

		$(document).on('focus.virtual_keyboard_c', 'input[type=number]', (event)=> {
			/** @type {HTMLInputElement} */
			// @ts-ignore
			var elem = event.target;
			if (NumericKeyboard.isEnabled){
				if (NumericKeyboard._page){
					NumericKeyboard._page.focusElement(elem);
				} else { 
					NumericKeyboard._page = Injector.Nav.push(NumericKeyboardPage, NumericKeyboard.options);
					NumericKeyboard._page.focusElement(elem);
					NumericKeyboard._page.onDestroyed = ()=>{
						NumericKeyboard._page=null;
					}
					NumericKeyboard._page.onClick = NumericKeyboard.onClick;
				}
			}

		});

		NumericKeyboard.isEnabled = true;
	},
	disable(){
		if (NumericKeyboard._page){
			NumericKeyboard._page.destroyKB(); 
		}
		NumericKeyboard.isEnabled = false;
		$(document).off('focus.virtual_keyboard_c');
	},
	onClick(){

	}
	
}

function isTouchDevice() {
	try {
		document.createEvent("TouchEvent");
		return true;
	} catch (e) {
		return false;
	}
}
function getPxNumber(val){
	val = val+"";
	return Number(val.split('px')[0]);
}
class NumericKeyboardPage extends BasePage {
	constructor(options) {
		super();
	
		/** @type {HTMLInputElement} */
		this.old_input;
		/** @type {HTMLDivElement} */
		this.curr_input;

		this.mouseDownEl = null;

		this.old_input_hidden = false;

		this.blinker = null;
		this.value = "";
		this.isTextSelected = false;

		this.isPipeVisible = false;

		this._options = {
			layout:0,
			selectOnFocus : false,
			selectForeColor : 'white',
			selectBackColor : '#039be5',
			theme: '',
		}

		this.inputStyle = {};

		this.setOptions(Object.assign({},this._options, options));
	}

	/**
	 * 
	 * @param {{layout:number,selectOnFocus: boolean,selectForeColor: string,selectBackColor:string}} value 
	 */
	setOptions (value){
		this._options = value;
		this.className = "layout-"+ this._options.layout + ' '+ this._options.theme ;
	}

	unFocusCurrentElement(){
		this.stopBlinker();
		$(this.old_input).css({display:this.original.elemDisplay})
		$(this.curr_input).remove();
		this.old_input_hidden = false;
	}

	focusElement(elem){
		var isNew = true;
		//same element
		if (this.curr_input == elem){
			elem.blur();
			setTimeout(()=>{
				window.focus();
			},1);
			return;
		}
		//switch to new element without closing keyboard
		if (this.curr_input){
			this.enter();
			this.unFocusCurrentElement();
			
			isNew = false;
		}
		
		/** @type {HTMLInputElement} */
		this.old_input = elem;
		
		/** @type {HTMLDivElement} */ 
		this.curr_input = document.createElement('div');
		var st = $(elem).css(['display','padding','padding-top','padding-bottom','border','border-top','border-bottom','border-left','border-right','border-radius','font','font-size','color','top','left','bottom','right','width','height','position','background','box-shadow']);
		var p = getPxNumber(st['height']) - (getPxNumber(st['padding-top'])+getPxNumber(st['padding-bottom']));
		st['line-height'] = p + 'px';
		st['overflow'] = 'hidden';
		this.inputStyle = st
		$(this.curr_input).css(st);

		this.setValue(elem.value);

		
		if (this._options.selectOnFocus){
			this.isTextSelected = true;
		}

		this.original = {
			type: elem.type,
			bodyStyle:$('body').css(['height','overflow', 'position']),
			elemClassName: elem.className,
			elemDisplay:  $(elem).css('display')
		};

		this.original.bodyStyle.height = "100%";

		//remove focus from the old element!
		elem.blur();
		setTimeout(()=>{
			window.focus();
		},1);


		this.startBlinker()

		if (isNew){
			this.hookEvents();
		}
	}
	
	hookEvents(){

		if (isTouchDevice()) {
			var ev_name = 'touchstart';
		} else {
			var ev_name = 'click';
		}
		//stop events bubbling past keyboard element
		this.page.on( ev_name, (ev) => {
			ev.stopPropagation();
		});
		//attach button events
		this.page.on( ev_name, "button" ,(ev) => {
			ev.stopPropagation();
			$(ev.target).addClass('active');
			setTimeout(()=>{
				$(ev.target).removeClass('active');
			},100)
			var v = ev.target.value;
			if ( v=="d" ) {
				this.backspace();
			}else if ( v=="e" ) {
				this.destroyKB();
			}else if ( v=="-" ) {
				this.minus();
			}else{
				this.type_char(ev.target.value);
			}
		});
		var self = this;
		//handle hardware keyboard input
		$(document).on('keydown.virtual_keyboard',(ev)=>{self.customKB_keydownhandler(ev)});
		//handle click on anything other than the keyboard
		$(document).on('mousedown.virtual_keyboard',(ev)=>{
			this.mouseDownEl = ev.target;
		});
		$(document).on('click.virtual_keyboard, mouseup.virtual_keyboard',(ev)=>{
			/** @type {HTMLInputElement} */ 
			// @ts-ignore
			var el = ev.target;
			//if old element is still visible then hide the old element and exit here
			if (!this.old_input_hidden){
				this.old_input_hidden = true;
				$(this.old_input).css({display:'none'});
				$(this.curr_input).css({display: self.original.elemDisplay});
				$(this.curr_input).insertAfter(this.old_input);
				this.setValue(this.old_input.value);
				return;
			}
			//weird click mousedown does not match!
			if (this.mouseDownEl !== el) {
				return;
			}

			//if clicked inside current_input then return
			if (this.curr_input === el || $.contains(this.curr_input, el)){
				return;
			}
			//if clicked inside keyboard then return as well
			if ($.contains(self.page[0], el)){
				return;
			}
			//in clicked on another "input[number]" then trigger change event for the current field
			if (el.tagName === "INPUT" && el.type === "number"){
				self.curr_input.dispatchEvent(new Event('change'));
				return;
			}

			//if clicked outside of keyboard AND target element is not input number, simulate ENTER
			ev.stopPropagation();
			self.destroyKB();
			
		});

		var w_h =  $(window).height();

		var kb_h =  this.page.height();

		//phase one: show keyboard slowly with body the same
		this.page.css({top:w_h - kb_h});
		this.listenResize = true;
		this._resizeBody(true);	
	}

	_resizeBody(emitResize){
		if (!this.listenResize){
			return;
		}
		var w_h =  $(window).height();

		var kb_h =  this.page.height();

		//phase one: show keyboard slowly with body the same
		//this.page.css({top:w_h - kb_h});

		//phase two resize body after keyboard is shown
		var self = this;
		setTimeout(()=>{
			if (!self.page || !this.listenResize){
				//in case page is already removed
				return;
			}
			var w_h =  $(window).height();
			var b_h = w_h - kb_h;
	
			self.page.css({top:w_h - kb_h});

			//$('body').css(this.bodyStyle);
			$('body').css({height:b_h, overflow:'visible', position:'relative'});
			if (emitResize){
				window.dispatchEvent(new Event('resize'));
			}
			var input_p = $(self.curr_input).offset().top + $(self.curr_input).height();
			if (input_p > b_h){
				var c = $(self.curr_input).closest('.scroll');
				if (c.length == 0) {
					c = $(self.curr_input).closest('.content');
				}
				if (c.length > 0) {
					var s = kb_h + c.scrollTop()
					c.animate({scrollTop: s}, 300);
					this.scrolled= kb_h;
				}
			}
			
		},400);
	}

	//prepare for removing the keyboard page
	destroyKB(){
		this.unFocusCurrentElement();
		this.page.off();
		$(document).off('keydown.virtual_keyboard');
		$(document).off('click.virtual_keyboard, mouseup.virtual_keyboard');
		$(document).off('focus.virtual_keyboard');
		$(document).off('mousedown.virtual_keyboard');

		var w_h =  $(window).height();
		var kb_h =  this.page.height();
		this.page.css({top:w_h - kb_h});
		
		$('body').css(this.original.bodyStyle);

		this.listenResize = false;
		window.dispatchEvent(new Event('resize'));
			
		this.enter();
		this.destroy();
		this.onDestroyed();
	}

	onResize(){
		this.window_resize=true;
		this._resizeBody(false);
	}

	/**
	 * Notify creator that keyboard has been destroyed
	 */
	onDestroyed(){

	}

	customKB_keydownhandler (e) {
		switch (e.keyCode) {
			case 27:
				e.preventDefault();
				this.destroyKB();
				break;
			case 46:
			case 8:
				e.preventDefault();
				this.backspace();
				break;
			case 13:
				e.preventDefault();
				this.destroyKB();
				break;
			case 109:
				e.preventDefault();
				this.minus();
				break;
			case 190:
			case 110:
				e.preventDefault();
				this.type_char(".");
				break;
			case 48:
			case 96:
				e.preventDefault();
				this.type_char(0);
				break;
			case 49:
			case 97:
				e.preventDefault();
				this.type_char(1);
				break;
			case 50:
			case 98:
				e.preventDefault();
				this.type_char(2);
				break;
			case 51:
			case 99:
				e.preventDefault();
				this.type_char(3);
				break;
			case 52:
			case 100:
				e.preventDefault();
				this.type_char(4);
				break;
			case 53:
			case 101:
				e.preventDefault();
				this.type_char(5);
				break;
			case 54:
			case 102:
				e.preventDefault();
				this.type_char(6);
				break;
			case 55:
			case 103:
				e.preventDefault();
				this.type_char(7);
				break;
			case 56:
			case 104:
				e.preventDefault();
				this.type_char(8);
				break;
			case 57: 
			case 105:
				e.preventDefault();
				this.type_char(9);
				break;

		}
	};

	setValue(t){
		this.value = t;
		this.old_input.value = Number(t)+"";
		var style = "";
		if (this.isTextSelected) {
			style = `background-color: ${this._options.selectBackColor}; color: ${this._options.selectForeColor}`;
		}
		var pipechar = `<span style="border-left:1px solid ${this.inputStyle['color']};">&nbsp;</span>`
		this.curr_input.innerHTML =`<span style="${style}">`+ t + '</span>' + (this.isPipeVisible ? pipechar :  '&nbsp;');
	}

	getValue() {
		return this.value;
	}
	
	blink() {
		var t = this.getValue();
	
		this.isPipeVisible = !this.isPipeVisible;
		this.setValue(t);
	}

	startBlinker(){
		this.blinker = setInterval(()=>{
			if (!this.isDeleted){
				this.blink();
			}
		},400);
	}

	stopBlinker() {
		this.isTextSelected = false;
		clearInterval(this.blinker);
		this.setValue(this.getValue());
	}
	type_char(chr) {
		var r_val = this.getValue();

		if (this.isTextSelected) {
			this.isTextSelected = false;
			r_val = "";
		}

		//if DOT already exists, do nothing
		if (chr == "." && r_val.indexOf(".")>=0) {
			return;
		}
		//if first char is 0, add DOT after
		if (r_val == "0" && chr !== ".") {
			r_val = r_val + ".";
		}
		//if first char is DOT, add 0 before
		if (r_val == "" && chr == ".") {
			r_val = r_val + "0"; //. will be added later
		}
		this.setValue(r_val + chr.toString());
		this.old_input.dispatchEvent(new Event('input'));
		this.onClick();
		return false;
	};
	backspace () {
		var r_val = this.getValue(); //remove caret
		this.isTextSelected = false;
		this.setValue( r_val.substring(0, r_val.length - 1)); //remove last char and add caret
		this.old_input.dispatchEvent(new Event('input'));
		this.onClick();
		return false;
	};
	/**
	 * *** Override ***
	 */
	onClick () {
		
	};
	minus () {
		var r_val = this.getValue(); //remove caret
		this.isTextSelected = false;

		if (r_val.substring(0, 1) == "-") {
			//Remove minus
			this.setValue(r_val.substring(1, r_val.length)); //remove minus char
		}
		else {
			//remove minus
			this.setValue("-" + r_val); //add minus
		}
		this.old_input.dispatchEvent(new Event('input'));
		this.onClick();
		return false;
	};

	enter (silent) {
		this.stopBlinker();
		silent = silent || false;
		if (this.curr_input != null && typeof (this.getValue()) !== "undefined") {
			//trigger onchange
			this.old_input.dispatchEvent(new Event('change'));
		}
		if (!silent)
			this.onClick();
		return false;
	};
}

NumericKeyboardPage.template = template;
NumericKeyboardPage.selector ="page-NumericKeyboardPage";
NumericKeyboardPage.className ="page-NumericKeyboardPage";
NumericKeyboardPage.visibleParent = true;