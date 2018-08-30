import { Objects } from "./../core/Objects";
import { FormValidator } from "./../core/form_validator";
import { Text } from "./../core/text";
import { BaseComponent } from "./BaseComponent";

/**
 * Forms Directive. Generate forms from JSON data
 * @param {FieldTemplate[]} formTemplate 
 * @param {*} [dataName]
 * @param {*} [errorsName]
 * @param {{navButtons?: true,submitButton?:boolean,pagination?:true, navigation?:boolean}} [options]
 * @return {{html: string, swiper: Swiper, validator: FormValidator,methods:{init:function(),slideToInvalid: function()}}}
 */
export class Forms extends BaseComponent{

	constructor(formTemplate, data, errors, formClass){
		super()
		this.formTemplate = formTemplate;
		this.data = data;
		this.errors = errors;
		this.formClass = formClass;
		
		this.attributes = {};
		
		this.validator = new FormValidator(this.data,formTemplate,this.errors,this.attributes);
		this.validator.validateVisibility();
		
		if (Objects.filter(formTemplate,(el)=>{return el.type =='form' }).length>0){

			Objects.forEach(formTemplate,(form)=>{
				if (!this.data[form.name])
					this.data[form.name]={};
				if (!this.errors[form.name])
					this.errors[form.name]={};
				if (!this.attributes[form.name])
					this.attributes[form.name]={};
			})
		}

		this.events = {
			change:(ev)=>{
				//validate element on change
				if (ev.target.name){
					/** @type {string} */
					var p = Objects.getPropertyByPath(this.data,ev.target.name);
					if (typeof p == 'string')
						Objects.setPropertyByPath(this.data, ev.target.name, p.trim());
					this.validator.validateField(ev.target.name);
					this.binder.updateElements();
				}
				this.onChange(ev);
			},
			click:(ev)=>{
				this.onClick(ev);
			},

		}

		this.html = this.render(this.formTemplate, null)

	}
	
	/** 
	 * @param {HTMLInputElementChangeEvent} event
	 */
	onChange(event){

	}

	/** 
	 * @param {HTMLElementMouseEvent} event
	 */
	onClick(event){

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
	render(formTemplate, formName){
		var html = [];

		for(var i in formTemplate){
			var el = formTemplate[i];
			if (el.type){
				if (el.type!=='form'){
					if (formName)
						el._name = formName + "." + el.name;
					html.push(`<div class="fieldgroup" [if]="!this.attributes${this.refactorAttrName(el._name)} || !this.attributes${this.refactorAttrName(el._name)}.hidden">`);
				}
				html.push(this.render_field(el,formName));
				
				if (el.type!=='form')
					html.push('</div>')
			}
		}
		return html.join('');
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {string} formName 
	 */
	render_field(el,formName){
		switch (el.type){
			case "form":
				return this.addForm(el,null);
			case "email":
				this.assertValidateRuleHas(el,"email");
				return this.addInput(el,{type:'email'},formName);
			case "text":
				return this.addInput(el,null,formName);
			case "date":
				return this.addInput(el,{date:''},formName);	
			case "dateTime":
				return this.addInput(el,{dateTime:''},formName);	
			case "time":
				return this.addInput(el,{time:''},formName);	
			case "number":
				this.assertValidateRuleHas(el,"number");
				return this.addInput(el,{type:'number'},formName);
			case "password":
				return this.addInput(el,{type:'password', autocorrect:"off", autocapitalize:"off"},formName);
			case "phone":
				return this.addInput(el,{type:'tel', oninput:"this._formatPhoneNumber($event)"},formName);
			case "hidden":
				return this.addInput(el,{type:'hidden'},formName);	
			case "checkbox":
				return this.addCheck(el,null,formName);
			case "select":
				return this.addSelect(el,null,formName);
			case "label":
				return this.addLabel(el,null,formName);
			case "link":
				return this.addLink(el,null,formName);
			case "button":
				return this.addButton(el,null,formName);
			case "buttons":
				return this.addButtons(el,null,formName);		

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
	 * @param {KeyValuePair} [override]
	 */
	addForm(el, override){
		//var opt = { type: "text", required: false, value: empty(value) ? "" : value, placeholder: "" };
		//$.extend(opt, inputOptions);
		var elem = this.render(el.items, el.name);
		return `
		<div class="${this.formClass} formgroup">
			<h1>${el.title}</h1>
			<div>
			${elem}
			</div>
		</div>
		`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addInput(el, override,formName){
		
		var opt = { name: el._name, type: "text" };
		
		$.extend(opt, override);
		//var elem = $('<input />',opt).attr('bind',`this.data.${el._name}`)[0].outerHTML;
		//var elem = `<input bind="this.data.${el._name}" ${generateAttributes(opt)} />`;
		if (el.value)
			Objects.setPropertyByPath(this.data, el._name, el.value);
		return `
			`+(el.title ? `<label>${el.title}</label>` : ``)+`
			<input bind="this.data.${el._name}" ${this.generateAttributes(opt)} />
			<div class="hint" bind="this.errors.${el._name}" [class]="this.errors.${el._name} ? 'error' : ''"></div>
		`;
	}
	
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addCheck(el, override,formName){


		var opt = { name: el._name, type: "checkbox" };
		$.extend(opt, override);
		var elem = $('<input />',opt).attr('bind',`this.data.${el._name}`)[0].outerHTML;
		return `
			<label class="toggle">${el.title}
			${elem}
			<span class="slider round"></span>
			</label>
			<div class="hint" bind="this.errors.${el._name}" [class]="this.errors.${el._name} ? 'error' : ''"></div>
		`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addSelect(el, override,formName){

		var opt = { name: el._name, type: "select", bind: `this.data.${el._name}`};
		$.extend(opt, override);
		var elem = `<select ${this.generateAttributes(opt)}>`;
		if (el.placeholder)
			elem = elem+ `<option value="">${el.placeholder}</option>`;

		var items_items = "";	
		$.each(el.items,  (index, option)=>{
			elem = elem+ `<option value="${option.value}">${option.title}</option>`;
			if (option.items){
				items_items += `<div [if]="this.data.${el._name} == ${option.value}">` + this.render(option.items,formName) + `</div>`;
			}
		});
		elem = elem + "</select>";

		

		return `
			<label>${el.title}</label>
			${elem}
			<div class="hint" bind="this.errors.${el._name}" [class]="this.errors.${el._name} ? 'error' : ''"></div>
		` + items_items;
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
	addLabel(el, override,formName){

		var opt = { name: el._name, type: "checkbox" };
		$.extend(opt, override);
		return `
		<div class="label">
			<label name="${el._name}">${el.title}</label>
		</div>
		`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addLink(el, override,formName){
		var opt = { name: el._name, type: "checkbox" };
		$.extend(opt, override);
		return `
		<div class="label" [if]="!this.attributes${this.refactorAttrName(el._name)} || !this.attributes${this.refactorAttrName(el._name)}.hidden">
			<label class="link" bind name="${el._name}">${el.title}</label>
		</div>
		`;
	}
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addButton(el, override,formName){

		return `
			<button class="link" bind name="${el._name}">${el.title}</button>
		`;
	}	
	/**
	 * 
	 * @param {FieldTemplate} el 
	 * @param {KeyValuePair} [override]
	 */
	addButtons(el, override,formName){
		if (formName)
			el._name = formName + "." + el._name;


		var items = el.items.map(function(btn){
			return `<button class="link" bind name="${btn.name}">${btn.title}</button>`
		});	
			
		return `
		<div class="buttons">
			${items.join('')}
		</div>
		`;
	}		
	generateAttributes(opt){
		var strOpts="";
		$.each(opt, function (key, val) {
			//if (key !== "input" && key !== "click" && key !== "change") {
				if (val !== null)
					strOpts += key + '="' + val + '" ';
			//} else
			//	attEvents[key] = val;
		});
		return strOpts;
	}
}
