import { Text } from "./text";
import { Objects } from "./Objects";
import { FormValidator } from "./form_validator";

/**
 * @constructor
 * 
 * @param {JQuery<HTMLElement>} parentElement - title to display on the dialog
 */
export function FormGenerator(parentElement) {
	/** @type {FormGenerator} this */
	var self = this;

	parentElement = $(parentElement);

	var fieldCount = 0;
	/** @type {{[x:string]:JQuery}} */
	var fieldGroups = {};
	/** @type {{[x:string]:JQuery}} */
	var fields = {};
	var hints = {};
	var dataTypes = {};
	/** @type {GenFormData} */
	var data =  {data:{},errors:{},hints:{},attr:{}};
	/** @type {FormTemplate} */
	var keyedForm = null;

	/**
	 * Remove field by name or index (if no name was specified)
	 * @param {string|number} name 
	 */
	this.removeField = function(name) {
		if (fields[name]) {
			fields[name].closest('div').remove();
			delete fields[name];
		}
		if (hints[name]) {
			hints[name].remove();
			delete hints[name];
		}
	}
	/** @return {GenFormData} */
	this.getData= function(){
		return _getData();
	}

	/**
	 * Set container element name
	 * @param {JQuery<HTMLElement>} element - title to display on the dialog
	 */
	this.setContainerElement = function(element){
		parentElement = $(element);
	}

	/** @return {FieldData} */
	this.getFormData= function(){
		var d = _getData().data;
		var ret={};
		$.each(keyedForm,function(i,el){
			ret[el.name]=d[el.name];
		});
		return ret;
	}
	function _getData() {
		
		//data = {data:{},errors:{},hints:{},attr:{}};
		$.each(fields, function (key, val) {
			data.data[key] = getElemValue(val);
			if (dataTypes[key] =='number'){
				data.data[key] = Number(data.data[key]);
				if (isNaN(data.data[key]))
					data.data[key] = null;
			}
			if (dataTypes[key] == 'boolean')
				data.data[key] = data.data[key]=='true' ||  data.data[key]==true;	
		});
	
		return data;
	}
	this.update = function(){
		_setData();
	}
	function _setData() {
		if (empty(data)) return;

		$.each(data.data, function (key, val) {
			if (empty(fieldGroups[key])) return;
			if (data.attr[key] && data.attr[key].hidden===true){
				fieldGroups[key].slideUp();
			}else{
				fieldGroups[key].slideDown();
			}

			if (typeof fields[key] !== 'undefined')
				setElemValue(fields[key], val);

			if (typeof hints[key] !== 'undefined') {
				var t =  data.errors && data.errors[key] ? data.errors[key] : (data.hints && data.hints[key] ? data.hints[key] : "");
				hints[key].text(t);

				t ? hints[key].show() : hints[key].hide();

				if (data.errors[key]){
					fields[key].addClass("error");
					hints[key].addClass("error");
				}else{
					fields[key].removeClass("error");
					hints[key].removeClass("error");
				}
			}
		});
	}
	/** @param {JQuery} el*/
	function getElemValue(el) {
		switch (el.attr('type')) {
			case 'checkbox':
			case 'radio':
				return el.prop('checked')
			default:
				if (el[0].nodeName =='SELECT'){
					return el.find(`:selected`).val();
				}else{
					return el.val();
				}
		}
	}
	/** @param {JQuery} el*/
	function setElemValue(el, val) {
		switch (el.attr('type')) {
			case 'checkbox':
			case 'radio':
				el.prop('checked', val)
				break;
			default:
				if (el[0].nodeName =='SELECT'){
					el.find(`option`).prop('selcted',null);
					el.find(`option[value='${val}']`).prop('selected',true);
				}else{
					el.val(val);
				}
				break;
		}
	}

	/**
	 * Add Input field to the dialog
	 * @param {string} prompt
	 * @param {string|number} [value]
	 * @param {string} [hint]
	 * @param {Object.<string, any>} [inputOptions]
	 */
	this.addInput = function (prompt, value, hint, inputOptions) {
		hint = hint || "";

		var opt = { type: "text", required: false, value: empty(value) ? "" : value, placeholder: "" };
		$.extend(opt, inputOptions);

		if (opt.type == 'date') {
			opt.type = 'text';
			opt.calendar = "";
			opt.readonly = "";
		}
		if (opt.type == 'datetime') {
			opt.type = 'text';
			opt.calendartimepicker = "";
			opt.readonly = "";
		}
		self._appendControl(prompt, 'input', opt,null,hint);
		
		if (opt.type=='number' && opt.name)
			dataTypes[opt.name] = "number";

		fieldCount++;
		return this;
	}
	/**
	 * Add checkbox field to the dialog
	 * @param {string} prompt
	 * @param {boolean} [value]
	 * @param {string} [hint]
	 * @param {Object.<string, any>} [inputOptions]
	 */
	this.addCheck = function (prompt, value, hint, inputOptions) {
		hint = hint || "";

		var opt = { type: "checkbox", required: false, checked: empty(value) ? null : true };
		$.extend(opt, inputOptions);

		self._appendCheckbox(prompt, 'input', opt, "toggle", hint);

		fieldCount++;
		return this;
	}
	this.addTextArea = function (prompt, value, hint, inputOptions) {
		hint = hint || "";

		var opt = { required: false, placeholder: "" };
		$.extend(opt, inputOptions);

		var c = self._appendControl(prompt, 'textarea', opt, 'stacked',hint);
		c.val(value)

		fieldCount++;
		return this;
	}
	/**
	 * 
	 * @param {string} prompt 
	 * @param {string|number} value 
	 * @param {string} hint 
	 * @param {{value:string|number,text:string|number}[]} selectOptions 
	 * @param {*} inputOptions 
	 */
	this.addSelect = function (prompt, value, hint, selectOptions, inputOptions) {

		hint = hint || "";

		var opt = { type: "text", required: false, value: empty(value) ? "" : value, placeholder: "" };
		$.extend(opt, inputOptions);

		var ctrl = self._appendControl(prompt, 'select', opt);

		var allNumeric = true;
		var hasSelected = false;

		//ctrl.append($(`<option value="">${opt.placeholder}</option>`));
		if (opt.placeholder)
			ctrl.append($('<option/>', {text:opt.placeholder}));
		$.each(selectOptions, function (index, option) {
			if (typeof option.value != 'number' && option.value!==null)
				allNumeric=false;
			if (value === option.value){
				option['selected'] = true;
				hasSelected = true;
				ctrl.find('option').first().prop('selected',null);
			}
			ctrl.append($('<option/>', option));
		});
		if (allNumeric && opt.name)
			dataTypes[opt.name] = "number";

		//if (hasSelected){
		//	ctrl.first();
		//}	
		fieldCount++;
		return this;
	}
	/**
	 * Append fieldgroup with control to message 
	 * @param {string} tag - html tag 
	 * @param {*} opt - element parameters
	 * @param {string}  [addClass] - additional classname to add to fieldgroup
	 * @param {string}	[hint] - initial hint value
	 * @returns {JQuery}
	 */
	this._appendControl = function (prompt, tag, opt, addClass, hint) {
		addClass = addClass || "";

		var el = $(`<div class='fieldgroup ${addClass}'></div>`);

		var strOpts = "";
		var attEvents = {};
		$.each(opt, function (key, val) {
			if (key !== "input" && key !== "click" && key !== "change") {
				if (val !== null)
					strOpts += key + '="' + val + '" ';
			} else
				attEvents[key] = val;
		});
		el.append(`<label>${prompt}</label>`);

		var control = $(`<${tag} ${strOpts}>`);

		// attach any events that we found
		var self = this;
		$.each(attEvents, function (key, eventHandler) {
			$(control).on(key, function (evt) {
				eventHandler(evt);
				_setData();
			})
		});
		if (!empty(opt.name)){
			fieldGroups[!empty(opt.name) ? opt.name : fieldCount] = el;
			fields[!empty(opt.name) ? opt.name : fieldCount] = control;
		}

		$(el).append(control);
		if( opt.type === "checkbox"){
			$(el).append('<span class="slider round"></span>');
		}
		$(el).append(this._appendHint(opt.name,hint));
		parentElement.append(el);

		return control;
	}
	/**
	 * Append fieldgroup with control to message 
	 * @param {string} tag - html tag 
	 * @param {*} opt - element parameters
	 * @param {string}  [addClass] - additional classname to add to fieldgroup
	 * @param {string}	[hint] - initial hint value
	 * @returns {JQuery}
	 */
	this._appendCheckbox = function (prompt, tag, opt, addClass, hint) {
		addClass = addClass || "";

		var el = $(`<div class='fieldgroup'></div>`);

		var strOpts = "";
		var attEvents = {};
		$.each(opt, function (key, val) {
			if (key !== "input" && key !== "click" && key !== "change") {
				if (val !== null)
					strOpts += key + '="' + val + '" ';
			} else
				attEvents[key] = val;
		});
		var control = $(`<label class='${addClass}'>${prompt}<${tag} ${strOpts}><span class="slider round"></span></label>`);

		// attach any events that we found
		var self = this;
		$.each(attEvents, function (key, eventHandler) {
			control.find('input').on(key, function (evt) {
				eventHandler(evt);
				_setData();
			})
		});
		if (!empty(opt.name)){
			fieldGroups[!empty(opt.name) ? opt.name : fieldCount] = el;
			fields[!empty(opt.name) ? opt.name : fieldCount] = control.find('input');
		}

		$(el).append(control);

		$(el).append(this._appendHint(opt.name,hint));
		parentElement.append(el);

		return control.find('input');
	}
	this._appendHint = function (name, hint) {
		var hntWr = $(`<div class='hint' style="display:${(hint ? 'block' : 'none')}">${hint}</div>`);
		if (!empty(name))
			hints[!empty(name) ? name : fieldCount] = hntWr;
		return hntWr;
	}
	/**
	 * Add Button to the dialog
	 * @param {string} prompt
	 * @param {string} title
	 * @param {string} hint
	 * @param {function(GenFormData)} callback - fired when button is clicked. Return false to stop dialog from closing
	 */
	this.addButton = function (prompt, title, hint, callback) {
		var self = this;
		hint = hint || "";

		var opt = { type: "button", required: false, value: empty(title) ? "" : title};
		if (typeof callback === "function") {
			opt.click = callback;
		}
		var button = self._appendControl(prompt,'input',opt,hint);
		return this;
	}
	this.addLabel = function (prompt, value) {
		value = Text.escapeHTML(value);
		parentElement.append(`<div class="fieldgroup ">
			<label>${prompt}</label><span class='value'>${value}</span>
			</div>`);

		return this;
	}

	this.addHtml = function (html) {
		parentElement.append($(`<div class="fieldgroup">${html}</div>`));
		return this;
	}
	this.addElement = function (element) {
		parentElement.append(element);
		return this;
	}

	var formValidator;
	/**
	 * Generate fields using template
	 * @param {FieldTemplate[]} formTemplate
	 * @param {FieldData} formData
	 */
	this.generateForm = function(formTemplate,formData){
		keyedForm = formTemplate ;// Objects.keyBy(formTemplate,'name');
		for(var i in formTemplate){
			var el = formTemplate[i];
			
			self.removeField(el.name);
			var attr = $.extend({},el);
			switch (el.type){
				case "email":
				case "text":
					self.addInput(el.title,formData[el.name],null,{name: el.name, placeholder: el.placeholder, change:  validateField });
					break;
				case "password":
					self.addInput(el.title,formData[el.name],null,{name: el.name, placeholder: el.placeholder, change:  validateField, type:'password'});
					break;
				case "number":
					self.addInput(el.title,formData[el.name],null,{name: el.name, placeholder: el.placeholder, change:  validateField, type:'number'});
					break;
				case "phone":
					self.addInput(el.title,formData[el.name],null,{name: el.name, placeholder: el.placeholder, change:  validateField, input:function(evt){
						var d = _getData().data;

						var el  = evt.target;

						d[el.name] = formatPhone(el.value,{3:'-',6:'-'});
					}});
					break;
				case "checkbox":
					self.addCheck(el.title,formData[el.name],null,{name: el.name, placeholder: el.placeholder, change: validateField});
					break;
				case "select":
					self.addSelect(el.title,formData[el.name],null,el.items,{name: el.name, placeholder: el.placeholder, change:  validateField});
					break;
			}
		}
	
		formValidator = new FormValidator;
		_getData();
		formValidator.set(data.data, keyedForm, data.errors, data.attr);
		formValidator.validateVisibility();
		_setData();

	}

	function validateField(el){
		_getData();
		formValidator.set(data.data, keyedForm, data.errors, data.attr);

		var val = formValidator.validateField(el.target.name);
		_setData();
		return val;
	}	

	function validateForm(){
		_getData();
		formValidator.set(data.data, keyedForm, data.errors, data.attr);

		var val = formValidator.validate();
		formValidator.validateVisibility();
		_setData();
		return val;
	}	
	
	this.validateForm = validateForm;
	/**
	 * Format phone number while typing
	 * @param {string} text - phone number to format
	 * @param {object} [mask] - default: { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' };
	 */
	function formatPhone(text, mask) {
		var numbers = text.replace(/\D/g, '');
		mask = mask || { 0: '(', 3: ') ', 6: ' - ', 10: ' x ' };
		text = '';
		for (var i = 0; i < numbers.length; i++) {
			text += (mask[i] || '') + numbers[i];
		}
		return text;
	}

}		