import { Objects } from "./../core/Objects";
import { FormValidator } from "./../core/form_validator";
import { Text } from "./../core/text";
import { BaseComponent } from "./BaseComponent";
import { isNumber } from "util";

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
		this.errors = errors ||{};

		this.options =  {nestedData:false, formClass:'formgroup', fieldClass:'fieldgroup'};
		$.extend(this.options, options);

		
		this.attributes = attributes || {};
		this.attrEvents = {};
		this.types={};

		this.validator = new FormValidator(this.data,formTemplate,this.errors,this.attributes);
		this.validator.validateVisibility();
		
		/*if (Objects.filter(formTemplate,(el)=>{return el.type =='form' }).length>0){

			Objects.forEach(formTemplate,(form)=>{
				if (!this.data[form.name])
					this.data[form.name]={};
				if (!this.errors[form.name])
					this.errors[form.name]={};
				if (!this.attributes[form.name])
					this.attributes[form.name]={};
			})
		}*/

		this.events = {
			change:(ev)=>{
				//validate element on change
				if (ev.target.name){
					/** @type {string} */
					var p = Objects.getPropertyByPath(this.data,ev.target.name);
					//if (typeof p == 'string')
					//	Objects.setPropertyByPath(this.data, ev.target.name, p.trim());
					this.validator.validateField(ev.target.name);
					this.binder.updateElements();
				}
				this.onChange(ev);
			},
			/*click:(ev)=>{
				this.onClick(ev);
			},*/

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
	
	_formatPhoneNumber(evt){
		var el  = evt.target;
		var selS = el.selectionStart;
		var selE = el.selectionStart;
		var old = el.value
		//setTimeout(function(){
			el.value = Text.formatPhone(el.value,{3:'-',6:'-',10:'x'}/*{3:'-',6:'-'}/**/);
			var dif = el.value.length - old.length;
			el.selectionStart = selS+dif;
			el.selectionEnd = selE+dif;
		//},1);
	}	
	
	/**
	 * 
	 * @param {FieldTemplate[]} formTemplate 
	 */
	renderArray(formTemplate, parentPath){
		var html = [];

		for(var i in formTemplate){
			var el = formTemplate[i];
			if (el.type){
				if (el.name == null || el.name==undefined){
					//throw new Error('Form Element '+ JSON.stringify(el)+' can not have empty name!')
					el.name = i;
				}
				//do we support nested data?
				if (!this.options.nestedData){
					parentPath = null;
				}
	
				if(parentPath){
					this.createDataPath(parentPath,{})
					el._name = parentPath + "." + el.name ;
				}else{
					el._name = el.name;
				}
				this.createDataPath(el._name,null);
				var ret = this.render_field(el,parentPath);
				if (ret){
					html.push(ret);
				}
			}
		}
		return html.join('');
	}

	createDataPath(path, value){
		if ( ! Objects.getPropertyByPath(this.data, path)){
			Objects.setPropertyByPath(this.data, path, value);
		}
		if ( ! Objects.getPropertyByPath(this.errors, path)){
			Objects.setPropertyByPath(this.errors, path, value);
		}
		if ( ! Objects.getPropertyByPath(this.attributes, path)){
			Objects.setPropertyByPath(this.attributes, path, value);
		}
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
				return this.addForm(el,parentPath ? parentPath +'.' +el.name : el.name );
			case "email":
				this.assertValidateRuleHas(el,"email");
				return this.addInput(el,{type:'email'});
			case "text":
				return this.addInput(el,null);
			case "date":
				return this.addInput(el,{date:'', format:'date', /*readonly:''*/});	
			case "datetime":
				return this.addInput(el,{dateTime:'', format:'dateTime', /*readonly:''*/});	
			case "time":
				return this.addInput(el,{time:'', format:'time', /*readonly:''*/});	
			case "number":
				this.assertValidateRuleHas(el,"number");
				return this.addInput(el,{type:'number'});
			case "password":
				return this.addPassword(el,null);
			case "phone":
				return this.addInput(el,{type:'tel', oninput:"component._formatPhoneNumber($event)"});
			case "hidden":
				return "";
			case "textarea":
				return this.addTextArea(el,null);	
			case "checkbox":
				return this.addCheck(el,null);
			case "select":
				return this.addSelect(el,null,parentPath);
			case "label":
				return this.addLabel(el,null);
			case "link":
				return this.addLink(el,null);
			case "button":
				return this.addButton(el);
			case "buttons":
				return this.addButtons(el);		
			case "html":
				return this.addHtml(el);			

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
		//var opt = { type: "text", required: false, value: empty(value) ? "" : value, placeholder: "" };
		//$.extend(opt, inputOptions);
		var elem = this.renderArray(el.items, parentPath);
		return `
		<div class="${this.options.formClass}">
			<label>${el.title}</label>
			<div>
			${elem}
			</div>
		</div>
		`;
	}

	wrapInFieldGroup(el, elHTML, fieldGroupClass){
		return `<div class="${this.options.fieldClass} ${fieldGroupClass}" [if]="!component.attributes${this.refactorAttrName(el._name)} || !component.attributes${this.refactorAttrName(el._name)}.hidden">${elHTML}</div>`; 
	}

	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addInput(el, override){
		
		
		var opt = { name: el._name, type: "text", placeholder: el.placeholder };
		
		$.extend(opt, override, el.attributes);
		return this.wrapInFieldGroup(el, `
			`+(el.title ? `<label>${el.title}</label>` : ``)+`
			<div class="icon-field">
				<input bind="component.data.${el._name}" ${this.generateAttributes(opt)} />
				<div class="icon">
					${el.unit ? el.unit :''}
					${el.icon ? `<i class="${el.icon}"></i>` :''}
				</div>	
			</div>	
			<div class="hint" bind="component.errors.${el._name}" [class]="component.errors.${el._name} ? 'error' : ''"></div>
		`);
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
		return this.wrapInFieldGroup(el,`
			`+(el.title ? `<label>${el.title}</label>` : ``)+`
			<div class="icon-field">
				<input bind="component.data.${el._name}" ${this.generateAttributes(opt)} [attribute]="{type: component.types['${el._name}']}"/>
				<div class="icon" onclick="component.togglePasswordType('${el._name}')">
					<i class="fas fa-eye" [if]="component.types['${el._name}']=='password'"></i>
					<i class="fas fa-eye-slash" [if]="component.types['${el._name}']=='text'"></i>
				</div>	
			</div>	
			<div class="hint" bind="component.errors.${el._name}" [class]="component.errors.${el._name} ? 'error' : ''"></div>
		`);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addTextArea(el, override){
		
		var opt = { name: el._name, type: "text" };
		
		$.extend(opt, override, el.attributes);
		return this.wrapInFieldGroup(el,`
			`+(el.title ? `<label>${el.title}</label>` : ``)+`
			<textarea bind="component.data.${el._name}" ${this.generateAttributes(opt)}></textarea>
			<div class="hint" bind="component.errors.${el._name}" [class]="component.errors.${el._name} ? 'error' : ''"></div>
		`);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addCheck(el, override){


		var opt = { name: el._name, type: "checkbox" };
		$.extend(opt, override, el.attributes);
		return this.wrapInFieldGroup(el,`
			<label class="toggle">${el.title}
			<input bind="component.data.${el._name}" ${this.generateAttributes(opt)} />
			<span class="slider round"></span>
			</label>
			<div class="hint" bind="component.errors.${el._name}" [class]="component.errors.${el._name} ? 'error' : ''"></div>
		`);
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addSelect(el, override,parentPath){

		var opt = { name: el._name, type: "select", bind: `component.data.${el._name}`, placeholder:el.placeholder};
		$.extend(opt, override, el.attributes);
		var elem = `<select ${this.generateAttributes(opt)}>`;
		if (el.placeholder)
			elem = elem+ `<option>${el.placeholder}</option>`;

		var items_items = "";	
		$.each(el.items,  (index, option)=>{
			elem = elem+ `<option value="${ option.value===null ? '' : option.value }">${option.title}</option>`;
			if (option.items){
				items_items += `<div [if]="component.data.${el._name} == ${(isNumber(option.value)|| option.value==null ? option.value : "'"+option.value+"'")}">` + this.renderArray(option.items,parentPath) + `</div>`;
			}
		});
		elem = elem + "</select>";

		

		return this.wrapInFieldGroup(el,`
			<label>${el.title}</label>
			${elem}
			<div class="hint" bind="component.errors.${el._name}" [class]="component.errors.${el._name} ? 'error' : ''"></div>
		`) + items_items;
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
	 * @param {KeyValuePair} [override]
	 */
	addLabel(el, override){

		var opt = { name: el._name, class:"label" };
		$.extend(opt, override, el.attributes);
		return this.wrapInFieldGroup(el,
			(el.title ? `<label>${el.title}</label>` : '')+`
			<div>${(el.value != null ? el.value : "")}</div>
		`,'label');
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
	 * @param {KeyValuePair} [override]
	 */
	addLink(el, override){
		var opt = { name: el._name,  class:"label"  };
		$.extend(opt, override, el.attributes);
		return this.wrapInFieldGroup(el,`
			<label class="link" bind name="${el._name}">${el.title}</label>
		`,'label');
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 */
	addButton(el){

		return this.wrapInFieldGroup(el,`
			<button class="link" bind name="${el._name}" onclick="component.onButtonClick($event);">${el.title}</button>
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
			
		return this.wrapInFieldGroup(el,`
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
				strOpts += 'on'+key + `="component.attrEvents['${name}']['${key}']()"`;
			}
		});
		return strOpts;
	}
}
