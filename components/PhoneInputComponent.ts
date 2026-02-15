import { BaseComponent } from './BaseComponent';
import { Text } from '../core/text';
import { DOM } from '../core/DOM';
import { RegisterComponent } from '../core/Register';
import { Forms } from './Forms';
import { empty } from '../core/helpers';
export class PhoneInputComponent extends BaseComponent {
  isValid?: boolean;
  value: any = null;
  _formattedValue:any = null;
  placeholder:any = null;
  attr:any = {};
  _numberEl:any = null;
  constructor() {
    super();
  }

  get template() {
    return `<div [attribute]="this.attr">
      <input type="text" [attribute]="this.attr" bind = "this._formattedValue" onchange = "this._onChange($event)" oninput = "this._onInput($event)" [placeholder]="this.placeholder" />
    </div>`;
  }

  valueChange(val: string|null) {
    //remove the +1 part!
    if (typeof val == "string") {
      val = val.replace(/\+1/, '');
      this._formattedValue = val;
      this._formatAsPhoneNumber();
    }
    
  }

  onInit() {
    /** @type {HTMLInputElement} */
    this._numberEl = DOM(this.container).find("input").first();
  }

  _onInput(ev:InputEvent) {
    var el = this._numberEl;
    var selS = el.selectionStart;
    var selE = el.selectionEnd;
    var old = this._formattedValue || "";

    this._formatAsPhoneNumber();
    var newV = this._formattedValue || "";
    setTimeout(function () {
      var dif = newV.length - old.length;
      el.selectionStart = selS + dif;
      el.selectionEnd = selE + dif;
    }, 0);
  }

  _onChange(ev: InputEvent) {
    this._formatAsPhoneNumber();

    this.value = PhoneInputComponent.UnFormatPhoneNumber(this._formattedValue);
    this.onChange(ev);
  }

  /** @override */
  onChange(ev:InputEvent) {

  }
  /** @override */
  onInput(ev: InputEvent) {

  }
  // /** @override */
  // validate(){

  // }

  _formatAsPhoneNumber() {
    this._formattedValue = PhoneInputComponent.FormatPhoneNumber(this._formattedValue);
  }

  /**
   * Format phone number for display
   * @param {string} val 
   */
  static FormatPhoneNumber(val: string) {
    return Text.formatPhone(val, { 0: "(", 3: ')', 6: '-', 10: 'x' });
  }

  /**
   * Un-Format phone number for Data Transfer
   * @param {string} val 
   */
  static UnFormatPhoneNumber(val: string) {
    return empty(val) ? null : "+1" + val.replace(/\D/g, '');
  }

  /**
   * Use PhoneInputComponent as input-phone for rendering in Forms for phone type field
   */
  static Use(attributes: any) {
    attributes = attributes || {};
    RegisterComponent(PhoneInputComponent, 'input-phone');
    Forms.field_definitions.phone = (forms, el, parentPath) => {
      var opt = {};
      if (!el.placeholder)
        el.placeholder = "";
      Object.assign(opt, attributes, el.attributes);
      //custom elements will not emit 2 way binding events. so explicitly link onChange event with appropriate handler!
      return forms.renderFieldGroupHTML(el, `<input-phone 
        [(value)]="${forms.refactorAttrName('this.data.' + el._name)}"
        (onChange)="this.events.change.apply(this, arguments)"
        [(isValid)]="${forms.refactorAttrName('this.fields.' + el._name)}.attributes.isValid"
        [attr]="${forms.refactorAttrName('this.fields.' + el._name)}.attributes"
        [placeholder]="${forms.refactorAttrName('this.fields.' + el._name)}.placeholder"
        name="${el._name}"
        ${forms.generateAttributes(opt)}></input-phone>`);
    };
  }
}