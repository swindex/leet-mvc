import './NumericKeyboardPage.scss';
// @ts-ignore
import * as template from './NumericKeyboardPage.html';
import { BasePage } from './../BasePage';
import { Injector } from "./../../core/Injector";
import { DOM } from '../../core/DOM';
import { Objects } from '../../core/Objects';

export var NumericKeyboard = {
  isEnabled: false,
  /** @type {NumericKeyboardPage} */
  _page: null,
  options: {
    /** 0 - Tall simple, 1 -Tall Full, 2 - short full */
    layout: 0,
    selectOnFocus: false,
    selectForeColor: 'white',
    selectBackColor: '#039be5',
    theme: '',
  },
  enable() {
    if (NumericKeyboard.isEnabled)
      return;

    //DOM(document).off('focus.virtual_keyboard_c', focusEventHandler);

    DOM(document).on('focus', focusEventHandler, true);

    NumericKeyboard.isEnabled = true;
  },
  disable() {
    if (NumericKeyboard._page) {
      NumericKeyboard._page.destroyKB();
    }
    NumericKeyboard.isEnabled = false;
    DOM(document).off('focus', focusEventHandler);
  },
  onClick() {

  }

};

function focusEventHandler(event) {
  //'input[type=number], input[number]'
  /** @type {HTMLInputElement} */
  var el = event.target;
  if (el.tagName != "INPUT" || (el.getAttribute('type') != "number" && el.getAttribute('number') == null))
    return;

  /** @type {HTMLInputElement} */
  // @ts-ignore
  var elem = event.target;
  if (NumericKeyboard.isEnabled) {
    if (NumericKeyboard._page) {
      //if (!NumericKeyboard._page.isDeleting){
      NumericKeyboard._page.focusElement(elem);
      //}
    } else {
      NumericKeyboard._page = Injector.Nav.push(NumericKeyboardPage, NumericKeyboard.options);
      NumericKeyboard._page.focusElement(elem);
      NumericKeyboard._page.onDestroy = () => {
        NumericKeyboard._page = null;
      };
      NumericKeyboard._page.onClick = NumericKeyboard.onClick;
    }
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
function getPxNumber(val) {
  val = val + "";
  return Number(val.split('px')[0]);
}
class NumericKeyboardPage extends BasePage {
  constructor(options) {
    super();

    
    this.visibleParent = true;

    /** @type {HTMLInputElement} */
    this.old_input;
    /** @type {HTMLDivElement} */
    this.curr_input;

    this.mouseDownEl = null;

    this.old_input_hidden = false;

    this.blinker = null;
    this.value = null;
    this.isTextSelected = false;
    this.scrolled = 0;
    this.isPipeVisible = false;

    this._options = {
      layout: 0,
      selectOnFocus: false,
      selectForeColor: 'white',
      selectBackColor: '#039be5',
      theme: '',
    };

    this.cursorPosition = 0;

    this.inputStyle = {};

    this.setOptions(Object.assign({}, this._options, options));
  }

  /**
	 * 
	 * @param {{layout:number,selectOnFocus: boolean,selectForeColor: string,selectBackColor:string}} value 
	 */
  setOptions(value) {
    this._options = value;
    this.className = "layout-" + this._options.layout + ' ' + this._options.theme;
  }

  unFocusCurrentElement() {
    this.stopBlinker();
    DOM(this.old_input).css({ display: this.original.elemDisplay });
    DOM(this.curr_input).remove();
    this.old_input_hidden = false;
  }

  focusElement(elem) {
    var isNew = true;
    //same element
    if (this.curr_input == elem) {
      elem.blur();
      setTimeout(() => {
        window.focus();
      }, 1);
      return;
    }
    
    //switch to new element without closing keyboard
    if (this.curr_input) {
      this.enter();
      this.unFocusCurrentElement();

      isNew = false;
    }

    /** @type {HTMLInputElement} */
    this.old_input = elem;

    /** @type {HTMLDivElement} */
    this.curr_input = document.createElement('div');
    var st = DOM(elem).css(['display', 'padding', 'padding-top', 'padding-bottom', 'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-radius', 'font', 'font-size', 'color', 'top', 'left', 'bottom', 'right', 'width', 'height', 'position', 'background', 'box-shadow']);
    var p = getPxNumber(st['height']) - (getPxNumber(st['padding-top']) + getPxNumber(st['padding-bottom']));
    st['line-height'] = p + 'px';
    st['overflow'] = 'hidden';
    this.inputStyle = st;
    DOM(this.curr_input).css(st);

    this.setValue(elem.value);

    this.cursorPosition = (this.value+"").length;

    if (this._options.selectOnFocus) {
      this.isTextSelected = true;
    }

    if (isNew) {
      this.original = {
        type: elem.type,
        bodyStyle: DOM('body').css(['height', 'overflow', 'position']),
        elemClassName: elem.className,
        elemDisplay: DOM(elem).css('display')
      };

      this.original.bodyStyle.height = "100%";
    }

    //remove focus from the old element!
    elem.blur();
    setTimeout(() => {
      window.focus();
    }, 1);


    this.startBlinker();

    if (isNew) {
      this.hookEvents();
    }

    DOM(this.curr_input).on('mousedown', (ev)=>{
      //console.log(ev.target);
      if (ev.target && ev.target.getAttribute("index") !== null){
        this.setCursorPosition(Number(ev.target.getAttribute("index")));
      } else if (ev.target == this.curr_input) {
        this.setCursorPosition((this.getValue()+"").length);
      }
    })
  }

  hookEvents() {

    if (isTouchDevice()) {
      var ev_name = 'touchstart';
    } else {
      var ev_name = 'click';
    }
    //stop events bubbling past keyboard element
    DOM(this.page).on(ev_name, (ev) => {
      ev.stopPropagation();
    });
    //attach button events
    DOM(this.page).on(ev_name, (ev) => {
      if (ev.target.tagName != "BUTTON") {
        return;
      }
      ev.stopPropagation();
      ev.target.classList.add('active');
      setTimeout(() => {
        ev.target.classList.remove('active');
      }, 100);
      var v = ev.target.value;
      if (v == "d") {
        this.backspace();
      } else if (v == "e") {
        this.destroyKB();
      } else if (v == "-") {
        this.minus();
      } else {
        this.type_char(ev.target.value);
      }
    }, true);
    var self = this;
    //handle hardware keyboard input
    DOM(document).on('keydown.virtual_keyboard', (ev) => { self.customKB_keydownhandler(ev); });
    //handle click on anything other than the keyboard
    DOM(document).on('mousedown.virtual_keyboard', (ev) => {
      this.mouseDownEl = ev.target;
    });
    DOM(document).on('click.virtual_keyboard mouseup.virtual_keyboard', (ev) => {
      /** @type {HTMLInputElement} */
      // @ts-ignore
      var el = ev.target;
      //if old element is still visible then hide the old element and exit here
      if (!this.old_input_hidden) {
        this.old_input_hidden = true;
        DOM(this.old_input).css({ display: 'none' });
        DOM(this.curr_input).css({ display: self.original.elemDisplay });
        DOM(this.curr_input).insertAfter(this.old_input);
        this.setValue(this.old_input.value);
        return;
      }
      //weird click mousedown does not match!
      if (this.mouseDownEl !== el) {
        return;
      }

      //if clicked inside current_input then return
      if (this.curr_input === el || this.curr_input.contains(el)) {
        return;
      }
      //if clicked inside keyboard then return as well
      if (self.page.contains(el)) {
        return;
      }
      //in clicked on another "input[number]" then trigger change event for the current field
      if (el.tagName === "INPUT" && (el.type === "number" || el.getAttribute('number') != null)) {
        self.curr_input.dispatchEvent(new Event('change'));
        return;
      }

      //if clicked outside of keyboard AND target element is not input number, simulate ENTER
      ev.stopPropagation();
      self.destroyKB();

    });
    
    var w_h = window.innerHeight;

    var kb_h = this.page.offsetHeight;

    //phase one: show keyboard slowly with body the same
    DOM(this.page).css({ top: (w_h - kb_h) + "px" });
    this.listenResize = true;
    this._resizeBody(true);
  }

  setCursorPosition(posIndex){
    if (posIndex < 0 )
      posIndex = 0;

    this.cursorPosition = posIndex;
    this.isTextSelected = false
    //this.stopBlinker();
    //this.startBlinker();
  }

  _resizeBody(emitResize) {
    if (!this.listenResize) {
      return;
    }
    var w_h = window.innerHeight;

    var kb_h = this.page.offsetHeight;

    //phase two resize body after keyboard is shown
    var self = this;
    setTimeout(() => {
      if (!self.page || !this.listenResize) {
        //in case page is already removed
        return;
      }
      var w_h = window.innerHeight;
      var b_h = w_h - kb_h + 10;

      DOM(self.page).css({ top: (w_h - kb_h) + "px" });

      DOM('body').css({ height: b_h + "px", overflow: 'visible', position: 'relative' });
      if (emitResize) {
        window.dispatchEvent(new Event('resize'));
      }

      var c = DOM(self.curr_input).closest('.scroll').first();
      if (!c) {
        c = DOM(self.curr_input).closest('.content').first();
      }
      if (c) {
        var input_p = DOM(self.curr_input).offsetTop() + self.curr_input.offsetHeight - c.scrollTop;
        if (input_p > b_h) {
          var s = kb_h + c.scrollTop;
          DOM(c).scrollTo({ top: s, behavior: 'smooth' });
          this.scrolled = kb_h;
        }

      }

    }, 400);
  }


  destroyKB() {
    this.destroy();
  }
  /*onBackNavigate(){
		this.destroyKB();
		return true;
	}*/

  //prepare for removing the keyboard page
  onBeforeDestroy() {
    this.unFocusCurrentElement();
    DOM(this.page).removeAllEventListeners();
    DOM(document).off('keydown.virtual_keyboard');
    DOM(document).off('click.virtual_keyboard mouseup.virtual_keyboard');
    DOM(document).off('focus.virtual_keyboard');
    DOM(document).off('mousedown.virtual_keyboard');

    var w_h = window.innerHeight;
    var kb_h = this.page.offsetHeight;
    DOM(this.page).css({ top: w_h - kb_h + "px" });

    DOM('body').css(this.original.bodyStyle);

    this.listenResize = false;
    window.dispatchEvent(new Event('resize'));

    this.enter();
  }

  onResize() {
    this.window_resize = true;
    this._resizeBody(false);
  }

  customKB_keydownhandler(e) {
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
  }

  setValue(t) {
    this.value = t;
    this.old_input.value = t;
    /*var v = Number(t);
    if (!isNaN(v)) {
      //v = numberFromLocaleString(t);
      //this.old_input.value = v;
    } else {
      //this.old_input.value = t;
    }*/



    var style = "";
    if (this.isTextSelected) {
      style = `background-color: ${this._options.selectBackColor}; color: ${this._options.selectForeColor}`;
    }
    var pipechar = `<span style="border-left:1px solid ${this.inputStyle['color']};">&nbsp;</span>`;
    
    var items = (t+"").split('');
    
    var digits = Objects.map(items, (d,i) => {
      var cstyle = "";
      if (i == this.cursorPosition) {
        if (this.isPipeVisible) {
          cstyle = `<span style="position:absolute;width:1px;height:1.25em;background-color: ${this.inputStyle['color']};top:0;left:0;"></span>`
        } else {
          cstyle = ``
        }
      } else {
        //cstyle = `border-left: 1px solid transparent;`
      } 

      return `<span index="${i}" style="position:relative;">${d}${cstyle}</span>`
    });

    this.curr_input.innerHTML = `<span style="${style};">` + digits.join('') + '</span>' //+ (this.isPipeVisible ? pipechar : '&nbsp;');
    
    //end pipechar
    if (this.cursorPosition >= digits.length && this.isPipeVisible) {
      this.cursorPosition = digits.length;
      this.curr_input.innerHTML += pipechar;
    }

    /*if (this.isPipeVisible) {
      DOM(this.curr_input).find(`[index=${this.cursorPosition}]`)
    }*/
  }

  getValue() {
    return this.old_input.value || this.value;
    //return this.value;
  }

  blink() {
    this.isPipeVisible = !this.isPipeVisible;
    this.setValue(this.value);
  }

  startBlinker() {
    this.blinker = setInterval(() => {
      if (!this.isDeleted) {
        this.blink();
      }
    }, 400);
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
    if (chr == "." && r_val.indexOf(".") >= 0) {
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

    var digits = (r_val+"").split('');
    digits.splice(this.cursorPosition,0,chr.toString())
    this.cursorPosition ++;
    this.setValue( digits.join(''));
    this.old_input.dispatchEvent(new Event('input'));
    this.onClick();
    return false;
  }
  backspace() {
    if (this.cursorPosition > 0 ) {
      var r_val = this.getValue(); //remove caret
      this.isTextSelected = false;

      var digits = (r_val+"").split('');
      digits.splice(this.cursorPosition-1,1)
      this.cursorPosition --;

      this.setValue(digits.join('')); //remove last char and add caret
      this.old_input.dispatchEvent(new Event('input'));
    }

    this.onClick();
    return false;
  }
  /**
	 * *** Override ***
	 */
  onClick() {

  }
  minus() {
    var r_val = this.getValue(); //remove caret
    this.isTextSelected = false;

    if (r_val.substring(0, 1) == "-") {
      //Remove minus
      this.setCursorPosition(this.cursorPosition - 1);
      this.setValue(r_val.substring(1, r_val.length)); //remove minus char
    }
    else {
      //remove minus
      this.setCursorPosition(this.cursorPosition + 1);
      this.setValue("-" + r_val); //add minus
    }
    this.old_input.dispatchEvent(new Event('input'));
    this.onClick();
    return false;
  }

  enter(silent) {
    this.stopBlinker();
    silent = silent || false;
    if (this.curr_input != null && typeof (this.getValue()) !== "undefined") {
      //trigger onchange
      this.old_input.dispatchEvent(new Event('change'));

      //trigger blur
      this.old_input.dispatchEvent(new Event('blur'));
    }
    if (!silent)
      this.onClick();
    return false;
  }

  get template() {
    return this.extendTemplate(super.template, template);
  }
}

NumericKeyboardPage.selector = "page-NumericKeyboardPage";
NumericKeyboardPage.className = "page-NumericKeyboardPage";