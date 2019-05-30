import { Objects } from "./../core/Objects";
import { FormValidator } from "./../core/form_validator";
import { Text } from "./../core/text";
import { BaseComponent } from "./BaseComponent";
import { isNumber, isArray, isString } from "util";
import { DateTime } from "./../core/DateTime";
import { Translate } from "../core/Translate";


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

		this.options =  {nestedData:false, formClass:'formgroup', fieldClass:'fieldgroup'};
		$.extend(this.options, options);

		
		this.attributes = attributes || {};
		this.attrEvents = {};
		this.types={};

		this.validator = new FormValidator(this.data,formTemplate,this.errors,this.attributes);
		this.validator.validateVisibility();
		
		this.events = {
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
					this.onChange(ev);
				},0);
			},
		}

		this.html = this.renderArray(this.formTemplate, null)

	}
	
	/** 
	 * @param {HTMLInputElementChangeEvent} event
	 */
	onChange(event){

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

		switch (el.type){
			case "form":
				return this.addForm(el,parentPath /*? parentPath +'.' +el.name : el.name*/ );
			case "email":
				this.assertValidateRuleHas(el,"email");
				return this.renderFieldGroupHTML(el, [this.addInput(el,{type:'email'})]);
			case "file":
				//this.assertValidateRuleHas(el,"file");
				return this.renderFieldGroupHTML(el, [this.addFile(el)]);
			case "text":
				return this.renderFieldGroupHTML(el, [this.addInput(el,null)]);
			case "date":
				return this.renderFieldGroupHTML(el, [this.addInput(el,{date:'', format:'date'})]);	
			case "datetime":
				return this.renderFieldGroupHTML(el, [this.addInput(el,{dateTime:'', format:'dateTime'})]);	
			case "time":
				return this.renderFieldGroupHTML(el, [this.addInput(el,{time:'', format:'time'})]);	
			case "date-time":
				var dateEl = $.extend({}, el);
				var timeEl = $.extend({}, el);
				
				//dateEl.name += "_date";
				//dateEl.__name = dateEl._name;
				dateEl._name += "_date";
				//timeEl.name += "_time";
				//timeEl.__name += timeEl._name;
				
				timeEl._name += "_time";
				
				
				var dateTime = Objects.getPropertyByPath(this.data, el._name)
				Objects.setPropertyByPath(this.extraData, dateEl._name, dateTime);
				Objects.setPropertyByPath(this.extraData, timeEl._name, dateTime);
				
				return this.renderFieldGroupHTML(el,  [
					'<div class="split" style="width:60%">' + this.addInput(dateEl, {date:'', format:'date', onchange:"this._formatSplitDateField($event,'"+ el._name+ "',false)"},'extraData')+ '</div>',
					'<div class="split" style="width:40%">' + this.addInput(timeEl, {time:'', format:'time', onchange:"this._formatSplitDateField($event,'"+ el._name+ "',true)"},'extraData')+ '</div>',
				]);	
			case "number":
				this.assertValidateRuleHas(el,"numeric");
				return this.renderFieldGroupHTML(el, [this.addInput(el,{type:'number', pattern:"[0-9]*", novalidate: true})]);
			case "password":
				return this.renderFieldGroupHTML(el, [this.addPassword(el,null)]);
			case "phone":
				return this.renderFieldGroupHTML(el, [this.addInput(el,{type:'tel', oninput:"this._formatPhoneNumber($event)"})]);
			case "hidden":
				return "";
			case "textarea":
				return this.renderFieldGroupHTML(el, [this.addTextArea(el,null)]);	
			case "checkbox":
				return this.renderFieldGroupHTML(el, [this.addCheck(el,null)],true);
			case "radio":
				return this.addRadio(el,null);
			case "select":
				return this.addSelect(el,null,parentPath);
			case "label":
				return this.renderFieldGroupHTML(el, [this.addLabel(el)],null, true);
			case "link":
				return this.renderFieldGroupHTML(el, [this.addLink(el)],null, true);
			case "button":
				return this.renderFieldGroupHTML(el, [this.addButton(el)]);
			case "buttons":
				return this.renderFieldGroupHTML(el, [this.addButtons(el)]);		
			case "html":
				return this.addHtml(el);		
			default:
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

	renderFormHTML(el, childrenHTML){
		return `
			<div class="${this.options.formClass}">
				${this.addTitle(el)}
				<div>
				${childrenHTML}
				</div>
			</div>
			`;
	}

	renderFieldGroupHTML(el, elHTML, noTitle, noErrorHint){
		return `
		<div class="${this.options.fieldClass} ${el.class ?' '+ el.class:''}" [if]="!this.attributes${this.refactorAttrName(el._name)} || !this.attributes${this.refactorAttrName(el._name)}.hidden">
			${(noTitle ? '' : this.addTitle(el))}
			${isArray(elHTML) ? elHTML.join('') : elHTML}
			${(noErrorHint ? '' : this.addErrorHint(el))}
		</div>`; 
	}

	renderSelectGroupHTML(el, elHTML){
		return `<div [if]="!this.attributes${this.refactorAttrName(el._name)} || !this.attributes${this.refactorAttrName(el._name)}.hidden">${elHTML}</div>`; 
	}

	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 * @param {string} [dataName] name of the data property
	 */
	addInput(el, override, dataName){
		
		dataName = dataName || "data"
		var opt = { name: el.name , type: "text", placeholder: el.placeholder };
		
		$.extend(opt, override, el.attributes);
		return ( `
			<input bind="this.${dataName}${this.refactorAttrName(el._name)}" ${this.generateAttributes(opt)} />`+
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
		var opt = { name: el.name , type: "file", placeholder: el.placeholder };
		
		$.extend(opt, override, el.attributes);
		return ( `
			<label class="field">{{ this.trimDisplayFileName(this.${dataName}${this.refactorAttrName(el._name)}) || '${Translate('Select File')}' }}<input bind="this.${dataName}${this.refactorAttrName(el._name)}" ${this.generateAttributes(opt)} /></label>`+
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
			<input bind="this.data${this.refactorAttrName(el._name)}" ${this.generateAttributes(opt)} [attribute]="{type: this.types['${el._name}']}"/>`+
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
				<label class="toggle">${item.title}
					<input bind = "this.data${this.refactorAttrName(el._name)}" format="${el.dataType ? el.dataType : ''}" value = "${item.value !==null ? item.value : '' }" ${this.generateAttributes(opt)} />
					<span class="slider round"></span>
				</label>
			`);
		});

		return this.renderFieldGroupHTML(
			el,
			(`
				${this.addTitle(el)}
				${elems}
				${this.addErrorHint(el)}
			`)
			, true,true);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addSelect(el, override,parentPath){

		var opt = { name: el._name, type: "select", bind: `this.data${this.refactorAttrName(el._name)}`, placeholder:el.placeholder};
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
			${this.addTitle(el)}
			${elem}
			${this.addErrorHint(el)}
		`), true,true) + this.renderSelectGroupHTML(el, items_items);
	}

	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addTitle(el){
		if (!el.title) return '';
		return `<label>${Translate(el.title)}</label>`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addErrorHint(el){
		return `<div class="hint" [class]="this.errors${this.refactorAttrName(el._name)} ? 'error' : ''">{{ this.errors${this.refactorAttrName(el._name)} || '${ el.hint ? el.hint : '' }' }}</div>`
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
	addLabel(el){
		var opt = $.extend({}, { }, el.attributes);
		return (`
			<div class="label" ${this.generateAttributes(opt)} >${(el.value != null ? el.value : "")}</div>`	+
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
		return el.value;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addLink(el){
		var opt = $.extend({}, { }, el.attributes);
		return (`
			<div class="link" ${this.generateAttributes(opt)} >${(el.value != null ? el.value : "")}</div>`	+
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
		var opt = $.extend({}, { }, el.attributes);
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

	trimDisplayFileName(fileName){
		if (!fileName || !isString(fileName)){
			return "";
		}
		return fileName.split(/\\|\//).pop();
	}
}
