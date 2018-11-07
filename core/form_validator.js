import { isNumber, isBoolean, isObject,isArray, isString } from "util";
import { Objects } from "./Objects";
import { empty } from "./helpers";
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
	 * 
	 * @param {*} messages 
	 */
	this.setMessages = function(messages){
		_messages = messages;
		return self;
	}
	/**
	 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 * @return {boolean}
	 */
	this.validate = function(){
		//return validate_template(_template);
		used=[];
		return validate_object(_template)==0;
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

	function validate_object(obj, path){
		var e = 0;
		if (!isArray(obj) && !isObject(obj))
			return 0;

		if (!path)
			path=[];

		if (obj.validateRule){
			e += validate_field(obj);
		}
		//items of a form
		if (obj.type =="form" && obj.items){
			if (obj.name)
				path.push(obj.name);
			e += validate_object(obj.items,path);
		}

		//items of the select box
		if (obj.type == "select" && obj.items){
			var v = Objects.getPropertyByPath(_data, obj.name);
			Objects.forEach(obj.items,(el)=>{
				//only validate items of the selected item!
				if (el.value == v)
					e += validate_object(el, path);
			});
		}
		//items of the selected item
		if (obj.type == undefined && obj.items){
			e += validate_object(obj.items,path);
		}

		if (isArray(obj))	
			Objects.forEach(obj,(el)=>{
				e += validate_object(el, path);
			});
			
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
				if (!t.name.match(/\/.*\//))
					setValue(_errors, t._name, null);
			}

			//if element is visible and it has items "its a select box"
			if (visible && isArray(t.items)){
				var newOnes = [];
				var value =  Objects.getPropertyByPath(data,t._name);
				if (/*t.value_old != undefined && */t.value_old != value){
					//if value of the select has changed, then delete all properties that it could have produced
					Objects.forEach(t.items,(item)=>{
						if (isArray(item.items) && item.value == value){
							Objects.forEach(item.items,(el)=>{
								newOnes.push(el);
							});
						}else if (isArray(item.items)){
							Objects.forEach(item.items,(el)=>{
								Objects.deletePropertyByPath(data, el.name);
								Objects.deletePropertyByPath(errors, el.name);
								touched = touched.filter(el2 => el2 !== el.name)
							});
						}
					});
					//initialize newly-shown fields
					newOnes.forEach((el)=>{
						if (el.value && !Objects.getPropertyByPath(data, el.name)){
							setValue(_data,el.name,el.value);
						}
						if (isArray(el.items) && el.items.length>0 && !el.placeholder && !Objects.getPropertyByPath(data, el.name)){
							Objects.setPropertyByPath(data,el.name,el.items[0].value);
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
		var wholerule = t[propname];
		if (empty(wholerule) || !isString(wholerule))
			return;

		var parts = wholerule.split('|');
		if (parts.length!=2)
			return
		try{
			var  p = new Parser();
			var res = p.evaluate(parts[1], _data);
			setValue(_data, parts[0],res);
		}catch(ex){
			console.log("Error evaluating "+wholerule,ex);
		}
		
	}
	/**
	 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
	 */
	function validate_visibility(obj,path){
		var e =0;
		var vis = [];
		var hid = [];
		
		var e = 0;

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
		if (typeof(errmsg) != "string"){
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
		}

		if (type == 'string' && f.type =="select"){
			type='select';
		}

		//iterate through rules
		for (var r in rules) {
			var rr=rules[r].split(":");
			var condition="";
			if (_messages[rr[0]] != undefined ) {
				errmsg=_messages[rr[0]];
				if (rr[1] != undefined ) condition=rr[1];
				
				errmsg= errmsg[type] || errmsg; //set default value
				var name = f.name
				var dValue = getValue(_data, name);
				//only validate fields that are either required, or not empty
				if (!empty(dValue) || rules.indexOf('required')>=0 || rr[0]==='required_if' || rr[0]==='true_if' ){
					var err = null;
					var title = f.title;
					if (isString(title) && title.length > 25)
						title = ""
					errmsg=errmsg.replace(':attribute', title);

					var c_name = condition.split(',')[0];
			
					var c_template = getTemplateValue( tryDefaultForm(c_name,name));
			
					if (!empty(c_template)){
						errmsg=errmsg.replace(':other', c_template.title);
						var c_v = getValue(_data,tryDefaultForm(c_name,name));
						if (c_template.items && c_template.items.length > 0){
							var c_vv = Objects.find(c_template.items,(t)=>t.value==c_v)
							errmsg=errmsg.replace(':value', c_vv ? c_vv.title : "null");
						}else
							errmsg=errmsg.replace(':value', c_v);
					}
					if (errmsg.indexOf(':max')!=-1 && errmsg.indexOf(':max')!=-1){
						//min and max both present so split the condition string
						if (condition.indexOf(',')){
							errmsg=errmsg.replace(':min',condition.substr(0,condition.indexOf(',')));	
							errmsg=errmsg.replace(':max',condition.substr(condition.indexOf(',')+1));	
						}	
					}else{
						errmsg=errmsg.replace(':max',condition);
						errmsg=errmsg.replace(':min',condition);
					}
					errmsg=errmsg.replace(':digits',condition);
					errmsg=errmsg.replace(':size',condition);
					

					var result = validate_isfail(name,rr[0],type,condition)
			
					if (result){
						err = result===true ? errmsg : errmsg.replace(':result', result);;
					}
					//
					if (!empty(err)){
						return err;
					}
				}
			}
		}
		return 0;
	}

	function isInt(value) {
		var x = parseFloat(value);
		return !isNaN(value) && (x | 0) === x;
	}
	//return true if fail validation
	/**
	 * 
	 * @param {*} name 
	 * @param {*} key 
	 * @param {*} type 
	 * @param {string} condition 
	 */
	function validate_isfail(name,key,type,condition){
		var value = getValue(_data,name);
		var o_val = value;
		if (typeof(value)=='undefined')value="";
		switch (key){
			case 'unique':
				return false;
				break;
			case 'required':
				switch (type){
					case "select":
						return value===null;
					default :
						return value==="" || value===null;
				}
			case 'different':	
				var otherKeys = condition.split(',');
				
				var foundSame = false;
				Objects.forEach(otherKeys, (otherKey, i)=>{
					var otherValue = getValue(_data, tryDefaultForm(otherKey,name));
						if (otherValue == value)
							foundSame = true
				});
				
				//in the end just check if the
				return otherValue !== "" && otherValue !==null && foundSame ? true : false;	
				break;				
			case 'required_if':
				var conditions = condition.split(',');
				var otherKey = conditions.shift();
				var otherValue = getValue(_data, tryDefaultForm(otherKey,name));
				
				if (isNumber(otherValue)){
					otherValue = otherValue + '';
				}else if(isBoolean(otherValue)){
					if (otherValue===true)
						otherValue	= "true";
					else 
						otherValue	= "false";
				}

				if (conditions.indexOf(otherValue)>=0){
					//if otherValue matches any conditions, then check if this value is not null
					//return false;
					return value==="" || value===null;
				}
				if (conditions.length>0)
					//if matches no conditions, then it is NOT required
					return false;
				
				//in the end just check if the
				return otherValue !== "" && otherValue !==null && (value==="" || value===null) ? true : false;	
				break;
			case 'true_if':
				var conditions = condition.split(',');
				var otherKey = conditions.shift();
				var otherValue = getValue(_data, tryDefaultForm(otherKey,name));
				
				if (isNumber(otherValue)){
					otherValue = otherValue + '';
				}else if(isBoolean(otherValue)){
					if (otherValue===true)
						otherValue	= "true";
					else 
						otherValue	= "false";
				}

				if (conditions.indexOf(otherValue)>=0){
					//if otherValue matches any conditions, then check if this value is not null
					return false;
				}
				if (conditions.length>0)
					//if matches no conditions, then it is NOT required
					return true;
				
				//in the end just check if the
				return otherValue == "" || otherValue == null;	
				break;			
			case 'digits':
				var re = new RegExp('^[0-9]{'+condition+'}$');
				return re.test(value)==false;
				break;
			case 'digits_between':
				var re = new RegExp('^[0-9]{'+condition+'}$');
				return re.test(value)==false;
				break;	
			case 'in':
				condition=condition.replace(/,/g,'|');
				var re = new RegExp('^'+condition+'*$');
				return re.test(value)==false;
				break;			
			case 'integer' :
				return !isInt(value);	
			case 'string' :
				return false;
			case 'size':
				switch (type){
					case "array":
						return false;
						break;
					case "numeric":
						return Number(value) != Number(condition);
						break;
					/*case "file":
						return $('[name="'+name+'"]').files[0].size >condition;
						break;*/
					case "string":
					default:
						return value===null || value.length != Number(condition);
				} 
				break;	
			case 'max':
				switch (type){
					case "array":
						return false;
						break;
					case "numeric":
						return Number(value) > Number(condition);
						break;
					/*case "file":
						return $('[name="'+name+'"]').files[0].size >condition;
						break;*/
					case "string":
					default:
						return !empty(value) && value.length > condition;
				} 
				break;
			case 'min':
				switch (type){
					case "array":
						return false;
						break;
					case "numeric":
						return Number(value) < Number(condition);
						break;
					/*case "file":
						return $('[name="'+name+'"]').files[0].size < condition;
						break;*/
					case "string":
					default:
						return empty(value) || value.length < condition;
				} 
				break;
			case 'email':
				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(value)==false;
				break;
			case 'regex':
				condition=condition.replace(/^\/|\/$/g, '');
				var re = new RegExp(condition);
				var repl = new RegExp('/'+condition+'/g');

				if (re.test(value)==false){
					var ret = value.replace(new RegExp(condition.replace(/^\^|\*|\$$/g,''),'g'),'');
					return ret || true;
				}
				break;
			case 'same':
				return getValue(_data,  tryDefaultForm(condition, name)) !=value;
					
				break;
			default:
				return false;	

		}
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
	//default english messages
	var _messages ={
		"accepted": Translate("The :attribute must be accepted."),
		"active_url":Translate("The :attribute is not a valid URL."),
		"after":Translate("The :attribute must be a date after :date."),
		"alpha":Translate("The :attribute may only contain letters."),
		"alpha_dash":Translate("The :attribute may only contain letters, numbers, and dashes."),
		"alpha_num":Translate("The :attribute may only contain letters and numbers."),
		"array":Translate("The :attribute must be an array."),
		"before":Translate("The :attribute must be a date before :date."),
		"between": {
			"number":Translate("The :attribute must be between :min and :max."),
			"numeric":Translate("The :attribute must be between :min and :max."),
			"file":Translate("The :attribute must be between :min and :max kilobytes."),
			"string":Translate("The :attribute must be between :min and :max characters."),
			"array":Translate("The :attribute must have between :min and :max items.")
		},
		"boolean":Translate("The :attribute field must be true or false."),
		"confirmed":Translate("The :attribute confirmation does not match."),
		"date":Translate("The :attribute is not a valid date."),
		"date_format":Translate("The :attribute does not match the format :format."),
		"different":Translate("The :attribute and :other must be different."),
		"digits":Translate("The :attribute must be :digits digits."),
		"digits_between":Translate("The :attribute must be between :min and :max digits."),
		"distinct":Translate("The :attribute field has a duplicate value."),
		"email":Translate("The :attribute must be a valid email address."),
		"exists":Translate("The selected :attribute is invalid."),
		"filled":Translate("The :attribute field is required."),
		"image":Translate("The :attribute must be an image."),
		"in":Translate("The selected :attribute is invalid."),
		"in_array":Translate("The :attribute field does not exist in :other."),
		"integer":Translate("The :attribute must be an integer."),
		"ip":Translate("The :attribute must be a valid IP address."),
		"json":Translate("The :attribute must be a valid JSON string."),
		"max": {
			"number":Translate("The :attribute may not be greater than :max."),
			"numeric":Translate("The :attribute may not be greater than :max."),
			"file":Translate("The :attribute may not be greater than :max kilobytes."),
			"string":Translate("The :attribute may not be greater than :max characters."),
			"array":Translate("The :attribute may not have more than :max items.")
		},
		"mimes":Translate("The :attribute must be a file of type: :values."),
		"min": {
			"number":Translate("The :attribute must be at least :min."),
			"numeric":Translate("The :attribute must be at least :min."),
			"file":Translate("The :attribute must be at least :min kilobytes."),
			"string":Translate("The :attribute must be at least :min characters."),
			"array":Translate("The :attribute must have at least :min items.")
		},
		"not_in":Translate("The selected :attribute is invalid."),
		"number":Translate("The :attribute must be a number."),
		"numeric":Translate("The :attribute must be a number."),
		"present":Translate("The :attribute field must be present."),
		"regex":Translate("The :attribute has invalid characters: :result"),
		"required":Translate("The :attribute field is required."),
		"required_if":Translate("The :attribute field is required when :other is :value."),
		"required_unless":Translate("The :attribute field is required unless :other is in :values."),
		"required_with":Translate("The :attribute field is required when :values is present."),
		"required_with_all":Translate("The :attribute field is required when :values is present."),
		"required_without":Translate("The :attribute field is required when :values is not present."),
		"required_without_all":Translate("The :attribute field is required when none of :values are present."),
		"same":Translate("The :attribute and :other must match."),
		"size": {
			"number":Translate("The :attribute must be :size."),
			"numeric":Translate("The :attribute must be :size."),
			"file":Translate("The :attribute must be :size kilobytes."),
			"string":Translate("The :attribute must be :size characters."),
			"array":Translate("The :attribute must contain :size items.")
		},
		"string":Translate("The :attribute must be a string."),
		"timezone":Translate("The :attribute must be a valid zone."),
		"true_if":Translate("The :other must be true"),
		"unique":Translate("The :attribute has already been taken."),
		"url":Translate("The :attribute format is invalid.")
	}
}
