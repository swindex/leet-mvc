import { isBoolean, isObject, isArray, isString } from "util";
import { Objects } from "./Objects";
import { empty, tryCall, round } from "./helpers";
import { Translate } from "./Translate";
import { Parser } from 'expr-eval';
import { isDate } from "util";
import { Text } from "./text";

const dynamicIndexSymbol = Symbol("dynamicIndexSymbol");

/**
 * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
 * @param {{[key:string]:any}} [data] 
 * @param {FieldTemplate[]} [template] 
 * @param {{[key:string]:any}} [errors] 
 * @param {{nestedData?:boolean}} [options]
 */
export function FormValidator(data, template, errors, options) {
  /** @type {FormValidator} */
  var self = this;
  var _data = data || null;
  var _template = template || null;
  var _errors = errors || {};

  var used = [];
  var touched = [];

  var _messages = FormValidator.messages;

  var _options = Object.assign({}, { nestedData: false }, options);

  if (Translate('form_validator') !== 'form_validator' && isObject(Translate('form_validator'))) {
    // @ts-ignore
    setMessages(Translate('form_validator'));
  }

  var _rules = FormValidator.rules;


  var isValid = null;
  this.isValid = null;
  this.__defineGetter__("isValid", function () {
    isValid = self.validate(false);

    return isValid;
  });

  /** @type {{[key:string]:FieldTemplate}} */
  var fields = this.fields = FormWalker.set_names(_template);

  /*Objects.forEach(fields, (_, key)=> {
    if (Objects.getPropertyByPath(data, key) == undefined)
      Objects.setPropertyByPath(data, key, null);
  });*/

  /**
   * Set _name properties in the template
   * @param {*} obj 
   * @param {string[]} [path]
   */
  this.walkElements = walkElements;

  function walkElements(obj, callback, path) {
    if (!path) {
      path = [];
    }

    if (isArray(obj)) {
      Objects.forEach(obj, (el) => {
        if (el.name) {
          var npath = path.slice();
          npath.push(el.name);
        }
        if (walkElements(el, callback, npath) === false) return false;
      });
    }

    if (isObject(obj) && obj.name) {
      if (tryCall(null, callback, obj, path.slice()) === false) return false;
    }

    if (isObject(obj) && obj.type == 'select') {
      path.pop();
    }

    if (isObject(obj) && obj.items) {
      if (walkElements(obj.items, callback, path.slice()) === false) return false;
    }
  }

  this.getVisibleData = getVisibleData;


  /**
   * Get visible data according to displayRile, and hierarchy rules.
   */
  function getVisibleData() {
    var obj = {};

    Objects.forEach(fields, (field, fieldName)=>{
      if (field.name && field.type != "form" && (!field.attributes || !field.attributes.hidden )) {
        var value = Objects.getPropertyByPath(data, field._name);
        Objects.setPropertyByPath(obj, field._name, value);
      }
    })

    return obj;
  }

  /**
   * Validate data array according to validating rules, defined in template object, errors will be written in errors object and visibility flags written in attributes object 
   * @param {{[key:string]:any}} data 
   * @param {FieldTemplate[]} template 
   * @param {{[key:string]:any}} errors 
   * @return {FormValidator}
   */
  this.set = function (data, template, errors) {
    _data = data;
    _template = template;
    _errors = errors;
    return self;
  };
  this.setData = function (data) {
    _data = null;

    return self;
  };
  this.setTemplate = function (template) {
    _template = null;

    return self;
  };
  this.setErrors = function (errors) {
    _errors = null;
    return self;
  };
  /**
   * Messages can Use :attribute :other :min :max :date placeholders
   * @param {{[rule:string]:string}} messages
   */
  function setMessages(messages) {
    _messages = Object.assign({}, FormValidator.messages, messages);
    return self;
  }
  this.setMessages = setMessages;
  /**
   *  @param {{[rule:string]:function(any, 'string'|'array'|'numeric'|'select', string[], FormValidator):boolean}} rules
   */
  this.setRules = function (rules) {
    _rules = Object.assign({}, FormValidator.rules, rules);
    return self;
  };
  /**
   * 
   */
  this.getMessages = function () {
    return _messages;
  };
  /**
   * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
   * @return {boolean}
   */
  this.validate = function (showErrors = true) {
    used = [];
    isValid = true;
    //Objects.forEach(fields, field => {
    //  if (validate_object(field, showErrors) > 0) {
    //    isValid = false;
    //  }
    //});
    if (validate_object(template, showErrors) > 0) {
      isValid = false;
    }
    return isValid;
  };

  this.validateObject = validate_object;

  this.clearErrors = function () {
    used = [];
    Objects.clear(_errors);
  };

  /**
   * Validate a single field in data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
   * @return {boolean}
   */
  this.validateField = function (name) {

    if (touched.indexOf(name) < 0) {
      touched.push(name);
    }

    var r = 0;
    touched.forEach((n) => {
      r += validate_field(getTemplateValue(n));
    });

    validate_visibility(template);
    execute_field_action(getTemplateValue(name), 'setField');
    isValid = r == 0;
    return isValid;
  };

  function parts(name) {
    var p = name.split('.');
    if (p.length > 1) {
      return { form: p[0], name: p[1] };
    }
    return { form: null, name: p[0] };

  }

  /**
   * Set element visibility according to displayRule
   */
  this.validateVisibility = function () {
    validate_visibility(template);
  };

  /**
   * Validate Object. Returns number of errors.
   * @param {FieldTemplate|FieldTemplate[]} obj - FieldTemplate or array to validate
   * @param {string[]} [path]
   * @returns {number}
   */
  function validate_object(obj, showErrors = true) {
    var e = 0;
    if (!isArray(obj) && !isObject(obj)) {
      return 0;
    }

    //object is FieldTemplate
    if (isObject(obj) && !isArray(obj)) {
      if (typeof obj.validate == "function"){
        prepField(obj._name);
        if (is_field_visible(obj))
          e+= obj.validate() ? 0 : 1;
      } 
      if (obj.validateRule) 
        e += validate_field(obj, showErrors);
      

      if (obj.items) {
        //items of the select box
        if (obj.type == "select") {
          var v = Objects.getPropertyByPath(_data, obj.name);
          Objects.forEach(obj.items, (el) => {
            //only validate items of the selected item!
            if (el.value == v) {
              e += validate_object(el.items, showErrors);
            }
          });
        } else if (obj.type) {
          //items of a form -like
          var visible = is_field_visible(obj);
          if (visible) {
            e += validate_object(obj.items, showErrors);
          }
        }

        //items of the selected item
        if (obj.type == undefined) {
          e += validate_object(obj.items, showErrors);
        }
      }
    }
    //Object is an array FieldTemplate[]
    if (isArray(obj)) {
      Objects.forEach(obj, (el) => {
        e += validate_object(el, showErrors);
      });
    }

    return e;
  }


  /**
   * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
   * @param {FieldTemplate} t 
   * @return {number}
   */
  function validate_field(t, showErrors = true) {
    var e = 0;

    if (!empty(t)) {
      prepField(t._name);
      var visible = is_field_visible(t);

      if (t.validateRule && visible) {
        var err = is_field_invalid(t, 'validateRule');
        if (!empty(err)) {
          if (showErrors)
            setValue(_errors, t._name, err);
          e++;
        } else {
          setValue(_errors, t._name, null);
        }
      } else {
        if (!t.name.match(/\/.*\//)) {
          setValue(_errors, t._name, null);
        }
      }

      //if element is visible and it has items "its a select box"
      if (visible && isArray(t.items)) {
        var newOnes = [];
        var value = Objects.getPropertyByPath(data, t._name);
        if (t.value_old != value) {
          //if value of the select has changed, then delete all properties that it could have produced
          Objects.forEach(t.items, (item) => {
            if (isArray(item.items) && item.value == value) {
              Objects.forEach(item.items, (el) => {
                newOnes.push(el);
              });
            } else if (isArray(item.items)) {
              Objects.forEach(item.items, (el) => {
                try {
                  Objects.deletePropertyByPath(data, el._name);
                  Objects.deletePropertyByPath(errors, el._name);
                } catch (ex) {

                }
                touched = touched.filter(el2 => el2 !== el._name);
              });
            }
          });
          //initialize newly-shown fields
          newOnes.forEach((el) => {
            if (el.value && !Objects.getPropertyByPath(data, el._name)) {
              setValue(_data, el._name, el.value);
            }
            if (isArray(el.items) && el.items.length > 0 && !el.placeholder && !Objects.getPropertyByPath(data, el._name)) {
              setValue(data, el._name, el.items[0].value);
            }
          });
        }
        //remember the old value of the select box
        t.value_old = Objects.getPropertyByPath(data, t._name);
      }
    }
    return e;
  }
  /**
   * Execute rule 
   * @param {FieldTemplate} t 
   * @param {string} propname
   */
  function execute_field_action(t, propname) {
    if (!isObject(t)) {
      return;
    }
    var wholerule = t[propname];
    if (empty(wholerule) || !isString(wholerule))
      return;

    var parts = wholerule.split('|');
    var expr;
    try {
      if (parts.length == 1) {
        var action = 'set';
        var fieldName = parts[0];
        expr = getValue(_data, t._name);
      } else if (parts.length == 2) {
        var action = 'set';
        var fieldName = parts[0];
        expr = parts[1];
      } else if (parts.length == 3) {
        var action = parts[0];
        var fieldName = parts[1];
        expr = parts[2];
      } else {
        return;
      }

      switch (action) {
        case 'math':
          var p = new Parser();
          var res = p.evaluate(expr, _data);
          setValue(_data, fieldName, res);
          break;
        default:
          setValue(_data, fieldName, expr);

      }
    } catch (ex) {
      console.log("Error evaluating " + wholerule, ex);
    }

  }
  /**
   * Validate data array according to validating rules, defined in template object, errors will be writtel in errors object and visibuility flags written in attributes object 
   */
  function validate_visibility(obj, path) {
    var e = 0;
    if (!isArray(obj) && !isObject(obj))
      return 0;

    if (isArray(obj)) {
      Objects.forEach(obj, (el) => {
        e += validate_visibility(el);
      });
    } else if (isObject(obj)) {
      var hidden = false;
      if (obj.displayRule) {
        //prepField(obj._name);
        hidden = !is_field_visible(obj);
        
        setElementHidden(obj, hidden);
      }
      if (!hidden && obj.items) {
        e += validate_visibility(obj.items);
      }
    }
    return e;
  }

  /**
   * Make children invisible.
   * @param {FieldTemplate} obj 
   * @param {boolean} value 
   */
  function setElementHidden(obj, value) {
    if (obj._name && fields[obj._name] && fields[obj._name].attributes){
      //if (!fields[obj._name].attributes) fields[obj._name].attributes = {}
   
      if (value){
        if (empty(fields[obj._name].attributes.hidden)) {
          setValue(_errors, obj._name, null);
        }
        fields[obj._name].attributes.hidden = true;
      } else
        delete fields[obj._name].attributes.hidden;  
    }
    if (obj && obj.items && obj.type /*if select option then do not touch its children*/) {
      Objects.forEach(obj.items, (el) => {
        setElementHidden(el, value);
      });
    }
  }

  function prepField(name) {
    if (name) {
      if (getValue(_data, name) == undefined)
        setValue(_data, name, null);
      if (!getValue(_errors, name) == undefined)
        setValue(_data, name, null);
    }
  }

  /**
   * 
   * @param {FieldTemplate} f 
   */
  function is_field_visible(f) {
    if (empty(f.displayRule)) {
      return true;
    }

    var [rule, parts] = f.displayRule.split(':');
    var otherfieldCompareValues = parts.split(',');
    var otherFieldName = otherfieldCompareValues.shift();

    var otherFieldValue = self.getDataValue(otherFieldName);
    if (otherFieldValue === undefined || otherFieldValue === null) {
      otherFieldValue = "null";
    }
    otherFieldValue = "" + otherFieldValue;

    if (rule == "true_if") {
      if (fields[otherFieldName].attributes.hidden) {
        return otherfieldCompareValues.indexOf("null") >= 0;
      }

      return otherfieldCompareValues.indexOf(otherFieldValue) >= 0;
    } else if (rule == "true_if_not") {
      if (fields[otherFieldName].attributes.hidden) {
        return otherfieldCompareValues.indexOf("null") < 0;
      }
      return otherfieldCompareValues.indexOf(otherFieldValue) < 0;
    }

  }

  function splitFirst(value, splitSeq){
    if (!value){
      return [];
    }

    var parts = value.split(splitSeq)

    var ret = [parts[0]];
    if (parts.length > 1) {
     ret.push(parts.slice(1).join(splitSeq));
    }
    return ret;
  }

  /**
   * 
   * @param {FieldTemplate} f 
   */
  function is_field_invalid(f, propName) {
    //iterate through messages to see if any keys match rule "required|max"
    var rules = f[propName].split("|"); //split rules
    var errmsg = "";
    //check if errmsg is an array and then assign a proper errormsg
    var type = "string";

    if (rules.indexOf('array') != -1) {
      type = 'array';
    }
    if (rules.indexOf('number') != -1) {
      type = 'numeric';
    }
    if (rules.indexOf('numeric') != -1) {
      type = 'numeric';
    }
    if (rules.indexOf('integer') != -1) {
      type = 'numeric';
    }
    if (rules.indexOf('string') != -1) {
      type = 'string';
    }
    if (rules.indexOf('digits') != -1) {
      type = 'string';
    }
    if (rules.indexOf('boolean') != -1) {
      type = 'boolean';
    }


    if (type == 'string' && (f.type == "select" /*|| f.type =="radio"*/)) {
      type = 'select';
    }
    if (type == 'string' && (f.type == "file")) {
      type = 'file';
    }

    //iterate through rules
    for (var r in rules) {
      var rr = splitFirst(rules[r], ":");
      var conditions = "";

      errmsg = _messages[rr[0]];

      if (!errmsg) {
        throw new Error("Message for rule " + rr[0] + " is not present in the validation messages!");
      }

      if (rr[1] != undefined) conditions = rr[1];

      //errmsg can also be an array with different messages for different data types
      errmsg = errmsg[type] || errmsg; //set default value
      if (isObject(errmsg) || errmsg['string']) {
        errmsg = errmsg['string'];
      }
      var name = f._name;
      var dValue = getValue(_data, name);
      //only validate fields that are either required, or not empty
      if (!empty(dValue) || rules.indexOf('accepted') >= 0 || rules.indexOf('required') >= 0 || rr[0] === 'required' || rr[0] === 'required_if' || rr[0] === 'true_if' || rr[0] === 'true_if_not') {

        var title = f.title;

        if (!title || (isString(title) && title.length > 25)) {
          title = "Field";
        }

        errmsg = errmsg.replace(/\:attribute([^\w]|$)/g, title);

        //split conditions by , use \\, to escape the split
        var conditions_arr = conditions.replace(/\\,/g, "~;").split(',').map(e => e.replace(/~;/g, ','));

        if (!conditions_arr)
          conditions_arr = [""];

        var c_name = conditions_arr[0];

        var c_template = getTemplateValue(tryDefaultForm(c_name, name));

        if (!empty(c_template)) {
          errmsg = errmsg.replace(/\:other([^\w]|$)/g, c_template.title);
          var otherFieldValue = getValue(_data, tryDefaultForm(c_name, name));
          if (c_template.items && c_template.items.length > 0) {
            var otherFieldItem = Objects.find(c_template.items, (t) => t.value == otherFieldValue);
            errmsg = errmsg.replace(/\:value([^\w]|$)/g, otherFieldItem ? otherFieldItem.title : "null");
          } else {
            errmsg = errmsg.replace(/\:value([^\w]|$)/g, otherFieldValue);
            errmsg = errmsg.replace(/\:max([^\w]|$)/g, otherFieldValue);
            errmsg = errmsg.replace(/\:min([^\w]|$)/g, otherFieldValue);
          }
        }



        if (conditions_arr.length == 2) {
          errmsg = errmsg.replace(/\:min([^\w]|$)/g, conditions_arr[0]);
          errmsg = errmsg.replace(/\:max([^\w]|$)/g, conditions_arr[1]);
        }

        errmsg = errmsg.replace(/\:max([^\w]|$)/g, c_name);
        errmsg = errmsg.replace(/\:min([^\w]|$)/g, c_name);

        errmsg = errmsg.replace(/\:digits([^\w]|$)/g, c_name);
        errmsg = errmsg.replace(/\:size([^\w]|$)/g, c_name);

        errmsg = errmsg.replace(/\:date([^\w]|$)/g, function(){
          var otherFieldValue;
          if (!isNaN(Number(c_name))) {
            otherFieldValue = Number(c_name);
          } else {
            otherFieldValue = getValue(_data, tryDefaultForm(c_name, name));
          }
          return new Date(otherFieldValue).toLocaleDateString()
        })

        errmsg = errmsg.replace(/\:values([^\w]|$)/g, conditions);

        var result = validate_isfail(name, rr[0], type, conditions_arr);

        if (result) {
          if (result === true) {
            var err = errmsg
          } else {
            if (errmsg.indexOf(':result')>=0){
              var err = errmsg.replace(':result', result);
            } else {
              var err = result;
            }
          }
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
  function validate_isfail(name, key, type, conditions) {
    var value = getValue(_data, name);
    if (typeof (value) == 'undefined') value = null;

    if (_rules[key]) {
      var ret = _rules[key](value, type, conditions, self, name);
      if (ret === false || ret === true) {
        return !ret;
      }
      return ret;
    }

    throw new Error("Rule " + key + " is not present in the validation rules!");

    return false;
  }
  /**
   * Get add form name from the name to cName if it does not have it yet
   * @param {string} cName 
   * @param {string} name 
   */
  function tryDefaultForm(cName, name) {
    var p = parts(cName);
    if (!p.form || !_options.nestedData) {
      var f = parts(name).form;
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
  function getValue(object, name) {
    try {
      return Objects.getPropertyByPath(object, name);
    } catch (ex) {
      return undefined;
    }
  }

  this.getDataValue = function (name, cName = "") {
    return getValue(_data, tryDefaultForm(name, cName));
  };
  /**
   * Get value at name or form.name
   * @param {string} name 
   * @return {FieldTemplate}
   */
  function getTemplateValue(name) {
    return fields[name];
  }
  this.setValue = setValue;
  /**
   * Set value at name or form.name
   * @param {*} object
   * @param {string} name 
   * @param {*} value
   */
  function setValue(object, name, value) {
    Objects.setPropertyByPath(object, name, value);
  }
}
//default english messages. Rules for some of these are not yet implemented.
FormValidator.messages = {
  "accepted": "The :attribute must be accepted.",
  "active_url": "The :attribute is not a valid URL.",
  "after": "The :attribute must be a date after :date.",
  "alpha": "The :attribute may only contain letters.",
  "alpha_dash": "The :attribute may only contain letters, numbers, and dashes.",
  "alpha_num": "The :attribute may only contain letters and numbers.",
  "array": "The :attribute must be an array.",
  "before": "The :attribute must be a date before :date.",
  "between": {
    "number": "The :attribute must be between :min and :max.",
    "numeric": "The :attribute must be between :min and :max.",
    "file": "The :attribute must be between :min and :max kilobytes.",
    "string": "The :attribute must be between :min and :max characters.",
    "array": "The :attribute must have between :min and :max items."
  },
  "boolean": "The :attribute must be true or false.",
  "confirmed": "The :attribute confirmation does not match.",
  "date": "The :attribute is not a valid date.",
  "date_format": "The :attribute does not match the format :format.",
  "different": "The :attribute and :other must be different.",
  "digits": "The :attribute must be :digits digits.",
  "digits_between": "The :attribute must be between :min and :max digits.",
  "distinct": "The :attribute has a duplicate value.",
  "email": "The :attribute must be a valid email address.",
  "exists": "The selected :attribute is invalid.",
  "filled": "The :attribute is required.",
  "image": "The :attribute must be an image.",
  "in": "The selected :attribute is invalid.",
  "in_array": "The :attribute does not exist in :other.",
  "integer": "The :attribute must be an integer.",
  "ip": "The :attribute must be a valid IP address.",
  "json": "The :attribute must be a valid JSON string.",
  "max": {
    "number": "The :attribute may not be greater than :max.",
    "numeric": "The :attribute may not be greater than :max.",
    "file": "The :attribute may not be greater than :max kilobytes.",
    "string": "The :attribute may not be greater than :max characters.",
    "array": "The :attribute may not have more than :max items."
  },
  "mimes": "The :attribute must be a file of type: :values.",
  "min": {
    "number": "The :attribute must be at least :min.",
    "numeric": "The :attribute must be at least :min.",
    "file": "The :attribute must be at least :min kilobytes.",
    "string": "The :attribute must be at least :min characters.",
    "array": "The :attribute must have at least :min items."
  },
  "not_in": "The selected :attribute is invalid.",
  "number": "The :attribute must be a number.",
  "numeric": "The :attribute must be a number.",
  "present": "The :attribute must be present.",
  "regex": "The :attribute is not valid. :result",

  "required": "The :attribute is required.",
  "required_if": "The :attribute is required when :other is :value.",
  "required_unless": "The :attribute is required unless :other is in :values.",
  "required_with": "The :attribute is required when :values is present.",
  "required_with_all": "The :attribute is required when :values is present.",
  "required_without": "The :attribute is required when :values is not present.",
  "required_without_all": "The :attribute is required when none of :values are present.",
  "same": "The :attribute and :other must match.",
  "size": {
    "number": "The :attribute must be :size.",
    "numeric": "The :attribute must be :size.",
    "file": "The :attribute must be :size kilobytes.",
    "string": "The :attribute must be :size characters.",
    "array": "The :attribute must contain :size items."
  },
  "string": "The :attribute must be a string.",
  "timezone": "The :attribute must be a valid zone.",
  "unique": "The :attribute has already been taken.",
  "url": "The :attribute format is invalid.",
  "isValid": "The :attribute is invalid."
  //"phone":"The :attribute format is invalid."
};

/** @type {{[key:string]:function(any, 'string'|'array'|'numeric'|'select', string[], FormValidator, string):boolean}} */
FormValidator.rules = {
  unique(value, type, conditions, validator) {
    return true;
  },
  accepted(value, type, conditions, validator) {
    return value !== "" && value != null && value != false;
  },
  required(value, type, conditions, validator, name) {
    var msg = conditions[0] || false;
    if (type == "select") {
      return value !== null ? true : msg;
    }
    if (type == "boolean") {
      return (value !== null && value !== undefined) ? true : msg;
    }
    if (type == "file") {
      return (!empty(value) && !empty(value.name)) ? true : msg;
    }
    if (validator.fields[name].attributes.isValid != undefined) {
      //return validator.fields[name].attributes.isValid
    }
    
    return (value !== "" && value != null && value != false) ? true : msg;
  },
  filled(value, type, conditions, validator) {
    return FormValidator.rules.required(value, type, conditions, validator);
  },
  different(value, type, conditions, validator) {
    if (value == validator.getDataValue(conditions[0]))
      return false;

    return true;
  },
  same(value, type, conditions, validator) {
    if (value == validator.getDataValue(conditions[0])) {
      return true;
    }

    return false;
  },
  required_if(value, type, conditions, validator) {
    var otherValue = validator.getDataValue(conditions[0]);
    conditions = conditions.slice(1);
    if (conditions.length == 0 && otherValue) {
      return FormValidator.rules.required(value, type, conditions, validator);
    }
    if (conditions.length > 0) {
      if (conditions.indexOf(otherValue) >= 0) {
        return FormValidator.rules.required(value, type, conditions, validator);
      }
    }

    return true;
  },
  min(value, type, conditions, validator) {
    var otherValue;
    if (!isNaN(Number(conditions[0]))) {
      otherValue = Number(conditions[0]);
    } else {
      otherValue = validator.getDataValue(conditions[0]);
    }
    switch (type) {
      case 'numeric':
        return Number(value) >= otherValue;
      case 'array':
        return true;
      case 'file':
        return (!empty(value) && !empty(value.size)) ? round(Number(value.size) / 1024) >= otherValue : false;
      case 'string':
      default:
        return (value + "").length >= otherValue;
    }
  },
  mimes(value, type, conditions, validator) {
    if (empty(value) || empty(value.name)) {
      return false;
    }
    var chVal = "";
    if (type == "file") {
      chVal = Text.fileExtension(value.name);
    } else {
      chVal = value;
    }

    
    
    return conditions.indexOf(Text.toString(chVal).toLowerCase()) >= 0;
  },
  max(value, type, conditions, validator) {
    var otherValue;
    if (!isNaN(Number(conditions[0]))) {
      otherValue = Number(conditions[0]);
    } else {
      otherValue = validator.getDataValue(conditions[0]);
    }
    switch (type) {
      case 'numeric':
        return Number(value) <= otherValue;
      case 'array':
        return true;
      case 'file':
        return (!empty(value) && !empty(value.size)) ? round(Number(value.size) / 1024) <= otherValue : false;
      case 'string':
      default:
        return (value + "").length <= otherValue;
    }
  },
  size(value, type, conditions, validator) {
    var otherValue = Number(conditions[0]);
    switch (type) {
      case 'numeric':
        return Number(value) == otherValue;
      case 'array':
        return true;
      case 'file':
        return (!empty(value) && !empty(value.size)) ? round(Number(value.size) / 1024) == otherValue : false;
      case 'string':
      default:
        return (value + "").length == otherValue;
    }
  },
  after(value, type, conditions, validator) {
    var otherValue;
    if (!isNaN(Number(conditions[0]))) {
      otherValue = Number(conditions[0]);
    } else {
      otherValue = validator.getDataValue(conditions[0]);
    }

    return empty(value) || new Date(value) > new Date(otherValue);
  },
  before(value, type, conditions, validator) {
    var otherValue;
    if (!isNaN(Number(conditions[0]))) {
      otherValue = Number(conditions[0]);
    } else {
      otherValue = validator.getDataValue(conditions[0]);
    }

    return empty(value) || new Date(value) < new Date(otherValue);
  },
  date(value, type, conditions, validator) {
    return isDate(value);
  },
  digits(value, type, conditions, validator) {
    var re = new RegExp('^[0-9]{' + conditions[0] + '}$');
    return re.test(value);
  },
  digits_between(value, type, conditions, validator) {
    var re = new RegExp('^[0-9]{' + conditions[0] + ',' + conditions[1] + '}$');
    return re.test(value);
  },
  in(value, type, conditions, validator) {
    return conditions.indexOf(value) >= 0;
  },
  string(value, type, conditions, validator) {
    return isString(value);
  },
  boolean(value, type, conditions, validator) {
    return isBoolean(value);
  },
  numeric(value, type, conditions, validator) {
    return !isNaN(parseFloat(value));
  },
  integer(value, type, conditions, validator) {
    var x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
  },
  email(value, type, conditions, validator) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },

  isValid(value, type, conditions, validator, name) {
    return validator.fields[name].attributes.isValid;
  },

  /*phone(value, type, conditions, validator){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },*/
  regex(value, type, conditions, validator) {
    if (empty(value)) value = "";
    var condition = conditions[0].replace(/^\/|\/$/g, '');
    var re = new RegExp(condition);

    if (re.test(value) == false) {
      return conditions[1] ? conditions[1] : "";
    }
    return true;
  },
};

export const FormWalker = {
  /**
   * Walk the fieldTemplate array setting fully-qualified _name properties
   * Returns a flat representation of the template that should be used for binding to the view
   * @param {FieldTemplate[]} obj 
   * @return {{[key:string]:FieldTemplate}}
   */
  set_names(obj) {
    var keyed = {};
    var index = 1;

    function combinePath(prev, next){
      var ret = [];
      if (prev) ret.push(prev)
      if (next) ret.push(next)
  
      return ret.join('.');
    }
    
    function set_names_int(obj, path) {
      var hasSet = false;
      if (!path) {
        path = "";
      }

      if (isArray(obj)) {
        Objects.forEach(obj, function (el) {
          if (set_names_int(el, path)) {
            hasSet = true;
          }
        });
      } else if (isObject(obj)) {
        if (!obj._name && obj.name) {
          obj._name = (path != "" ? path + "." : "") + obj.name;
        }
        if (obj.type && !obj._name && (obj.displayRule || obj.validateRule || obj.value)) {
          obj._name = "__dynamic__" + (index++); // GUID(); //form and arrays do noyt get postable dynamic name!
        }
        if (obj._name) {
          keyed[obj._name] = obj;
          if (!keyed[obj._name].attributes) {
            keyed[obj._name].attributes = {};
          }
        }

        if (obj.items && !obj.type && obj.value) {
          //it is select option with items!

          if (set_names_int(obj.items, obj.value)) {
            hasSet = true;
          }
        }

        if (obj.items && obj.type == "select") {
          if (obj.items.length > 0) {

            Objects.forEach(obj.items, function (option) {
              if (option.items && option.items.length > 0) {
                //give option a name now
                option._name = "__dynamic__" + (index++);
                option.displayRule = `true_if:${(path != "" ? path + "." : "") + obj.name},${option.value}`;
                option.attributes = {};
                keyed[option._name] = option;

                if (set_names_int(option.items)) {
                  hasSet = true;
                }

              }
            });
          }
        } else if (obj.type && obj.items) {
          if (set_names_int(obj.items, combinePath(path, obj.name))) {
            hasSet = true;
          }
        }
      }
      return hasSet;
    }
    index = obj[dynamicIndexSymbol] || 1;
    set_names_int(obj);
    obj[dynamicIndexSymbol] = index;
    return keyed;
  },

  /**
	 * Walk object calling callback on every node
	 * @param {object} obj1 
	 */
  getVibleData(obj1) {
    if (isObject(obj1) && callback(obj1, i) !== false) {
      for (var i in obj1) {
        if (obj1.hasOwnProperty(i) && isObject(obj1[i])) {
          Objects.walk(obj1[i], callback);
        }
      }
    }
  },
};