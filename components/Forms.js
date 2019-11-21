import { Objects } from "./../core/Objects";
import { FormValidator } from "./../core/form_validator";
import { Text } from "./../core/text";
import { BaseComponent } from "./BaseComponent";
import { isNumber, isArray, isString, isObject } from "util";
import { DateTime } from "./../core/DateTime";
import { Translate } from "../core/Translate";
import { tryCall } from '../core/helpers';
import { Alert } from "leet-mvc/core/simple_confirm";

export class Forms extends BaseComponent{
	/**
	 * Forms Directive. Generate forms from JSON data
	 * @param {FieldTemplate[]} formTemplate 
	 * @param {*} [data]
	 * @param {*} [errors]
	 * @param {*} [attributes]
	 * @param {{nestedData?:boolean, formClass?:string, fieldClass?:string}} [options]
	 */
	constructor(formTemplate, data, errors, attributes, options){
		super()
		this.formTemplate = formTemplate;
		this.data = data|| {};

		this.extraData = {};

		this.errors = errors ||{};

		this.options =  {nestedData:true, formClass:'formgroup', fieldClass:'fieldgroup'};
		$.extend(this.options, options);

		
		this.attributes = attributes || {};
		this.attrEvents = {};
		this.types={};
		this.arrays={};

		this.elementItems = {};

		this.validator = new FormValidator(this.data, formTemplate, this.errors, this.attributes, this.options);
		this.validator.validateVisibility();

		this.fields = this.validator.fields;
		
		this.events = {
			input:(ev) =>{
				setTimeout(()=>{
					this.onInput(ev);
				},0);
			},
			click:(ev)=>{
				//notify in the next render cycle.
				setTimeout(()=>{
					this.onClick(ev);
				},0);
			},
			change:(ev)=>{
				//validate element on change
				if (ev.target.name){
					//validate in the next render cycle.
					setTimeout(()=>{
						if (this.validator){
							this.validator.validateField(ev.target.name);
							this.binder.updateElements();
						}
					},0);
				}
				//notify in the next render cycle.
				setTimeout(()=>{
					if (this.onChange == this.events.change) {
						console.error(ev);
						throw new Error("Change triggers infinite loop!")
					}
					this.onChange(ev);
				},0);
			},
			focus:(ev)=>{
				var _name = ev.target.name;
				if (_name){
					
					var attrObj = this.getPropertyByPath(this.attributes, _name);
					if (empty(attrObj)){
						attrObj = {}
					}
					setTimeout(()=>{
						attrObj.active = true;
						Objects.setPropertyByPath(this.attributes, _name, attrObj);
					})
				}
			},
			blur:(ev)=>{
				var _name = ev.target.name;
				if (_name){
					var attrObj = this.getPropertyByPath(this.attributes, _name);
					if (empty(attrObj)){
						attrObj = {}
					}
					setTimeout(()=>{
						attrObj.active = undefined;
						Objects.setPropertyByPath(this.attributes, _name, attrObj);
					})
				}
			}
		}

		this.field_definitions = Forms.field_definitions;

		this.template = `<div [directive]="this.formHTML"></div>`
		
		
		this.formHTML =this.renderArray(this.formTemplate, null)
	}

	updateTemplate(formTemplate){
		this.formTemplate = formTemplate;
		
		this.validator = new FormValidator(this.data,formTemplate,this.errors,this.attributes, this.options);
		this.validator.validateVisibility();

		this.formTemplateKeyed = Objects.keyBy(this.formTemplate, '_name');
		
		var html = this.renderArray(this.formTemplate, null);
		this.formHTML = html;
	}

	///listen to attempts to overwrite onChange listener 
	onChangeChange(value){
		if (isObject(this.events) && value == this.events.change) {
			console.error(value);
		throw new Error("Attempt to override Forms.onChange callback with Forms.events.change will lead to infinite loop!")
		}
	}
	///listen to attempts to overwrite onInput listener 
	onInputChange(value){
		if (isObject(this.events) && value == this.events.input) {
			console.error(value);
			throw new Error("Attempt to override Forms.onInput callback with Forms.events.input will lead to infinite loop!")
		}
	}
	///listen to attempts to overwrite onClick listener 
	onClickChange(value){
		if (isObject(this.events) && value == this.events.click) {
			console.error(value);
			throw new Error("Attempt to override Forms.onClick callback with Forms.events.click will lead to infinite loop!")
		}
	}

	/** 
	 * @param {HTMLInputElementChangeEvent} event
	 */
	onChange(event){

	}

	/** 
	 * @param {HTMLInputElementChangeEvent} event
	 */
	onInput(event){

	}
	/** 
	 * @param {HTMLInputElementChangeEvent} event
	 */
	onClick(event){

	}

	/** 
	 * @param {HTMLElementMouseEvent} event
	 */
	onButtonClick(event){

	}

	_formatSplitDateField(evt, name , isTime){
		var el = evt.target;
		//console.log(evt, name, isTime);
		var date = null;
		var time = null;
		
		if (isTime){
			date = Objects.getPropertyByPath(this.data, name);
			time = DateTime.fromHumanTime($(el).val().toString());
		}else{
			date = DateTime.fromHumanDate($(el).val().toString()); 
			time = Objects.getPropertyByPath(this.data, name);
		}

		var newDate = DateTime.combineDateTime(date, time);
		Objects.setPropertyByPath(this.data,name, newDate);

		//console.log(newDate);
	}
	
	_formatPhoneNumber(evt){
		var el  = evt.target;
		var selS = el.selectionStart;
		var selE = el.selectionStart;
		var old = el.value
		setTimeout(function(){
			el.value = Text.formatPhone(el.value,{3:'-',6:'-',10:'x'}/*{3:'-',6:'-'}/**/);
			var dif = el.value.length - old.length;
			el.selectionStart = selS+dif;
			el.selectionEnd = selE+dif;
		},1);
	}
	

	/**
	 * 
	 * @param {FieldTemplate[]} formTemplate 
	 */
	renderArray(formTemplate, parentPath){
		var html = [];

		for(var i in formTemplate){
			if (!formTemplate.hasOwnProperty(i)) continue;
			var el = formTemplate[i];
			if (el.type){
				if (el.type == "form"){
					var ret = this.render_field(el,parentPath);
					if (ret){
						html.push(ret);
					}
				}else{
					if ((el.name == null || el.name==undefined)){
						el.name = i;
					}
					//do we support nested data?
					if (!this.options.nestedData){
						parentPath = null;
					}
		
					if(parentPath && el.name){
						el._name = parentPath + "." + el.name ;
						//el._parent = Objects.getPropertyByPath(this.formTemplate, el._name);
					}else{
						el._name = el.name;
					}
					//create value in each structure
					/*if (! Objects.getPropertyByPath(this.data, el._name))
						Objects.setPropertyByPath(this.data, el._name, el.value != undefined ? el.value : null);
					if (! Objects.getPropertyByPath(this.errors, el._name))
						Objects.setPropertyByPath(this.errors, el._name, null);
					if (! Objects.getPropertyByPath(this.attributes, el._name))
						Objects.setPropertyByPath(this.attributes, el._name, null);
					*/

					var ret = this.render_field(el,parentPath);
					if (ret){
						html.push(ret);
					}
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
	render_field(el,parentPath){
		/** @type {string} */
		el.type = el.type ? el.type.toLowerCase() : '';

		if (this.field_definitions[el.type]) {
			if (el.items) {
				this.elementItems[el._name] = el.items;
			}
			return tryCall(this, this.field_definitions[el.type], this, el, parentPath);
		} else {
			throw Error("Unknown form element type:" + el.type + " in "+ JSON.stringify(el,null,'\t'));	
		}
	}

	assertValidateRuleHas(el, mustHave){
		if (!el.validateRule)
			el.validateRule=mustHave;
		else if (el.validateRule.indexOf('email')<0)
			el.validateRule = el.validateRule+"|"+mustHave;
	}
	
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {string} [parentPath]
	 */
	addForm(el, parentPath){
		//do we support nested data?
		if (!this.options.nestedData){
			parentPath = null;
		}

		if(parentPath && el.name){
			el._name = parentPath + "." + el.name ;
		}else{
			el._name = el.name;
		}
		if (el._name){
			//if create value in each structure
			if (! Objects.getPropertyByPath(this.data, el._name))
				Objects.setPropertyByPath(this.data, el._name, {});
			if (! Objects.getPropertyByPath(this.errors, el._name))
				Objects.setPropertyByPath(this.errors, el._name, {});
			if (! Objects.getPropertyByPath(this.attributes, el._name))
				Objects.setPropertyByPath(this.attributes, el._name, {});
		}

		return this.renderFormHTML(el, this.renderArray(el.items, el._name));
	}

		/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {string} [parentPath]
	 */
	addArray(el, parentPath){
		//do we support nested data?
		if (!this.options.nestedData){
			parentPath = null;
		}

		if(parentPath && el.name){
			el._name = parentPath + "." + el.name ;
		}else{
			el._name = el.name;
		}
		if (el._name){
			//if create value in each structure
			if (! this.getPropertyByPath(this.data, el._name))
				Objects.setPropertyByPath(this.data, el._name, {});
			if (! this.getPropertyByPath(this.errors, el._name))
				Objects.setPropertyByPath(this.errors, el._name, {});
			if (! this.getPropertyByPath(this.attributes, el._name))
				Objects.setPropertyByPath(this.attributes, el._name, {});
		}

		this.arrays[el.name] = [""];

		return this.renderArrayHTML(el, this.renderArray(el.items, el._name));
	}

	getVisibleData(){
		return this.validator.getVisibleData();
	}

	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {string} childrenHTML
	 */
	renderArrayHTML(el, childrenHTML){
		/** @type {FieldTemplate} */
		var buttonEl = {
			name: el.name + "_add_button",
			_name: el.name + "_add_button",
			type:"button",
			value: el.title,
			attributes: {
				click: function(){
					this.arrays[el.name].push("");
				}
			}
		}

		return `
			<div>
				${this.addButton(buttonEl)}
				<div [foreach]="this.arrays['${el.name}']">
				${childrenHTML}
				</div>
			</div>
			`;
	}

	renderFormHTML(el, childrenHTML){
		return `
			<div class="${this.options.formClass} ${el.class}" [if]="this.getIsVisible('${el._name ? el._name : ''}')">
				${this.addTitle(el)}
				${childrenHTML}
			</div>
			`;
	}

	renderFieldGroupHTML(el, elHTML, noTitle, noErrorHint){
		return `
		<div class="${this.options.fieldClass} ${el.class ?' '+ el.class:''}" [class]="this.getClassName('${el._name ? el._name : ''}')" [if]="this.getIsVisible('${el._name ? el._name : ''}')">
			${this.addTitle(el)}
			${isArray(elHTML) ? elHTML.join('') : elHTML}
			${(noErrorHint ? '' : this.addErrorHint(el))}
		</div>`; 
	}


	renderSelectGroupHTML(el, elHTML){
		return `<div [if]="this.getIsVisible('${el._name ? el._name : ''}')">${elHTML}</div>`; 
	}

	getPropertyByPath(object, path){
		try {
			var ret = Objects.getPropertyByPath(object, path);
		} catch (ex){
			return undefined;
		}
		return ret;
	}

	getIsVisible(_name){
		if (empty(_name)) {
			return true;
		}

		var ret = this.getPropertyByPath(this.attributes, _name)
		if (!ret) {
			return true;
		}
		return !ret.hidden;
	}

	getClassName(_name){
		var classnames = [];

		if (empty(_name)) {
			return "";
		}
		
		var ret = this.getPropertyByPath(this.errors, _name)
		if (ret) {
			classnames.push('error');
		}

		var ret = this.getPropertyByPath(this.data, _name)
		if (ret !== null && ret !== undefined && ret !== "") {
			classnames.push('filled');
		}

		var ret = this.getPropertyByPath(this.attributes, _name)
		if (ret && ret.active) {
			classnames.push('active');
		}
		return classnames.join(' ');
	}

	getError(_name){
		if (empty(_name)) {
			return "";
		}

		var ret = this.getPropertyByPath(this.errors, _name)
		
		return ret;
	}
	

	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 * @param {string} [dataName] name of the data property
	 */
	addInput(el, override, dataName){
		
		dataName = dataName || "data"
		var opt = { name: el._name , type: "text", placeholder: el.placeholder };
		
		$.extend(opt, override, el.attributes);
		return ( `
			<input bind="this.${dataName}${this.refactorAttrName(el._name)}" _name="${el._name}" ${this.generateAttributes(opt)} />`+
			(el.unit || el.icon ? `<div class="icon">
				${el.unit ? el.unit :''}
				${el.icon ? `<i class="${el.icon}"></i>` :''}
			</div>` : '')
		);
	}

	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 * @param {string} [dataName] name of the data property
	 */
	addFile(el, override, dataName){
		
		dataName = dataName || "data"
		var opt = { name: el._name , type: "hidden", placeholder: el.placeholder };
		
		$.extend(opt, override, el.attributes);
		return ( `
			<label class="input" onclick="this.transferEventToChildInput($event)">{{ this.trimDisplayFileName(this.${dataName}${this.refactorAttrName(el._name)}) || '${Translate('Select File')}' }}
				<input file bind="this.${dataName}${this.refactorAttrName(el._name)}" ${this.generateAttributes(opt)} />
			</label>`+
			(el.unit || el.icon ? `<div class="icon">
				${el.unit ? el.unit :''}
				${el.icon ? `<i class="${el.icon}"></i>` :''}
			</div>` : '')
		);
	}

	//{type:'password', autocorrect:"off", autocapitalize:"off"}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addPassword(el, override){
		
		var opt = { name: el._name, autocorrect:"off", autocapitalize:"off" };
		
		$.extend(opt, override, el.attributes);
		this.types[el._name] = "password";	
		return (`
			<input bind="this.data${this.refactorAttrName(el._name)}" _name="${el._name}" ${this.generateAttributes(opt)} [attribute]="{type: this.types['${el._name}']}"/>`+
			(true ? `<div class="icon" onclick="this.togglePasswordType('${el._name}')">
				<i class="fas fa-eye" [if]="this.types['${el._name}']=='password'"></i>
				<i class="fas fa-eye-slash" [if]="this.types['${el._name}']=='text'"></i>
			</div>` : '')
		);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addTextArea(el, override){
		
		var opt = { name: el._name, type: "text" };
		
		$.extend(opt, override, el.attributes);
		return `
			<textarea bind="this.data${this.refactorAttrName(el._name)}" ${this.generateAttributes(opt)}></textarea>
		`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addCheck(el, override){
		var opt = { name: el._name, type: "checkbox" };
		$.extend(opt, override, el.attributes);
		return (`
			<label class="toggle">${el.title}
				<input bind="this.data${this.refactorAttrName(el._name)}" ${this.generateAttributes(opt)} />
				<span class="slider round"></span>
			</label>
		`);
	}

		/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addRadio(el, override){
		var opt = { name: el._name, type: "radio" };
		$.extend(opt, override, el.attributes);

		var elems = ""
		Objects.forEach(el.items, item=>{
			elems += (`
				<label class="toggle">
					<input bind = "this.data${this.refactorAttrName(el._name)}" format="${el.dataType ? el.dataType : ''}" value = "${item.value !==null ? item.value : '' }" ${this.generateAttributes(opt)} />
					<span class="radio round"></span>
					${item.title}
				</label>
			`);
		});

		return elems;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addSelect(el, override,parentPath){

		var opt = { name: el._name, type: "select", format: el.dataType, bind: `this.data${this.refactorAttrName(el._name)}`, placeholder:el.placeholder};
		$.extend(opt, override, el.attributes);
		var elem = `<select ${this.generateAttributes(opt)}>`;
		if (el.placeholder)
			elem = elem+ `<option>${el.placeholder}</option>`;

		var items_items = "";	
		$.each(el.items,  (index, option)=>{
			elem = elem+ `<option value="${ option.value===null ? '' : option.value }" title="${ option.placeholder || '' }">${option.title}</option>`;
			if (option.items){
				items_items += `<div [if]="this.data${this.refactorAttrName(el._name)} == ${(isNumber(option.value)|| option.value==null ? option.value : "'"+option.value+"'")}">` + this.renderArray(option.items,parentPath) + `</div>`;
			}
		});
		elem = elem + "</select>";

		

		return this.renderFieldGroupHTML(el,(`
			${elem}
		`)) + this.renderSelectGroupHTML(el, items_items);
	}

	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addTitle(el){
		if (!el.title && !el.info) return '';
		return `<label>${Translate(el.title)}${el.info ? this.addInfo(el) : ''}</label>`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addInfo(el){
		//if (!el.title) return '';
		return ` <i class="fas fa-question-circle" onclick="this.showInfoText('${el._name}')"></i>`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addErrorHint(el){
		return `<div class="hint" [class]="this.getError('${el._name}') ? 'error' : ''">{{ this.getError('${el._name}') || '${ el.hint ? el.hint : '' }' }}</div>`
	}

	showInfoText(name) {
		if (isObject(this.fields[name].info)){
			Alert( this.fields[name].info.text, this.fields[name].info.callback, this.fields[name].info.title );
		} else if (isString(this.fields[name].info)) {
			Alert( this.fields[name].info );
		} else {
			console.error(`Forms.fields['${name}'].info value is not supported`, this.fields[name].info );
		}
		
	}

	/**
	 * Split form name from property name 
	 * @param {string} name 
	 */
	refactorAttrName(name){
		var p = name.split('.');
		p[p.length-1] = "['" + p[p.length-1] + "']"
		if (p.length==1)
			return p[p.length-1];

		var ret =  '.'+p.join('.').replace('.[','[');
		return ret;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addLabel(el, override){
		var opt = { onclick:"this.onClick($event);" };
		
		$.extend(opt, {name: el._name}, el.attributes, override);
		return (`
			<div class="label" ${this.generateAttributes(opt)}>${(el.value != null ? el.value : "")}</div>`	+
			(el.unit || el.icon ? `<div class="icon">
				${el.unit ? el.unit :''}
				${el.icon ? `<i class="${el.icon}"></i>` :''}
			</div>` : '')
		);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addHtml(el){
		var opt = $.extend({}, {name: el._name}, {onclick:"this.onClick($event);"}, el.attributes);
		return `<div class="html" ${this.generateAttributes(opt)}>${(el.value != null ? el.value : "")}</div>`;
		//return `<div>${(el.value != null ? el.value : "")}</div>`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addLink(el){
		var opt = $.extend({}, {onclick:"this.onClick($event);"}, el.attributes);
		return (`
			<div class="link" ${this.generateAttributes(opt)} name="${el._name}">${(el.value != null ? el.value : "")}</div>`	+
			(el.unit || el.icon ? `<div class="icon">
				${el.unit ? el.unit :''}
				${el.icon ? `<i class="${el.icon}"></i>` :''}
			</div>` : '')
		);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addButton(el){
		var opt = $.extend({}, { name: el.name }, el.attributes);
		return (`
			<button class="link" ${this.generateAttributes(opt)} name="${el._name}" onclick="this.onButtonClick($event);">${el.value || ''}</button>
		`);
	}	
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addButtons(el){
		var items = el.items.map(function(btn){
			return `<button class="link" bind name="${btn.name}">${btn.title}</button>`
		});	
			
		return (`
			<div class="buttons">
				${items.join('')}
			</div>
		`);
	}

	togglePasswordType(name){
		if (this.types[name]==="text")
			this.types[name]="password";
		else
			this.types[name]="text";
	}
	
	generateAttributes(opt){
		var strOpts="";
		var name = opt.name;
		$.each(opt, (key, val)=> {
			if (key !== "input" && key !== "click" && key !== "change") {
				if (val !== null && val !== undefined)
					strOpts += key + '="' + val + '" ';
			} else{
				!this.attrEvents[name] ? this.attrEvents[name] = {} : null;
				this.attrEvents[name][key] = val;
				strOpts += 'on'+key + `="this.attrEvents['${name}']['${key}']()"`;
			}
		});
		return strOpts;
	}

	/**
	 * 
	 * @param {Event} event  
	 */
	transferEventToChildInput(event){
		var el = event.target;
		$(el).find('input')[0].dispatchEvent(new Event(event.type));
	}

	trimDisplayFileName(fileName){
		if (!fileName || !isString(fileName)){
			return "";
		}
		return fileName.split(/\\|\//).pop();
	}
}
/** @type {{[key:string]: function(Forms, FieldTemplate, string): string}} */
Forms.field_definitions = {
		form(forms, el, parentPath){
			return forms.addForm(el,parentPath /*? parentPath +'.' +el.name : el.name*/ );
		},
		array(forms, el, parentPath){
			return forms.addArray(el,parentPath /*? parentPath +'.' +el.name : el.name*/ );
		},
		email(forms, el, parentPath){
			forms.assertValidateRuleHas(el,"email");
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,{type:'email'})]);
		},
		file(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addFile(el)]);
		},
		text(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,null)]);
		},
		date(forms, el, parentPath){
			el.icon = "far fa-calendar-alt"
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,{date:'', format:'date'})]);	
		},
		datetime(forms, el, parentPath){
			el.icon = "far fa-calendar-alt"
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,{dateTime:'', format:'dateTime'})]);	
		},
		time(forms, el, parentPath){
			el.icon = "far fa-clock"
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,{time:'', format:'time'})]);	
		},
		split(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el,  [
				'<div class="split" style="width:50%">' + forms.addInput(el.items[0], { type: el.items[0].type }) + '</div>',
				'<div class="split" style="width:50%">' + forms.addInput(el.items[1], { type: el.items[1].type })+ '</div>',
			]);	
		},
		"date-time" : function (forms, el, parentPath){
			var dateEl = $.extend({}, el);
			var timeEl = $.extend({}, el);
			
			dateEl._name += "_date";
			dateEl.icon = "far fa-calendar-alt"
			timeEl._name += "_time";
			timeEl.icon = "far fa-clock"
			
			var dateTime = Objects.getPropertyByPath(forms.data, el._name)
			Objects.setPropertyByPath(forms.extraData, dateEl._name, dateTime);
			Objects.setPropertyByPath(forms.extraData, timeEl._name, dateTime);
			
			return forms.renderFieldGroupHTML(el,  [
				'<div style="display:flex;flex-direction:row">',
				'<div class="split" style="width:60%">' + forms.addInput(dateEl, {date:'', format:'date', onchange:"this._formatSplitDateField($event,'"+ el._name+ "',false)"},'extraData')+ '</div>',
				'<div class="split" style="width:40%">' + forms.addInput(timeEl, {time:'', format:'time', onchange:"this._formatSplitDateField($event,'"+ el._name+ "',true)"},'extraData')+ '</div>',
				'</div>'
			]);	
		},
		number(forms, el, parentPath){
			forms.assertValidateRuleHas(el,"numeric");
			var format = el.attributes && el.attributes.format ? undefined : "number:2"
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,{type:'text',number:"", format: format, pattern:"[0-9]*", novalidate: true})]);
		},
		password(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addPassword(el,null)]);
		},
		phone(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addInput(el,{type:'tel', oninput:"this._formatPhoneNumber($event)"})]);
		},
		hidden(forms, el, parentPath){
			return "";
		},
		textarea(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addTextArea(el,null)]);	
		},
		checkbox(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addCheck(el,null)],true);
		},
		radio(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addRadio(el,null)]);	
		},
		select(forms, el, parentPath){
			return forms.addSelect(el,null,parentPath);
		},
		label(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addLabel(el)],null, true);
		},
		link(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addLink(el)],null, true);
		},
		button(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addButton(el)]);
		},
		buttons(forms, el, parentPath){
			return forms.renderFieldGroupHTML(el, [forms.addButtons(el)]);		
		},
		html(forms, el, parentPath){
			return forms.addHtml(el);		
		}
}