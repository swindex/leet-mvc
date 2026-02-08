// @ts-nocheck
import { Objects } from "./../core/Objects";
import { FormValidator } from "./../core/form_validator";
import { Text } from "./../core/text";
import { BaseComponent } from "./BaseComponent";
import { isNumber, isArray, isString, isObject, empty } from "./../core/helpers";
import { DateTime } from "./../core/DateTime";
import { Translate } from "../core/Translate";
import { tryCall, round } from '../core/helpers';
import { Alert } from "../core/simple_confirm";
import { DOM } from "../core/DOM";
import { FileAccess } from "../core/FileAccess";

export class Forms extends BaseComponent {
  /**
   * Forms Directive. Generate forms from JSON data
   * @param {FieldTemplate[]} formTemplate 
   * @param {*} [data]
   * @param {*} [errors]
   * @param {{nestedData?:boolean, formClass?:string, fieldClass?:string}} [options]
   */
  constructor(formTemplate, data, errors, options) {
    super(); 
    this.formTemplate = Objects.copy(formTemplate);
    this.data = data || {};

    this.extraData = {};

    this.errors = errors || {};

    /** @type {{[key: string]: FieldTemplate}} */
    this.fields= {};

    this.options = { nestedData: true, formClass: 'formgroup', fieldClass: 'fieldgroup' };
    Object.assign(this.options, options);

    this.validator = new FormValidator(this.data,  this.formTemplate, this.errors, { nestedData: this.options.nestedData });

    this.attrEvents = {};
    this.types = {};
    this.arrays = {};

    this.elementItems = {};

    this.events = {
      input: (ev) => {
        setTimeout(() => {
          this.onInput(ev);
        }, 0);
      },
      click: (ev) => {
        //notify in the next render cycle.
        setTimeout(() => {
          this.onClick(ev);
        }, 0);
      },
      change: (ev) => {
        //validate element on change
        if (ev.target.name) {
          //validate in the next render cycle.
          setTimeout(() => {
            if (this.validator) {
              this.validator.validateField(ev.target.name);
              this.binder.updateElements();
            }
          }, 0);
        }
        //notify in the next render cycle.
        setTimeout(() => {
          if (this.onChange == this.events.change) {
            console.error(ev);
            throw new Error("Change triggers infinite loop!");
          }
          this.onChange(ev);
        }, 0);
      },
      focus: (ev) => {
        var _name = ev.target.name;
        if (_name) {
          setTimeout(() => {
            this.fields[_name].attributes.active = true;
          });
        }
      },
      blur: (ev) => {
        var _name = ev.target.name;
        if (_name) {
          setTimeout(() => {
            this.fields[_name].attributes.active = null;
          });
        }
      }
    };
    this.field_definitions = Forms.field_definitions;

    this.template = `<div [html]="this.formHTML"></div>`;

    this.updateTemplate(this.formTemplate);
  }

  setDataValuesFromFields() {
    Objects.forEach(this.fields, (field, key) => {
      try {
        var currentValue = Objects.getPropertyByPath(this.data, key);

        if (field.value !== undefined && currentValue == undefined) {
          Objects.setPropertyByPath(this.data, key, field.value);
        }
      } catch (err) {

      }
    });
  }

  updateTemplate(formTemplate) {
    this.formTemplate = Objects.copy(formTemplate);

    Objects.overwrite(this.errors, {});
    this.validator = new FormValidator(this.data,  this.formTemplate, this.errors, this.options);
    this.fields = this.validator.fields;
    this.setDataValuesFromFields();
    this.validator.validateVisibility();


    var html = this.renderArray(this.formTemplate, null);
    this.formHTML = html;
  }

  ///listen to attempts to overwrite onChange listener 
  onChangeChange(value) {
    if (isObject(this.events) && value == this.events.change) {
      console.error(value);
      throw new Error("Attempt to override Forms.onChange callback with Forms.events.change will lead to infinite loop!");
    }
  }
  ///listen to attempts to overwrite onInput listener 
  onInputChange(value) {
    if (isObject(this.events) && value == this.events.input) {
      console.error(value);
      throw new Error("Attempt to override Forms.onInput callback with Forms.events.input will lead to infinite loop!");
    }
  }
  ///listen to attempts to overwrite onClick listener 
  onClickChange(value) {
    if (isObject(this.events) && value == this.events.click) {
      console.error(value);
      throw new Error("Attempt to override Forms.onClick callback with Forms.events.click will lead to infinite loop!");
    }
  }

  /** 
   * @param {HTMLInputElementChangeEvent} event
   */
  onChange(event) {

  }

  /** 
   * @param {HTMLInputElementChangeEvent} event
   */
  onInput(event) {

  }
  /** 
   * @param {HTMLInputElementChangeEvent} event
   */
  onClick(event) {

  }

  /** 
   * @param {HTMLElementMouseEvent} event
   */
  onButtonClick(event) {

  }

  _formatSplitDateField(evt, name, isTime) {
    /** @type {HTMLInputElement} */
    var el = evt.target;
    //console.log(evt, name, isTime);
    var date = null;
    var time = null;

    if (isTime) {
      date = Objects.getPropertyByPath(this.data, name);
      time = DateTime.fromHumanTime(el.value);
    } else {
      date = DateTime.fromHumanDate(el.value);
      time = Objects.getPropertyByPath(this.data, name);
    }

    var newDate = DateTime.combineDateTime(date, time);
    Objects.setPropertyByPath(this.data, name, newDate);

    //console.log(newDate);
  }

  _formatPhoneNumber(evt) {
    var el = evt.target;
    var selS = el.selectionStart;
    var selE = el.selectionStart;
    var old = el.value;
    setTimeout(function () {
      el.value = Text.formatPhone(el.value, { 3: '-', 6: '-', 10: 'x' } /*{3:'-',6:'-'}/**/);
      var dif = el.value.length - old.length;
      el.selectionStart = selS + dif;
      el.selectionEnd = selE + dif;
    }, 1);
  }


  /**
   * 
   * @param {FieldTemplate[]} formTemplate 
   */
  renderArray(formTemplate, parentPath) {
    var html = [];

    for (var i in formTemplate) {
      if (!formTemplate.hasOwnProperty(i)) continue;
      var el = formTemplate[i];
      if (el.type) {
        if (el.type == "form") {
          var ret = this.render_field(el, parentPath);
        } else {
          //do we support nested data?
          if (!this.options.nestedData) {
            parentPath = null;
          }

          var ret = this.render_field(el, parentPath);
        }
        if (ret) {
          html.push(ret);
        }
      }
    }
    return html.join('');
  }



  /**
   * 
   * @param {FieldTemplate} el 
   * @param {string} parentPath 
   */
  render_field(el, parentPath) {
    /** @type {string} */
    el.type = el.type ? el.type.toLowerCase() : '';

    if (this.field_definitions[el.type]) {
      if (this.fields[el._name] && el.attributes) {
        Object.assign(this.fields[el._name].attributes, el.attributes);
      }
      if (el.items) {
        this.elementItems[el._name] = el.items;
      }
      return tryCall(this, this.field_definitions[el.type], this, el, parentPath);
    } else {
      throw Error("Unknown form element type:" + el.type + " in " + JSON.stringify(el, null, '\t'));
    }
  }

  assertValidateRuleHas(el, mustHave) {
    if (!el.validateRule)
      el.validateRule = mustHave;
    else if (el.validateRule.indexOf('email') < 0)
      el.validateRule = el.validateRule + "|" + mustHave;
  }

  /**
   * 
   * @param {FieldTemplate} el 
   * @param {string} [parentPath]
   */
  addForm(el, parentPath) {
    //do we support nested data?
    if (!this.options.nestedData) {
      parentPath = null;
    }

    if (parentPath && el.name) {
      //el._name = parentPath + "." + el.name ;
    } else {
      //el._name = el.name;
    }
    if (el._name) {
      //if create value in each structure
      if (!Objects.getPropertyByPath(this.data, el._name))
        Objects.setPropertyByPath(this.data, el._name, {});
      if (!Objects.getPropertyByPath(this.errors, el._name))
        Objects.setPropertyByPath(this.errors, el._name, {});
    }

    return this.renderFormHTML(el, this.renderArray(el.items, el._name));
  }

  /**
   * 
   * @param {FieldTemplate} el 
   * @param {string} [parentPath]
   */
  addArray(el, parentPath) {
    //do we support nested data?
    if (!this.options.nestedData) {
      parentPath = null;
    }

    if (parentPath && el.name) {
      el._name = parentPath + "." + el.name;
    } else {
      el._name = el.name;
    }
    if (el._name) {
      //if create value in each structure
      if (!this.getPropertyByPath(this.data, el._name))
        Objects.setPropertyByPath(this.data, el._name, {});
      if (!this.getPropertyByPath(this.errors, el._name))
        Objects.setPropertyByPath(this.errors, el._name, {});
    }

    this.arrays[el.name] = [""];

    return this.renderArrayHTML(el, this.renderArray(el.items, el._name));
  }

  /**
   * @returns {{[key:string]:any}}
   */
  getVisibleData() {
    return this.validator.getVisibleData();
  }

  /**
   * 
   * @param {FieldTemplate} el 
   * @param {string} childrenHTML
   */
  renderArrayHTML(el, childrenHTML) {
    /** @type {FieldTemplate} */
    var buttonEl = {
      name: el.name + "_add_button",
      _name: el.name + "_add_button",
      type: "button",
      value: el.title,
      attributes: {
        click: function () {
          this.arrays[el.name].push("");
        }
      }
    };

    return `<div>
${this.addButton(buttonEl)}
<div [foreach]="this.arrays['${el.name}']">
${childrenHTML}
</div>
</div>
`;

  }

  renderFormHTML(el, childrenHTML) {
    return `
<div class="${this.options.formClass} ${el.class}" [if]="this.getIsVisible('${el._name ? el._name : ''}')">
${this.addTitle(el)}
${childrenHTML}
</div>
`;
  }

  renderFieldGroupHTML(el, elHTML, noTitle = false, noErrorHint = false) {
    var isRequired = el.validateRule ? el.validateRule.match(/\brequired\b/) : null;
    if (isRequired) {
      //required can not be inside a template.
      isRequired = !el.validateRule.match(/{{.*\brequired\b.*}}/);
    }

    return `
<div class="${this.options.fieldClass} ${el.class ? ' ' + el.class : ''} ${el.type ? ' ' + el.type : ''} ${isRequired ? 'required' : ''} ${el.icon ? 'hasIcon' : ''}" [class]="this.getClassName('${el._name ? el._name : ''}')" [if]="this.getIsVisible('${el._name ? el._name : ''}')">
${noTitle ? "" : this.addTitle(el)}
${isArray(elHTML) ? elHTML.join('') : elHTML}
${(noErrorHint ? '' : this.addErrorHint(el))}
</div>`;
  }


  renderSelectGroupHTML(el, elHTML) {
    if (!elHTML)
      return "";
    return `<div [if]="this.getIsVisible('${el._name ? el._name : ''}')">${elHTML}</div>`;
  }

  getPropertyByPath(object, path) {
    try {
      var ret = Objects.getPropertyByPath(object, path);
    } catch (ex) {
      return undefined;
    }
    return ret;
  }

  getIsVisible(_name) {
    if (empty(_name)) {
      return true;
    }
    return !this.fields[_name].attributes.hidden && !this.fields[_name].attributes.forcehide;
  }

  getClassName(_name) {
    var classnames = [];

    if (empty(_name)) {
      return "";
    }

    var ret = this.getPropertyByPath(this.errors, _name);
    if (ret) {
      classnames.push('error');
    }

    var ret = this.getPropertyByPath(this.data, _name);
    if (ret !== null && ret !== undefined && ret !== "") {
      classnames.push('filled');
    }


    if (this.fields[_name] && this.fields[_name].attributes && this.fields[_name].attributes.active) {
      classnames.push('active');
    }

    if (this.fields[_name] && this.fields[_name].isLoading ) {
      classnames.push('isLoading');
    }

    return classnames.join(' ');
  }

  getError(_name) {
    if (empty(_name)) {
      return "";
    }

    var ret = this.getPropertyByPath(this.errors, _name);

    return ret;
  }


  /**
   * 
   * @param {FieldTemplate} el 
   * @param {KeyValuePair} [override]
   */
  addInput(el, override) {

    var opt = { name: el._name, type: "text", placeholder: el.placeholder };

    Object.assign(opt, override, el.attributes);
    //${this.generateAttributes(opt)}
    return `
<div class="fieldrow">
<input bind="${this.refactorAttrName('this.data.' + el._name)}" name="${el._name}" [attribute]="this.getFieldAttributes('${el._name}')" ${this.generateAttributes(opt)} />` +
      (el.unit || el.icon ? `<div class="icon">
${el.unit ? el.unit : ''}
${el.icon ? `<i class="${el.icon}"></i>` : ''}
</div>` : '') +
      `</div>`
      ;
  }

  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
  addFile(el, override) {

    var opt = { name: el._name, type: "file", placeholder: el.placeholder };

    Object.assign(opt, override, el.attributes);
    if (!el.icon) {
      el.icon = "fas fa-upload";
    }
    // bind="${this.refactorAttrName('this.data.' + el._name + '.name')}"
    Objects.setPropertyByPath(this.data, this.refactorAttrName(el._name + '.name'), null);
    return `<div class="fieldrow">
<label class="input file">{{ this.getFileFieldFileName('${el._name}') || '${Translate(el.placeholder || 'No file chosen')}' }}
<input type="file" bind="${this.refactorAttrName('this.data.' + el._name + '.name')}" ${this.generateAttributes(opt)} onchange="this.onFileFieldChanged('${el._name}', $event)"/>
</label>`+
      (el.unit || el.icon ? `<div class="icon">
${el.unit ? el.unit : ''}
${el.icon ? `<i class="${el.icon}"></i>` : ''}
</div>` : '') +
      `</div>`;
  }

  //{type:'password', autocorrect:"off", autocapitalize:"off"}
  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
  addPassword(el, override) {

    var opt = { name: el._name, autocorrect: "off", autocapitalize: "off", placeholder: el.placeholder };

    Object.assign(opt, override, el.attributes);
    this.types[el._name] = "password";
    return `<div class="fieldrow">
<input bind="${this.refactorAttrName('this.data.' + el._name)}" name="${el._name}" ${this.generateAttributes(opt)} [attribute]="{type: this.types['${el._name}']}"/>` +
      (true ? `<div class="icon" onclick="this.togglePasswordType('${el._name}')">
<i class="fas fa-eye" [if]="this.types['${el._name}']=='password'"></i>
<i class="fas fa-eye-slash" [if]="this.types['${el._name}']=='text'"></i>
</div>` : '') +
      '</div>';
  }
  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
  addTextArea(el, override) {

    var opt = { name: el._name, type: "text" };

    Object.assign(opt, override, el.attributes);
    return `<textarea bind="${this.refactorAttrName('this.data.' + el._name)}" ${this.generateAttributes(opt)}></textarea>`;
  }
  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
  addCheckSquare(el, override) {
    var opt = { name: el._name, type: "checkbox" };
    Object.assign(opt, override, el.attributes);
    return `<label class="toggle">
<input bind="${this.refactorAttrName('this.data.' + el._name)}" ${this.generateAttributes(opt)} />
<span class="radio square"></span>
<span class="text">${el.title}</span>
</label>
`;
  }

  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
 addCheckRound(el, override) {
  var opt = { name: el._name, type: "checkbox" };
  Object.assign(opt, override, el.attributes);
  return `<label class="toggle">
<input bind="${this.refactorAttrName('this.data.' + el._name)}" ${this.generateAttributes(opt)} />
<span class="radio round"></span>
<span class="text">${el.title}</span>
</label>
`;
}

  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
 addToggle(el, override) {
  var opt = { name: el._name, type: "checkbox" };
  Object.assign(opt, override, el.attributes);
  return `<label class="toggle"><span class="text">${el.title}</span>
<input bind="${this.refactorAttrName('this.data.' + el._name)}" ${this.generateAttributes(opt)} />
<span class="slider round"></span>
</label>
`;
}

  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
  addRadio(el, override) {
    var opt = { name: el._name, type: "radio" };
    Object.assign(opt, override, el.attributes);

    var elems = `<div class="fieldrow">`;
    Objects.forEach(el.items, (item, itemIndex )=> {
      elems += `<label class="toggle">
<input bind = "${this.refactorAttrName('this.data.' + el._name)}" format="${el.dataType ? el.dataType : ''}" value = "${item.value !== null ? item.value : ''}" ${this.generateAttributes(opt)} />
<span class="radio round"></span>
${item.title}
${item.info ? this.addItemInfo(el, itemIndex) : ''}
</label>
`;
    });

    elems += "</div>";

    return elems;
  }
  /**
  * 
  * @param {FieldTemplate} el 
  * @param {KeyValuePair} [override]
  */
  addSelect(el, override, parentPath) {

    var opt = { name: el._name, type: "select", format: el.dataType, bind: `${this.refactorAttrName('this.data.' + el._name)}`, placeholder: el.placeholder };
    Object.assign(opt, override, el.attributes, { onchange: `this._onSelectBoxChanged('${el._name}')` });
    var elem = `<div class="fieldrow"><select ${this.generateAttributes(opt)}>`;
    if (el.placeholder)
      elem = elem + `<option>${el.placeholder}</option>`;

    var items_items = "";

    var hasSubItems = false;

    if (el.dynamicItems) {
      if (typeof el.dynamicItems == "function")
        el.dynamicItems(el._name);
      elem += `<option [attribute]="{value : selectItem.value, title:selectItem.text ? selectItem.text : '' }" [foreach]="this.fields['${el._name}'].items as selectItem">{{selectItem.title}}</option>`;
    } else {
  
      Objects.forEach(el.items, (option) => {
        elem = elem + `<option value="${option.value === null ? '' : option.value}" title="${option.placeholder || ''}">${option.title}</option>`;
        if (option.items) {
          hasSubItems = true;
          items_items += `
          <div [if]="${this.refactorAttrName('this.data.' + el._name)} == ${(isNumber(option.value) || option.value == null ? option.value : "'" + option.value + "'")}">
          ${this.renderArray(option.items, parentPath)}
          </div>`;

          /*if (!this.fields[el._name].component) {
            this.fields[el._name].component = new Forms(option.items, this.data);
          }

          items_items += `
          <div [if]="${this.refactorAttrName('this.data.' + el._name)} == ${(isNumber(option.value) || option.value == null ? option.value : "'" + option.value + "'")}">
            <div [component]="${this.refactorAttrName('this.fields.' + el._name + '.component')}"></div>
          </div>`
          */
        }
      });
    }
    elem = elem + `</select><div class="icon"><i class="fas fa-angle-down"></i></div></div>`;

    el.icon = true;

    if (hasSubItems) {
      //this.fields[el._name].component = new Forms([], this.data);
      //items_items += '<div>Sub items go here</div>';
      //items_items += `<div [html] = "${this.refactorAttrName('this.fields.' + el._name + '.subitems')}" >Sub items go here</div>`;
    }

    return this.renderFieldGroupHTML(el, elem) + this.renderSelectGroupHTML(el, items_items);
  }

  _onSelectBoxChanged(_name) {
    //if (this.fields[_name].i)
  }

  /**
  * 
  * @param {FieldTemplate} el 
  */
  addTitle(el) {
    if (!el.title && !el.info) return '';
    //el.title = el.title.replace(/ /g, "&nbsp;")
    return `<label>{{ Translate(this.fields['${el._name}'].title) }}${el.info ? this.addInfo(el) : ''}</label>`;
  }
  /**
  * 
  * @param {FieldTemplate} el 
  */
  addInfo(el) {
    //if (!el.title) return '';
    return `<i class="fas fa-question-circle" onclick="this.stopEvent($event);this.showInfoText('${el._name}')"></i>`;
  }

  /**
  * 
  * @param {FieldTemplate} el 
  */
  addItemInfo(el, itemIndex) {
    //if (!el.title) return '';
    return `<i class="fas fa-question-circle" onclick="this.stopEvent($event);this.showInfoText('${el._name}','${itemIndex}')"></i>`;
  }

  stopEvent($event){
    $event.stopPropagation();
    $event.preventDefault();
  }

  /**
  * 
  * @param {FieldTemplate} el 
  */
  addErrorHint(el) {
    return (`<div class="hint" [class]="this.getError('${el._name}') ? 'error' : ''">{{ this.getError('${el._name}') || '${el.hint ? el.hint : ''}' }}</div>`);
  }

  showInfoText(name, itemIndex = null) {
    var title = "";
    var text = "";
    var callback = null;

    if (itemIndex !== null) {
      if (isObject(this.fields[name].items[itemIndex].info)) {
        text = this.fields[name].items[itemIndex].info.text
        callback = this.fields[name].items[itemIndex].info.callback
        title = this.fields[name].items[itemIndex].info.title;
      } else if (isString(this.fields[name].items[itemIndex].info)) {
        text = this.fields[name].items[itemIndex].info
        title = this.fields[name].items[itemIndex].title;
      } else {
        console.error(`Forms.fields['${name}'].info value is not supported`, this.fields[name].items[itemIndex].info);
        return;
      }  
    } else {
      if (isObject(this.fields[name].info)) {
        text = this.fields[name].info.text
        callback = this.fields[name].info.callback
        title = this.fields[name].info.title;
      } else if (isString(this.fields[name].info)) {
        text = this.fields[name].info
        title = this.fields[name].title;
      } else {
        console.error(`Forms.fields['${name}'].info value is not supported`, this.fields[name].info);
        return;
      }
    }

    Alert(text, callback, title);

  }


  /**
  * Split form name from property name 
  * @param {string} name 
  */
  refactorAttrName(name) {
    //if name contains .number parts, replace them with array notation
    return name.replace(/\.(\d{1}[^\.]*)/, function (a, b, c, d) {
      //console.log(arguments);
      return `['${b}']`;
    });
  }
  
  /**
  * 
  * @param {FieldTemplate} el 
  */
  addLabel(el, override) {
    var opt = { onclick: "this.onClick($event);" };

    Object.assign(opt, { name: el._name }, el.attributes, override);
    return `
<div class="label" ${this.generateAttributes(opt)} >${(el.value != null ? el.value : "")}</div>` +
      (el.unit || el.icon ? `<div class="icon">
${el.unit ? el.unit : ''}
${el.icon ? `<i class="${el.icon}"></i>` : ''}
</div>` : '');
  }
  /**
  * 
  * @param {FieldTemplate} el 
  */
  addHtml(el) {
    var opt = Object.assign({}, { name: el._name, class: ["html", el.class].join(' ')}, { onclick: "this.onClick($event);" }, el.attributes);
    return `<div ${this.generateAttributes(opt)}><div>${(el.value != null ? el.value : "")}</div></div>`;
  }
  /**
  * 
  * @param {FieldTemplate} el 
  */
  addLink(el) {``
    var opt = Object.assign({}, { onclick: "this.onClick($event);" }, el.attributes);
    return `<div class="link" ${this.generateAttributes(opt)} name="${el._name}">${(el.value != null ? el.value : "")}</div>` +
      (el.unit || el.icon ? `<div class="icon">
      ${el.unit ? el.unit : ''}
      ${el.icon ? `<i class="${el.icon}"></i>` : ''}
      </div>` : '');
  }
  /**
  * 
  * @param {FieldTemplate} el 
  */
  addButton(el) {
    var opt = Object.assign({}, { name: el.name }, el.attributes);
    return `
    <button ${this.generateAttributes(opt)} name="${el._name}" onclick="this.onButtonClick($event);">${(el.icon ? `<i class="${el.icon}"></i>` : '')}${el.value || ''}</button>
    `;
  }

  /**
  * 
  * @param {FieldTemplate} el 
  */
  addButtons(el) {
    var items = el.items.map(function (btn) {
      return `<button class="link" bind name="${btn.name}">${btn.title}</button>`;
    });

    return `
<div class="buttons">
${items.join('')}
</div>
`;
  }

  togglePasswordType(name) {
    if (this.types[name] === "text")
      this.types[name] = "password";
    else
      this.types[name] = "text";
  }

  getFieldAttributes(_name) {
    if (empty(_name)) return null;

    return this.fields[_name] ? this.fields[_name].attributes : {};
  }

  generateAttributes(opt) {
    var strOpts = "";
    var name = opt.name;
    Objects.forEach(opt, (val, key) => {
      if (key !== "input" && key !== "click" && key !== "change") {
        if (val !== null && val !== undefined && key != "hidden")
          strOpts += key + '="' + val + '" ';
      } else {
        !this.attrEvents[name] ? this.attrEvents[name] = {} : null;
        this.attrEvents[name][key] = val;
        strOpts += 'on' + key + `="this.attrEvents['${name}']['${key}']()"`;
      }
    });
    return strOpts;
  }

  /**
  * 
  * @param {Event} event  
  */
  transferEventToChildInput(event) {
    var el = event.target;
    var input = DOM(el).find('input')[0];

    input.dispatchEvent(new Event(event.type));
  }

  trimDisplayFileName(fileName) {
    if (!fileName || !isString(fileName)) {
      return "";
    }
    return fileName.split(/\\|\//).pop();
  }

  getFileFieldFileName(name) {
    var v = Objects.getPropertyByPath(this.data, name);
    if (v && v.name) {
      return `${this.trimDisplayFileName(v.name)} (${round(v.size / 1024)} kB)`;
    }
    return "";
  }

  onFileFieldChanged(name, event) {
    if (!FileAccess.isSupported) {
      console.warn("File upload is not supported!");
      return;
    }

    /** @type {HTMLInputElement} */
    var fileFiled = event.target;
    var file = fileFiled.files[0];

    //var name = fileFiled.getAttribute("bind");
    if (!file) {
      Objects.setPropertyByPath(this.data, name, { name: null });
      return;
    }

    Objects.setPropertyByPath(this.data, name, { name: file.name, type: file.type, /*dataURL: dataURL,*/ fileBlob: file, size: file.size });

    /*FileAccess.ReadFile(fileFiled.files[0]).DataURL().then( dataURL =>{
    Objects.setPropertyByPath(this.data, name, {name: file.name, type:file.type, dataURL: dataURL, fileBlob:file, size:file.size});
    this.events.change(event);
    }).catch(err=>{
    console.warn(err);
    Objects.setPropertyByPath(this.data, name, {name: null});
    this.events.change(event);
    });*/
  }
}
/** @type {{[key:string]: function(Forms, FieldTemplate, string): string}} */
Forms.field_definitions = {
  form(forms, el, parentPath) {
    return forms.addForm(el, parentPath /*? parentPath +'.' +el.name : el.name*/);
  },
  array(forms, el, parentPath) {
    return forms.addArray(el, parentPath /*? parentPath +'.' +el.name : el.name*/);
  },
  email(forms, el, parentPath) {
    forms.assertValidateRuleHas(el, "email");
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { type: 'email', autocomplete:"false" })]);
  },
  file(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addFile(el)]);
  },
  text(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { autocomplete:"false" })]);
  },
  date(forms, el, parentPath) {
    el.icon = "far fa-calendar-alt";
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { date: '', format: 'date' })]);
  },
  datetime(forms, el, parentPath) {
    el.icon = "far fa-calendar-alt";
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { dateTime: '', format: 'dateTime' })]);
  },
  time(forms, el, parentPath) {
    el.icon = "far fa-clock";
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { time: '', format: 'time' })]);
  },
  split(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [
      '<div class="split" style="width:50%">' + forms.addInput(el.items[0], { type: el.items[0].type }) + '</div>',
      '<div class="split" style="width:50%">' + forms.addInput(el.items[1], { type: el.items[1].type }) + '</div>',
    ]);
  },
  "date-time": function (forms, el, parentPath) {
    var dateEl = Object.assign({}, el);
    var timeEl = Object.assign({}, el);

    dateEl._name += "_date";
    dateEl.icon = "far fa-calendar-alt";
    timeEl._name += "_time";
    timeEl.icon = "far fa-clock";

    var dateTime = Objects.getPropertyByPath(forms.data, el._name);
    Objects.setPropertyByPath(forms.data, dateEl._name, dateTime);
    Objects.setPropertyByPath(forms.data, timeEl._name, dateTime);

    return forms.renderFieldGroupHTML(el, [
      /*html*/`<div style="display:flex;flex-direction:row">`,
      /*html*/`<div class="split" style="width:60%">` + forms.addInput(dateEl, { date: '', format: 'date', onchange: "this._formatSplitDateField($event,'" + el._name + "',false)" }) + '</div>',
      /*html*/`<div class="split" style="width:40%">` + forms.addInput(timeEl, { time: '', format: 'time', onchange: "this._formatSplitDateField($event,'" + el._name + "',true)" }) + '</div>',
      /*html*/`</div>`
    ]);
  },
  number(forms, el, parentPath) {
    forms.assertValidateRuleHas(el, "numeric");
    var format = el.attributes && el.attributes.format ? undefined : "number:2";
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { type: 'text', number: "", format: format, novalidate: true, autocomplete:"false" })]);
  },
  password(forms, el, parentPath) {
    el.icon = true;
    return forms.renderFieldGroupHTML(el, [forms.addPassword(el, {autocomplete:"false"})]);
  },
  phone(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addInput(el, { type: 'tel', oninput: "this._formatPhoneNumber($event)",autocomplete:"false" })]);
  },
  hidden(forms, el, parentPath) {
    return forms.addInput(el, { type: 'hidden' });
  },
  textarea(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addTextArea(el, null)]);
  },
  "checkbox": function(forms, el, parentPath) {
    var el_ch = Objects.copy(el);
    el_ch.title = "";
    return forms.renderFieldGroupHTML(el_ch, [forms.addCheckSquare(el, null)], true);
  },
  "checkbox-round": function(forms, el, parentPath) {
    var el_ch = Objects.copy(el);
    el_ch.title = "";
    return forms.renderFieldGroupHTML(el_ch, [forms.addCheckRound(el, null)], true);
  },
  toggle(forms, el, parentPath) {
    var el_ch = Objects.copy(el);
    el_ch.title = "";
    return forms.renderFieldGroupHTML(el_ch, [forms.addToggle(el, null)], true);
  },
  radio(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addRadio(el, null)]);
  },
  select(forms, el, parentPath) {
    return forms.addSelect(el, null, parentPath);
  },
  label(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addLabel(el)], null, true);
  },
  link(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addLink(el)], null, true);
  },
  button(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addButton(el)]);
  },
  buttons(forms, el, parentPath) {
    return forms.renderFieldGroupHTML(el, [forms.addButtons(el)]);
  },
  html(forms, el, parentPath) {
    return forms.addHtml(el);
  }
};