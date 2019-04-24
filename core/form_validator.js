import { isNumber, isBoolean, isObject,isArray, isString } from "util";
import { Objects } from "./Objects";
import { empty, tryCall } from "./helpers";
import { Translate } from "./Translate";
import { Parser } from 'expr-eval';

/**
 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
 * @param {{[key:string]:any}} [data] 
 * @param {FieldTemplate[]} [template] 
 * @param {{[key:string]:any}} [errors] 
 * @param {{[key:string]:any}} [attributes]
 */
export function FormValidator(data,template,errors,attributes){
	/** @type {FormValidator} */
	var self = this;
	var _data = data || null;
	var _template = template || null;
	var _errors = errors || {};
	var _attributes = attributes || {};

	var used = [];
	var touched = [];

	var _messages = FormValidator.messages;

	if (Translate('form_validator')!=='form_validator' && isObject(Translate('form_validator'))){
		// @ts-ignore
		setMessages(Translate('form_validator'));
	}

	var _rules = FormValidator.rules;

	set_names(_template);

	/**
	 * Set _name properties in the template
	 * @param {*} obj 
	 * @param {string[]} [path]
	 */
	function set_names(obj, path){
		if (!path)
			path = [];
		if (isArray(obj))
			Objects.forEach(obj,(el)=>{
				if (el.name){
					var npath = path.slice();
					npath.push(el.name);
				}
				set_names(el, npath);
			});
	
		if (isObject(obj) && obj.name)
			obj._name = path.slice().join('.');	
		
		if (isObject(obj) && obj.type=='select')
			path.pop();	
		
		if (isObject(obj) && obj.items){
			set_names(obj.items, path.slice());
		}
	}

	this.walkElements = walkElements;
	function walkElements(obj, callback, path){
		if (!path){
			path = [];
		}

		if (isArray(obj)){
			Objects.forEach(obj,(el)=>{
				if (el.name){
					var npath = path.slice();
					npath.push(el.name);
				}
				if (walkElements(el, callback, npath) === false) return false;
			});
		}

		if (isObject(obj) && obj.name){
			if (tryCall(null, callback, obj, path.slice()) === false) return false;
		}

		if (isObject(obj) && obj.type=='select'){
			path.pop();	
		}

		if (isObject(obj) && obj.items){
			if (walkElements(obj.items, callback, path.slice())===false) return false;
		}
	}


	/**
	 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 * @param {{[key:string]:any}} data 
	 * @param {FieldTemplate[]} template 
	 * @param {{[key:string]:any}} errors 
	 * @param {{[key:string]:any}} [attributes]
	 * @return {FormValidator}
	 */
	this.set = function(data,template,errors,attributes){
		_data = data;
		_template = template;
		_errors = errors;
		_attributes = attributes;
		return self;
	}
	this.setData = function(data){
		_data = null;
		
		return self;
	}
	this.setTemplate = function(template){
		_template = null;
		
		return self;
	}
	this.setErrors = function(errors){
		_errors = null;
		return self;
	}
	this.setAttributes = function(attributes){
		_attributes = null;
		return self;
	}
	/**
	 * Messages can Use :attribute :other :min :max :date placeholders
	 * @param {{[rule:string]:string}} messages
	 */
	function setMessages (messages){
		_messages = Object.assign({}, FormValidator.messages, messages);
		return self;
	}
	this.setMessages = setMessages; 
	/**
	 *  @param {{[rule:string]:function(any, 'string'|'array'|'numeric'|'select', string[], FormValidator):boolean}} rules
	 */
	this.setRules = function(rules){
		_rules = Object.assign({}, FormValidator.rules , rules);
		return self;
	}
	/**
	 * 
	 */
	this.getMessages = function(){
		return _messages;
	}
	/**
	 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 * @return {boolean}
	 */
	this.validate = function( template ){
		template = template || _template;
		//return validate_template(_template);
		used=[];
		return validate_object( template )==0;
	}

	this.clearErrors= function(){
		used=[];
		Objects.clear(_errors);
	}

	/**
	 * Validate a single field in data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 * @return {boolean}
	 */
	this.validateField = function(name){

		if (touched.indexOf(name)<0){
			touched.push(name);
		}

		var r = 0;
		touched.forEach((n)=>{
			r += validate_field(getTemplateValue(n));
		} )

		validate_visibility(_template);
		execute_field_action(getTemplateValue(name),'setField');
		return r==0;
	}

	function parts(name){
		var p = name.split('.');
		if (p.length>1){
			return {form:p[0], name:p[1]};
		}
		return {form:null, name:p[0]};

	}

	/**
	 * Set element visibility according to displayRule
	 */
	this.validateVisibility = function(){
		validate_visibility(_template);
	}

	/**
	 * 
	 * @param {FieldTemplate|FieldTemplate[]} obj - FieldTemplate or array to validate
	 * @param {string[]} [path]
	 */
	function validate_object(obj, path){
		var e = 0;
		if (!isArray(obj) && !isObject(obj)){
			return 0;
		}	

		if (!path){
			path=[];
		}

		//object is FieldTemplate
		if (isObject(obj) && !isArray(obj)){	
			if (obj.validateRule){
				e += validate_field(obj);
			}
			//items of a form
			if (obj.type =="form" && obj.items){
				if (obj.name){
					path.push(obj.name);
				}	
				e += validate_object(obj.items,path);
			}

			//items of the select box
			if (obj.type == "select" && obj.items){
				var v = Objects.getPropertyByPath(_data, obj.name);
				Objects.forEach(obj.items,(el)=>{
					//only validate items of the selected item!
					if (el.value == v){
						e += validate_object(el.items, path);
					}
				});
			}
			//items of the selected item
			if (obj.type == undefined && obj.items){
				e += validate_object(obj.items,path);
			}
		}
		//Object is an array FieldTemplate[]
		if (isArray(obj)){	
			Objects.forEach(obj,(el)=>{
				e += validate_object(el, path);
			});
		}	
			
		return e;
	}


	/**
	 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 * @param {FieldTemplate} t 
	 * @return {number}
	 */
	function validate_field(t){
		var e =0;
		
		if (!empty(t)){
			prepField(t._name);
			var visible = !t.displayRule || empty( is_field_invalid(t,'displayRule'));
		
			if ( t.validateRule && visible){
				var err = is_field_invalid(t,'validateRule');
				if (!empty(err)){
					setValue(_errors, t._name, err);
					e++;	
				}else{
					setValue(_errors, t._name, null);
				}
			}else{
				if (!t.name.match(/\/.*\//)){
					setValue(_errors, t._name, null);
				}
			}

			//if element is visible and it has items "its a select box"
			if (visible && isArray(t.items)){
				var newOnes = [];
				var value =  Objects.getPropertyByPath(data,t._name);
				if (t.value_old != value){
					//if value of the select has changed, then delete all properties that it could have produced
					Objects.forEach(t.items,(item)=>{
						if (isArray(item.items) && item.value == value){
							Objects.forEach(item.items,(el)=>{
								newOnes.push(el);
							});
						}else if (isArray(item.items)){
							Objects.forEach(item.items,(el)=>{
								Objects.deletePropertyByPath(data, el._name);
								Objects.deletePropertyByPath(errors, el._name);
								touched = touched.filter(el2 => el2 !== el._name)
							});
						}
					});
					//initialize newly-shown fields
					newOnes.forEach((el)=>{
						if (el.value && !Objects.getPropertyByPath(data, el._name)){
							setValue(_data,el._name,el.value);
						}
						if (isArray(el.items) && el.items.length>0 && !el.placeholder && !Objects.getPropertyByPath(data, el._name)){
							Objects.setPropertyByPath(data,el._name,el.items[0].value);
						}
					})
				}		
				//remember the old value of the select box
				t.value_old = Objects.getPropertyByPath(data,t._name);
			}
		}
		return e;	
	}
	/**
	 * Execute rule 
	 * @param {FieldTemplate} t 
	 * @param {string} propname
	 */
	function execute_field_action(t,propname){
		if (!isObject(t)){
			return;
		}
		var wholerule = t[propname];
		if (empty(wholerule) || !isString(wholerule))
			return;

		var parts = wholerule.split('|');
		
		try{
			if (parts.length==2){
				var action = 'set'
				var fieldName = parts[0];
				var expr = parts[1];
			}else if (parts.length==3){
				var action = parts[0];
				var fieldName = parts[1];
				var expr = parts[2];
			}else{
				return;
			}

			switch (action){
				case 'math':
					var p = new Parser();
					var res = p.evaluate(expr, _data);
					setValue(_data, fieldName ,res);
					break;
				default:
					setValue(_data, fieldName, expr);
					
			}
		}catch(ex){
			console.log("Error evaluating "+wholerule, ex);
		}
		
	}
	/**
	 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 */
	function validate_visibility(obj,path){
		var e =0;
		if (!isArray(obj) && !isObject(obj))
			return 0;

		if (!obj.displayRule){
			Objects.forEach(obj,(el)=>{
				var key = null;
				if (obj.type =='form')
					key = obj.name;
				else 
					key = path;	
				e += validate_visibility(el,key);
			});
		}else{
			obj._name = path && obj.name.indexOf('.')==-1 ? path + "." + obj.name : obj.name;
			prepField(obj._name);
			if ( obj.displayRule ){ 
				var visible = empty(is_field_invalid(obj,'displayRule'));
				if (!visible){
					//only reset data and error values if field name is not yet hidden
					if (isAttrNull(obj._name)){
						setValue(_errors, obj._name, null);
					}
					//set hidden attribute
					setAttrValue( obj._name, {hidden:true});
				}else{
					setAttrValue( obj._name, null);
				}
			}
		}
		return e;
	}

	function prepField(name){
		var p = parts(name);
		if (p.form){
			if (!_data[p.form])
				_data[p.form]={}
			if(!_errors[p.form])
				_errors[p.form]={}
			if(!_attributes[p.form])	
				_attributes[p.form]={}
		}
	}

	/**
	 * 
	 * @param {FieldTemplate} f 
	 */
	function is_field_invalid(f, propName){
		//iterate through messages to see if any keys match rule "required|max"
		var rules= f[propName].split("|"); //split rules
		var errmsg="";
		//check if errmsg is an array and then assign a proper errormsg
		var type="string";
		
		if (rules.indexOf('array')!=-1){
			type='array';
		}
		if (rules.indexOf('number')!=-1){
			type='numeric';
		}
		if (rules.indexOf('numeric')!=-1){
			type='numeric';
		}
		if (rules.indexOf('integer')!=-1){
			type='numeric';
		}
		if (rules.indexOf('string')!=-1){
			type='string';
		}
		if (rules.indexOf('digits')!=-1){
			type='string';
		}
		

		if (type == 'string' && f.type =="select"){
			type='select';
		}
		
		//iterate through rules
		for (var r in rules) {
			var rr=rules[r].split(":");
			var conditions="";

			errmsg=_messages[rr[0]];

			if (!errmsg){
				throw new Error("Message for rule " + rr[0] +" is not present in the validation messages!");
			}

			if (rr[1] != undefined ) conditions=rr[1];
			
			//errmsg can also be an array with different messages for different data types
			errmsg= errmsg[type] || errmsg; //set default value
			if (isObject(errmsg) || errmsg['string']){
				errmsg = errmsg['string'];
			}
			var name = f._name
			var dValue = getValue(_data, name);
			//only validate fields that are either required, or not empty
			if (!empty(dValue) || rules.indexOf('accepted')>=0  || rules.indexOf('required')>=0 || rr[0]==='required_if' || rr[0]==='true_if'){

				var title = f.title;

				if (!title || (isString(title) && title.length > 25)){
					title = ""
				}

				errmsg=errmsg.replace(':attribute', title);

				var conditions_arr = conditions.split(',');
				
				var c_name = conditions_arr[0];

				var c_template = getTemplateValue( tryDefaultForm(c_name,name));
		
				if (!empty(c_template)){
					errmsg=errmsg.replace(':other', c_template.title);
					var otherFieldValue = getValue(_data,tryDefaultForm(c_name,name));
					if (c_template.items && c_template.items.length > 0){
						var otherFieldItem = Objects.find(c_template.items,(t)=>t.value==otherFieldValue)
						errmsg=errmsg.replace(':value', otherFieldItem ? otherFieldItem.title : "null");
					}else
						errmsg=errmsg.replace(':value', otherFieldValue);
				}
				if (errmsg.indexOf(':max')>=0 && errmsg.indexOf(':max')>=0){
					//min and max both present so split the condition string
					if (conditions_arr.length==2){
						errmsg=errmsg.replace(':min',conditions_arr[0]);	
						errmsg=errmsg.replace(':max',conditions_arr[1]);	
					}	
				}
				
				errmsg=errmsg.replace(':max',c_name);
				errmsg=errmsg.replace(':min',c_name);
				
				errmsg=errmsg.replace(':digits',c_name);
				errmsg=errmsg.replace(':size',c_name);

				if (errmsg.indexOf(':date')>=0){
					var otherFieldValue;
					if (!isNaN(Number(c_name))){
						otherFieldValue = Number(c_name)
					}else{
						otherFieldValue = getValue(_data, tryDefaultForm(c_name,name));
					}
					errmsg=errmsg.replace(':date',new Date(otherFieldValue).toLocaleString());
				}
			
				var result = validate_isfail(name,rr[0],type, conditions_arr);
		
				if (result){
					var err = result===true ? errmsg : errmsg.replace(':result', result);
					return err;
				}
			}

		}
		return 0;
	}

	//return true if fail validation
	/**
	 * 
	 * @param {*} name 
	 * @param {*} key 
	 * @param {*} type 
	 * @param {string[]} conditions 
	 */
	function validate_isfail(name,key,type,conditions){
		var value = getValue(_data,name);
		if (typeof(value)=='undefined') value = null;

		if (_rules[key]){
			var ret =_rules[key](value, type , conditions, self); 
			if (ret===false ||ret ===true){
				return !ret;
			}
			return ret;
		}

		throw new Error("Rule "+key +" is not present in the validation rules!");
		
		return false;
	}
	/**
	 * Get add form name from the name to cName if it does not have it yet
	 * @param {string} cName 
	 * @param {string} name 
	 */
	function tryDefaultForm(cName, name){
		var p = parts(cName);
		if (!p.form){
			var f = parts(name).form
			if (!f)
				return cName;
			return f + "." + cName;
		}
		return cName;
	}
	/**
	 * Get value at name or form.name
	 * @param {*} object
	 * @param {string} name 
	 */
	function getValue(object, name){
		name = name.replace(/\/[^\/]*\//,'');
		var p = parts(name)
		if (!p.form) {
			return object[p.name];	
		}

		return object[p.form][p.name];
	}

	this.getDataValue = function(name){
		return getValue(_data, name);
	}
	/**
	 * Get value at name or form.name
	 * @param {string} name 
	 * @return {FieldTemplate}
	 */
	function getTemplateValue(name){
		var found = null;
		function f(obj){
			Objects.forEach(obj,(el)=>{
				if (el._name === name){
					found = el;
					return false;
				}else if (isObject(el) && el.items){
					f(el.items);
				}
			});
		}
		f(_template);
		return found;
	}
	this.setValue = setValue;
	/**
	 * Set value at name or form.name
	 * @param {*} object
	 * @param {string} name 
	 * @param {*} value
	 */
	function setValue(object, name, value){
		name = name.replace(/\/[^\/]*\//,'');
		var p = parts(name)
		if (!p.form) {
			object[name] = value;	
			return;
		}

		object[p.form][p.name] = value;
	}
	/**
	 * Set value at name or form.name
	 * @param {string} name 
	 * @param {*} value
	 */
	function setAttrValue(name, value){

		var p = parts(name)
		if (!p.form) {
			_attributes[name] = value;	
			return;
		}

		_attributes[p.form][p.name] = value;
	}

	function isAttrNull(name){

		var p = parts(name)
		if (!p.form) {
			return _attributes[name] ? true : false ;	
			
		}
		return _attributes[p.form][p.name] ? true : false ;
	}
}
//default english messages. Rules for some of these are not yet implemented.
FormValidator.messages = {
	"accepted":"The :attribute must be accepted.",
	"active_url":"The :attribute is not a valid URL.",
	"after":"The :attribute must be a date after :date.",
	"alpha":"The :attribute may only contain letters.",
	"alpha_dash":"The :attribute may only contain letters, numbers, and dashes.",
	"alpha_num":"The :attribute may only contain letters and numbers.",
	"array":"The :attribute must be an array.",
	"before":"The :attribute must be a date before :date.",
	"between": {
		"number":"The :attribute must be between :min and :max.",
		"numeric":"The :attribute must be between :min and :max.",
		"file":"The :attribute must be between :min and :max kilobytes.",
		"string":"The :attribute must be between :min and :max characters.",
		"array":"The :attribute must have between :min and :max items."
	},
	"boolean":"The :attribute field must be true or false.",
	"confirmed":"The :attribute confirmation does not match.",
	"date":"The :attribute is not a valid date.",
	"date_format":"The :attribute does not match the format :format.",
	"different":"The :attribute and :other must be different.",
	"digits":"The :attribute must be :digits digits.",
	"digits_between":"The :attribute must be between :min and :max digits.",
	"distinct":"The :attribute field has a duplicate value.",
	"email":"The :attribute must be a valid email address.",
	"exists":"The selected :attribute is invalid.",
	"filled":"The :attribute field is required.",
	"image":"The :attribute must be an image.",
	"in":"The selected :attribute is invalid.",
	"in_array":"The :attribute field does not exist in :other.",
	"integer":"The :attribute must be an integer.",
	"ip":"The :attribute must be a valid IP address.",
	"json":"The :attribute must be a valid JSON string.",
	"max": {
		"number":"The :attribute may not be greater than :max.",
		"numeric":"The :attribute may not be greater than :max.",
		"file":"The :attribute may not be greater than :max kilobytes.",
		"string":"The :attribute may not be greater than :max characters.",
		"array":"The :attribute may not have more than :max items."
	},
	"mimes":"The :attribute must be a file of type: :values.",
	"min": {
		"number":"The :attribute must be at least :min.",
		"numeric":"The :attribute must be at least :min.",
		"file":"The :attribute must be at least :min kilobytes.",
		"string":"The :attribute must be at least :min characters.",
		"array":"The :attribute must have at least :min items."
	},
	"not_in":"The selected :attribute is invalid.",
	"number":"The :attribute must be a number.",
	"numeric":"The :attribute must be a number.",
	"present":"The :attribute field must be present.",
	"regex":"The :attribute has invalid characters: :result",
	"required":"The :attribute field is required.",
	"required_if":"The :attribute field is required when :other is :value.",
	"required_unless":"The :attribute field is required unless :other is in :values.",
	"required_with":"The :attribute field is required when :values is present.",
	"required_with_all":"The :attribute field is required when :values is present.",
	"required_without":"The :attribute field is required when :values is not present.",
	"required_without_all":"The :attribute field is required when none of :values are present.",
	"same":"The :attribute and :other must match.",
	"size": {
		"number":"The :attribute must be :size.",
		"numeric":"The :attribute must be :size.",
		"file":"The :attribute must be :size kilobytes.",
		"string":"The :attribute must be :size characters.",
		"array":"The :attribute must contain :size items."
	},
	"string":"The :attribute must be a string.",
	"timezone":"The :attribute must be a valid zone.",
	"true_if":"The :other must be true",
	"unique":"The :attribute has already been taken.",
	"url":"The :attribute format is invalid."
};

/** @type {{[key:string]:function(any, 'string'|'array'|'numeric'|'select', string[], FormValidator):boolean}} */
FormValidator.rules = {
	unique(value, type, conditions,  validator){
		return true;
	},
	accepted(value, type, conditions,  validator){
		return value !== "" && value != null && value != false;
	},
	required(value, type, conditions,  validator){
		if (type == "select"){
			return value !== null;
		}
		return value !== "" && value != null && value != false;
	},
	filled(value, type, conditions,  validator){
		return FormValidator.rules.required(value, type, conditions,  validator);
	},
	different(value, type, conditions,  validator){
		if (value == validator.getDataValue(conditions[0]))
			return false;

		return true;
	},	
	same(value, type, conditions,  validator){
		if (value == validator.getDataValue(conditions[0])){
			return true;
		}

		return false;
	},	
	required_if(value, type, conditions,  validator){
		var otherValue = validator.getDataValue(conditions[0]);
		conditions = conditions.slice(1);
		if (conditions.length==0 && otherValue){
			return FormValidator.rules.required(value, type, conditions, validator);  
		}
		if (conditions.length > 0){
			if (conditions.indexOf(otherValue)>=0){
				return FormValidator.rules.required(value, type, conditions, validator); 
			}
		}
		
		return true;
	},
	min(value, type, conditions,  validator){
		var otherValue = Number(conditions[0]);
		switch (type){
			case 'numeric':
				return Number(value) >= otherValue;
			case 'array':
				return true;
			case 'string':
			default:
					return (value+"").length >= otherValue;
			}
	},
	max(value, type, conditions,  validator){
		var otherValue = Number(conditions[0]);
		switch (type){
			case 'numeric':
				return Number(value) <= otherValue;
			case 'array':
				return true;
			case 'string':
			default:
				return (value+"").length <= otherValue;
			}
	},
	size(value, type, conditions, validator){
		var otherValue = Number(conditions[0]);
		switch (type){
			case 'numeric':
				return Number(value) == otherValue;
			case 'array':
				return true;
			case 'string':
			default:
				return (value+"").length == otherValue;
		}
	},
	after(value, type, conditions, validator){
		var otherValue;
		if (!isNaN(Number(conditions[0]))){
			otherValue = Number(conditions[0])
		}else{
			otherValue = validator.getDataValue(conditions[0]);
		}

		return empty(value) || new Date(value) < new Date(otherValue);
	},
	before(value, type, conditions, validator){
		var otherValue;
		if (!isNaN(Number(conditions[0]))){
			otherValue = Number(conditions[0])
		}else{
			otherValue = validator.getDataValue(conditions[0]);
		}

		return empty(value) || new Date(value) > new Date(otherValue);	
	},
	digits(value, type, conditions, validator){
		var re = new RegExp('^[0-9]{'+conditions[0]+'}$');
		return re.test(value);
	},
	digits_between(value, type, conditions, validator){
		var re = new RegExp('^[0-9]{'+conditions[0]+','+conditions[1]+'}$');
		return re.test(value);
	},
	in(value, type, conditions, validator){
		return conditions.indexOf(value)>=0;
	},
	string(value, type, conditions, validator){
		return isString(value);
	},
	boolean(value, type, conditions, validator){
		return isBoolean(value);
	},
	numeric(value, type, conditions, validator){
		return !isNaN(parseFloat(value));
	},
	integer(value, type, conditions, otherValue, validator){
		var x = parseFloat(value);
		return !isNaN(value) && (x | 0) === x;
	},
	email(value, type, conditions, validator){
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(value);
	},
	regex(value, type, conditions, validator){
		if (empty(value)) value="";
		var condition=conditions[0].replace(/^\/|\/$/g, '');
		var re = new RegExp(condition);

		if (re.test(value)==false){
			var ret = value.replace(new RegExp(condition.replace(/^\^|\*|\$$/g,''),'g'),'');
			return ret;
		}
		return true;
	},
	true_if(value, type, conditions, validator){
		var otherKey = conditions.shift();
		var otherValue = validator.getDataValue(otherKey);
		
		if (isNumber(otherValue)){
			otherValue = otherValue + '';
		}else if(isBoolean(otherValue)){
			if (otherValue===true)
				otherValue	= "true";
			else 
				otherValue	= "false";
		}

		if (conditions.indexOf(otherValue)>=0){
			return true;
		}
		if (conditions.length>0)
			//if matches no conditions, then it is NOT required
			return false;
		
		//in the end just check if the
		return !empty(otherValue);	
	}
}