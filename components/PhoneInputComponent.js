import { BaseComponent } from './BaseComponent';
import { Text } from '../core/text';
import { DOM } from '../core/DOM';
import { RegisterComponent } from '../core/Register';
import { Forms } from './Forms';
export class PhoneInputComponent extends BaseComponent {
  constructor() {
    super();

    this._numberEl = null;
    this.value = null;
    this._formattedValue = null;
    this.template = `
    <div>
      <input type="text" [attribute]={name:this.attributes.name} bind = "this._formattedValue" number oninput = "this._onInput($event)" onchange = "this._onChange($event)" />
    </div>
    `;
  }

  /*get value() {
    return empty(this._formattedValue) ? null : this._formattedValue.replace(/\D/g, '');
  }*/

  /**
   * 
   * @param {string|null} val 
   */
  valueChange(val) {
    //remove the +1 part!
    if (typeof val == "string") {
      val = val.replace(/\+1/, '');
    }
    this._formattedValue = val;
    this._formatAsPhoneNumber();
  }

  onInit() {
    /** @type {HTMLInputElement} */
    this._numberEl = DOM(this.container).find("input").first();
  }

  _onInput(ev) {
    this._formatAsPhoneNumber();
  }

  _onChange(ev) {
    this._formatAsPhoneNumber();

    this.value = empty(this._formattedValue) ? null : "+1" + this._formattedValue.replace(/\D/g, '');
    this.onChange(ev);
  }

  /** @override */
  onChange(ev) {

  }
  /** @override */
  onInput(ev) {

  }
  // /** @override */
  // validate(){

  // }

  _formatAsPhoneNumber() {
    var el = this._numberEl;
    var selS = el.selectionStart;
    var selE = el.selectionStart;
    var old = this._formattedValue;
    //setTimeout(function () {
    this._formattedValue = Text.formatPhone(this._formattedValue, { 0: "(", 3: ')-', 6: '-', 10: 'x' });
    var dif = el.value.length - old.length;
    el.selectionStart = selS + dif;
    el.selectionEnd = selE + dif;
    //}, 1);
  }

  static Use() {
    RegisterComponent(PhoneInputComponent, 'input-phone');
    Forms.field_definitions.phone = (forms, el, parentPath) => {
      var opt = {};
      Object.assign(opt, el.attributes);
      //custom elements will not emit 2 way binding events. so explicitly link onChange event with appropriate handler!
      return forms.renderFieldGroupHTML(el, `<input-phone [(value)]="${forms.refactorAttrName('this.data.' + el._name)}" (onChange)="this.events.change.apply(this, arguments)" [(isValid)]="${forms.refactorAttrName('this.fields.' + el._name)}.attributes.isValid"  name="${el._name}" ${forms.generateAttributes(opt)}></input-phone>`);
    };
  }
}
